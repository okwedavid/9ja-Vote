/**
 * Multilingual scaffold. English is complete; the other locales are registered so
 * the UI and routing can be built around them, but their strings must be supplied
 * and reviewed by qualified native translators before they are switched on.
 */
export const LOCALES = [
  { code: 'en', label: 'English', ready: true },
  { code: 'ha', label: 'Hausa', ready: false },
  { code: 'yo', label: 'Yorùbá', ready: false },
  { code: 'ig', label: 'Igbo', ready: false },
  { code: 'pcm', label: 'Naijá (Pidgin)', ready: false },
] as const;

export const en = {
  tagline: 'Your Voice. Your Future. Your Nigeria.',
  demoBanner: 'Independent demonstration platform. Not affiliated with INEC. All figures shown are synthetic test data.',
};
