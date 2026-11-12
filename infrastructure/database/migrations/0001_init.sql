-- 9ja Vote initial schema (PostgreSQL 17). DESIGN DRAFT for review: not yet wired to the API.
-- Principles: no voter register, no biometrics, identity and ballot choice never share a table or key.

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;

CREATE TYPE election_type AS ENUM ('PRESIDENTIAL','SENATE','HOUSE_OF_REPRESENTATIVES','GOVERNORSHIP','STATE_HOUSE_OF_ASSEMBLY');
CREATE TYPE geo_level AS ENUM ('POLLING_UNIT','WARD','LGA','STATE','NATIONAL');
CREATE TYPE result_status AS ENUM ('AWAITING_SUBMISSION','SUBMITTED','RECEIVED','UNDER_VERIFICATION','VERIFIED','DISPUTED','OFFICIALLY_DECLARED');
CREATE TYPE data_source AS ENUM ('SYNTHETIC_DEMO','INEC_AUTHORISED');
CREATE TYPE admin_role AS ENUM ('SUPER_ADMINISTRATOR','ELECTION_ADMINISTRATOR','DATA_MANAGER','RESULTS_VERIFICATION_OFFICER','SUPPORT_OFFICER','READ_ONLY_AUDITOR');

-- Accounts ---------------------------------------------------------------
CREATE TABLE users (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email         citext UNIQUE NOT NULL,
  phone         text UNIQUE,
  password_hash text NOT NULL,                 -- argon2id
  display_name  text NOT NULL,
  locale        text NOT NULL DEFAULT 'en',
  status        text NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','SUSPENDED','DELETED')),
  created_at    timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE users IS 'Platform accounts only. Holding an account does NOT make someone a registered voter.';

CREATE TABLE sessions (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  refresh_token_hash text NOT NULL UNIQUE,
  device_label       text,
  ip                 inet,
  created_at         timestamptz NOT NULL DEFAULT now(),
  expires_at         timestamptz NOT NULL,
  revoked_at         timestamptz
);
CREATE INDEX sessions_user_idx ON sessions(user_id);

CREATE TABLE admin_accounts (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL UNIQUE REFERENCES users(id),
  role        admin_role NOT NULL,
  mfa_secret_encrypted bytea,                  -- envelope-encrypted with KMS key
  mfa_enrolled_at timestamptz,
  suspended_at timestamptz,
  created_by  uuid REFERENCES admin_accounts(id)
);
COMMENT ON TABLE admin_accounts IS 'No seeded administrators. The first is created by a one-off, audited bootstrap command.';

-- Demonstration identity verification (synthetic records only) -------------
CREATE TABLE demo_identity_verifications (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider    text NOT NULL DEFAULT 'SYNTHETIC',
  synthetic_reference text NOT NULL,           -- e.g. DEMO-VIN-0001; never a real NIN/VIN
  outcome     text NOT NULL CHECK (outcome IN ('PASSED','FAILED','PENDING')),
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Reference data -----------------------------------------------------------
CREATE TABLE geo_units (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  level     geo_level NOT NULL,
  code      text NOT NULL,
  name      text NOT NULL,
  parent_id uuid REFERENCES geo_units(id),
  UNIQUE (level, code)
);
CREATE INDEX geo_units_parent_idx ON geo_units(parent_id);

CREATE TABLE elections (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title        text NOT NULL,
  type         election_type NOT NULL,
  election_date date NOT NULL,
  scope_geo_id uuid REFERENCES geo_units(id),
  source       data_source NOT NULL DEFAULT 'SYNTHETIC_DEMO',
  source_reference text NOT NULL,
  -- Real-election participation cannot be switched on by data alone:
  real_voting_enabled boolean NOT NULL DEFAULT false CHECK (real_voting_enabled = false)
);

CREATE TABLE parties (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL UNIQUE,
  abbreviation  text NOT NULL UNIQUE,
  symbol_url    text,
  description   text,
  verification_status text NOT NULL CHECK (verification_status IN ('SYNTHETIC','UNVERIFIED','VERIFIED_AGAINST_INEC')),
  source_reference text NOT NULL,
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE candidates (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  election_id  uuid NOT NULL REFERENCES elections(id),
  party_id     uuid NOT NULL REFERENCES parties(id),
  constituency_geo_id uuid REFERENCES geo_units(id),
  full_name    text NOT NULL,
  running_mate text,
  manifesto_url text,
  verification_status text NOT NULL CHECK (verification_status IN ('SYNTHETIC','UNVERIFIED','VERIFIED_AGAINST_INEC')),
  source_reference text NOT NULL,
  updated_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (election_id, party_id, constituency_geo_id)
);

-- Pending edits to official information: maker/checker approval -------------
CREATE TABLE change_requests (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity       text NOT NULL,
  entity_id    uuid,
  proposed     jsonb NOT NULL,
  requested_by uuid NOT NULL REFERENCES admin_accounts(id),
  approved_by  uuid REFERENCES admin_accounts(id),
  status       text NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','APPROVED','REJECTED')),
  created_at   timestamptz NOT NULL DEFAULT now(),
  CHECK (approved_by IS NULL OR approved_by <> requested_by)
);

-- Results (append-only versions; published rows are never updated) ---------
CREATE TABLE result_records (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  election_id  uuid NOT NULL REFERENCES elections(id),
  geo_unit_id  uuid NOT NULL REFERENCES geo_units(id),
  version      integer NOT NULL,
  status       result_status NOT NULL,
  source       data_source NOT NULL,
  source_reference text NOT NULL,              -- e.g. signed source document id / form reference
  source_signature bytea,
  tallies      jsonb NOT NULL,                 -- { party_id: votes }
  total_valid  integer NOT NULL CHECK (total_valid >= 0),
  rejected     integer NOT NULL DEFAULT 0 CHECK (rejected >= 0),
  recorded_by  uuid REFERENCES admin_accounts(id),
  recorded_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (election_id, geo_unit_id, version)
);
CREATE INDEX result_latest_idx ON result_records(election_id, geo_unit_id, version DESC);

-- One person, one participation (DEMONSTRATION elections only) --------------
-- participation_events knows WHO took part, never WHAT they chose.
CREATE TABLE participation_events (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  election_id     uuid NOT NULL REFERENCES elections(id),
  user_id         uuid NOT NULL REFERENCES users(id),
  idempotency_key uuid NOT NULL,
  channel         text NOT NULL DEFAULT 'DEMO_APP',
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (election_id, user_id),               -- second attempt fails atomically
  UNIQUE (idempotency_key)                     -- safe client retries
);

-- demo_ballots knows WHAT was chosen, never WHO chose it. No user_id, no FK to
-- participation_events, and only a coarse timestamp so rows cannot be joined by time.
CREATE TABLE demo_ballots (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  election_id  uuid NOT NULL REFERENCES elections(id),
  geo_unit_id  uuid REFERENCES geo_units(id),
  party_id     uuid NOT NULL REFERENCES parties(id),
  cast_hour    timestamptz NOT NULL DEFAULT date_trunc('hour', now())
);
CREATE INDEX demo_ballots_tally_idx ON demo_ballots(election_id, party_id);

CREATE TABLE used_nonces (
  nonce      text PRIMARY KEY,
  expires_at timestamptz NOT NULL
);

-- Tamper-evident audit log (hash chain) -------------------------------------
CREATE TABLE audit_log (
  seq        bigserial PRIMARY KEY,
  actor_id   uuid,
  action     text NOT NULL,
  entity     text NOT NULL,
  entity_id  text,
  detail     jsonb NOT NULL DEFAULT '{}'::jsonb,
  prev_hash  bytea,
  hash       bytea NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE FUNCTION forbid_mutation() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION '% is append-only', TG_TABLE_NAME;
END $$;
CREATE TRIGGER audit_log_append_only BEFORE UPDATE OR DELETE ON audit_log
  FOR EACH ROW EXECUTE FUNCTION forbid_mutation();
CREATE TRIGGER result_records_append_only BEFORE UPDATE OR DELETE ON result_records
  FOR EACH ROW EXECUTE FUNCTION forbid_mutation();
