/** Provisional emblem. Deliberately NOT the Coat of Arms, which needs permission to use. */
export function Emblem({ size = 44 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" role="img" aria-label="9ja Vote provisional emblem">
      <defs>
        <clipPath id="shield">
          <path d="M32 3 58 12v20c0 15-11 24-26 29C17 56 6 47 6 32V12z" />
        </clipPath>
      </defs>
      <g clipPath="url(#shield)">
        <rect width="64" height="64" fill="#008751" />
        <rect x="23" width="18" height="64" fill="#fff" />
      </g>
      <path d="M32 3 58 12v20c0 15-11 24-26 29C17 56 6 47 6 32V12z" fill="none" stroke="#04492f" strokeWidth="3" />
      <path d="m22 33 7 7 14-16" fill="none" stroke="#04492f" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
