/// Bundled demonstration content for the mobile app.
///
/// The app is intentionally offline-first: it never needs a network connection
/// to show its demonstration content, and it never sends personal data anywhere.
/// Every name and figure here is synthetic. Real party, candidate and polling
/// unit records may only be added from verified INEC publications.
library;

class CalendarEntry {
  const CalendarEntry(this.date, this.phase, this.title, this.detail);
  final String date;
  final String phase;
  final String title;
  final String detail;
}

class PartyRecord {
  const PartyRecord(this.name, this.abbreviation, this.candidate, this.pledges);
  final String name;
  final String abbreviation;
  final String candidate;
  final List<String> pledges;
}

class EducationRecord {
  const EducationRecord(this.title, this.category, this.summary, this.body);
  final String title;
  final String category;
  final String summary;
  final List<String> body;
}

class PollingUnitRecord {
  const PollingUnitRecord(this.code, this.name, this.ward, this.lga, this.state, this.registered);
  final String code;
  final String name;
  final String ward;
  final String lga;
  final String state;
  final int registered;
}

class NotificationRecord {
  const NotificationRecord(this.title, this.body, this.age, this.unread);
  final String title;
  final String body;
  final String age;
  final bool unread;
}

const demoCalendar = <CalendarEntry>[
  CalendarEntry('01 Oct 2026', 'Timetable', 'Demonstration timetable published',
      'Placeholder timetable for this demo. Confirm every date with INEC.'),
  CalendarEntry('15 Oct 2026', 'Registration', 'Continuous voter registration window (illustrative)',
      'The app never registers voters. Only INEC maintains the register.'),
  CalendarEntry('01 Dec 2026', 'Campaign', 'Public campaign window (illustrative)',
      'Used to test notification and education content.'),
  CalendarEntry('10 Jan 2027', 'Logistics', 'Accreditation readiness (illustrative)',
      'Used to test polling-unit readiness screens.'),
  CalendarEntry('16 Jan 2027', 'Voting', 'Presidential and National Assembly election day',
      'Date from the project brief. Confirm with INEC before treating it as fact.'),
];

const demoParties = <PartyRecord>[
  PartyRecord('Demo Party Alpha', 'DPA', 'Amara O. Demo-Alpha', [
    'Publish polling-unit level figures with timestamps.',
    'Fund plain-language civic education in five languages.',
    'Priority access and assistive support at every polling unit.',
  ]),
  PartyRecord('Demo Party Beta', 'DPB', 'Tunde B. Sample-Beta', [
    'Community-led safety planning for election logistics.',
    'Skills programmes tied to public infrastructure projects.',
    'Digitise land and business registries across the states.',
  ]),
  PartyRecord('Demo Party Gamma', 'DPC', 'Ngozi C. Test-Gamma', [
    'A published primary healthcare funding formula.',
    'Annual teacher training and classroom connectivity.',
    'Machine-readable state budgets before approval.',
  ]),
  PartyRecord('Demo Party Delta', 'DPD', 'Ibrahim D. Placeholder-Delta', [
    'Grid and off-grid investment with published uptime targets.',
    'Storage and transport support for smallholder farmers.',
    'State-by-state water point mapping and maintenance.',
  ]),
  PartyRecord('Demo Party Epsilon', 'DPE', 'Ebi E. Mock-Epsilon', [
    'Publish service standards and complaint resolution times.',
    'Support independent observation and result verification.',
    'Accessibility audits of public buildings.',
  ]),
];

const demoEducation = <EducationRecord>[
  EducationRecord(
    'How to check your voter registration',
    'Registration',
    'Where to confirm your details, using official INEC channels.',
    [
      'Voter registration is handled by INEC, not by this app. 9ja Vote never registers anyone and never stores biometric data.',
      'Confirm your status and polling unit through INEC’s own published channels before election day.',
      'If your details are wrong, follow INEC’s correction process. This app cannot change them for you.',
    ],
  ),
  EducationRecord(
    'What to bring on election day',
    'Voting day',
    'Your permanent voter card, and a plan to arrive early.',
    [
      'Bring the identification INEC requires and confirm your polling unit in advance.',
      'Accreditation happens before voting. Follow officials’ instructions.',
      'This app issues no voter card, accreditation or official document of any kind.',
    ],
  ),
  EducationRecord(
    'How results travel from the polling unit',
    'Results',
    'Polling unit → ward → LGA → state → national, and why timestamps matter.',
    [
      'Results are recorded at the polling unit, then collated upward.',
      'Each level should be traceable to a signed sheet and a timestamp.',
      'Only INEC can declare a result. This app mirrors figures; it never declares a winner.',
    ],
  ),
  EducationRecord(
    'Spotting election misinformation',
    'Safety',
    'Check the source, the timestamp, and whether it is a screenshot of a screenshot.',
    [
      'Look for an official source and a date. Figures without a polling-unit trail are unverified.',
      'Screenshots are easy to fabricate. Prefer the originating page or document.',
      'Report threats and violence to the authorities, not to an app.',
    ],
  ),
];

const demoPollingUnits = <PollingUnitRecord>[
  PollingUnitRecord('LA-LGA-01-W-01-PU-001', 'Demo Polling Unit 1.1.1', 'Ward 01', 'Lagos Central', 'Lagos', 540),
  PollingUnitRecord('LA-LGA-01-W-01-PU-002', 'Demo Polling Unit 1.1.2', 'Ward 01', 'Lagos Central', 'Lagos', 412),
  PollingUnitRecord('FC-LGA-01-W-01-PU-001', 'Demo Polling Unit 1.1.1', 'Ward 01', 'FCT Central', 'FCT', 488),
  PollingUnitRecord('KN-LGA-02-W-01-PU-003', 'Demo Polling Unit 2.1.3', 'Ward 01', 'Kano North', 'Kano', 601),
  PollingUnitRecord('RV-LGA-03-W-02-PU-001', 'Demo Polling Unit 3.2.1', 'Ward 02', 'Rivers South', 'Rivers', 377),
];

const demoNotifications = <NotificationRecord>[
  NotificationRecord('Demonstration figures updated', 'Synthetic state figures were re-generated for the demo dataset.', '2 hours ago', true),
  NotificationRecord('Illustrative timetable entry added', 'The demonstration calendar gained a logistics entry.', 'Yesterday', true),
  NotificationRecord('Hausa, Yoruba, Igbo and Pidgin are in review', 'Translations are drafted but disabled until native speakers review them.', '3 days ago', false),
];

/// Synthetic national figures shown in the results demo. Not election data.
class DemoPartyVote {
  const DemoPartyVote(this.party, this.share);
  final String party;
  final double share;
}

const demoNationalShare = <DemoPartyVote>[
  DemoPartyVote('Demo Party Alpha', 0.34),
  DemoPartyVote('Demo Party Beta', 0.27),
  DemoPartyVote('Demo Party Gamma', 0.19),
  DemoPartyVote('Demo Party Delta', 0.12),
  DemoPartyVote('Demo Party Epsilon', 0.08),
];

const demoNationalStats = <String, String>{
  'States reporting': '34 of 37',
  'Polling units reported': '149,714',
  'Under verification': '7',
  'Disputed': '3',
  'Declared winner': 'None — only INEC declares results',
};
