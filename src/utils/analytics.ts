import { logEvent, setUserProperties } from 'firebase/analytics';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db, getAnalyticsInstance, handleFirestoreError, OperationType } from '../firebase';
import type { Language } from '../contexts/LanguageContext';

const VISIT_SESSION_KEY = 'khmer_llm_visit_tracked';

let lastTrackedViewKey = '';

function getViewportCategory(): 'mobile' | 'tablet' | 'desktop' {
  if (typeof window === 'undefined') return 'desktop';
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

function getReferrerHost(): string {
  if (typeof document === 'undefined' || !document.referrer) return 'direct';
  try {
    return new URL(document.referrer).hostname.slice(0, 128) || 'direct';
  } catch {
    return 'direct';
  }
}

function getSafePagePath(section: string): string {
  if (typeof window === 'undefined') return `/?section=${section}`;
  const raw = `${window.location.pathname}${window.location.search}`;
  return (raw || `/?section=${section}`).slice(0, 256);
}

function createVisitId(): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 10);
  return `v_${ts}_${rand}`.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 128);
}

async function persistVerifiedUserVisit(section: string, language: Language): Promise<void> {
  const currentUser = auth.currentUser;
  if (!currentUser || !currentUser.emailVerified) {
    return;
  }

  const visitId = createVisitId();
  const path = `website_visits/${visitId}`;
  try {
    await setDoc(doc(db, 'website_visits', visitId), {
      visitId,
      userId: currentUser.uid,
      section: section.slice(0, 64),
      language,
      pagePath: getSafePagePath(section),
      referrerHost: getReferrerHost(),
      viewportCategory: getViewportCategory(),
      visitedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function trackWebsiteVisit(section: string, language: Language): Promise<void> {
  try {
    if (typeof window !== 'undefined' && sessionStorage.getItem(VISIT_SESSION_KEY) === '1') {
      return;
    }
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(VISIT_SESSION_KEY, '1');
    }
  } catch {
    // Continue if sessionStorage is restricted
  }

  const analytics = await getAnalyticsInstance();
  if (analytics) {
    try {
      setUserProperties(analytics, {
        preferred_language: language,
        viewport_category: getViewportCategory(),
      });

      logEvent(analytics, 'website_visit', {
        initial_section: section.slice(0, 64),
        language,
        referrer_host: getReferrerHost(),
        viewport_category: getViewportCategory(),
        page_path: getSafePagePath(section),
      });
    } catch {
      // Ignore analytics runtime errors in restricted environments
    }
  }

  void persistVerifiedUserVisit(section, language).catch(() => {
    // Error details already logged in handleFirestoreError
  });
}

export async function trackPageView(
  section: string,
  language: Language,
  pageTitle?: string
): Promise<void> {
  const dedupeKey = `${section}:${language}`;
  if (dedupeKey === lastTrackedViewKey) {
    return;
  }
  lastTrackedViewKey = dedupeKey;

  const analytics = await getAnalyticsInstance();
  if (!analytics) return;

  try {
    setUserProperties(analytics, { preferred_language: language });

    logEvent(analytics, 'page_view', {
      page_title: (pageTitle || (typeof document !== 'undefined' ? document.title : section)).slice(0, 100),
      page_location: typeof window !== 'undefined' ? window.location.href : undefined,
      page_path: getSafePagePath(section),
      section: section.slice(0, 64),
      language,
    });

    logEvent(analytics, 'section_view', {
      section_id: section.slice(0, 64),
      language,
    });
  } catch {
    // Ignore analytics dispatch errors
  }
}

export async function trackLanguageSwitch(
  language: Language,
  section: string
): Promise<void> {
  const analytics = await getAnalyticsInstance();
  if (!analytics) return;

  try {
    setUserProperties(analytics, { preferred_language: language });
    logEvent(analytics, 'language_switch', {
      language,
      section: section.slice(0, 64),
    });
  } catch {
    // Ignore analytics dispatch errors
  }
}

export async function trackUiAction(
  eventName: string,
  params?: Record<string, string | number | boolean>
): Promise<void> {
  const analytics = await getAnalyticsInstance();
  if (!analytics) return;

  try {
    logEvent(analytics, eventName, params);
  } catch {
    // Ignore analytics dispatch errors
  }
}
