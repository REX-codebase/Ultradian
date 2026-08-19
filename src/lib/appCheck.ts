import { FirebaseApp } from 'firebase/app';
import { initializeAppCheck, ReCaptchaEnterpriseProvider, AppCheck } from 'firebase/app-check';
import config from '../../firebase-applet-config.example.json';

let appCheckInstance: AppCheck | null = null;

/**
 * Initializes Firebase App Check with the ReCAPTCHA Enterprise Provider
 */
export function initAppCheck(app: FirebaseApp): AppCheck | null {
  if (typeof window === 'undefined') return null;

  const siteKey =
    (config as any).recaptchaSiteKey ||
    (import.meta as any).env?.VITE_RECAPTCHA_SITE_KEY ||
    '';

  if (!siteKey) {
    console.warn('Firebase App Check site key is missing. Skipping App Check initialization.');
    return null;
  }

  try {
    appCheckInstance = initializeAppCheck(app, {
      provider: new ReCaptchaEnterpriseProvider(siteKey),
      isTokenAutoRefreshEnabled: true,
    });
    return appCheckInstance;
  } catch (err) {
    console.error('Failed to initialize Firebase App Check:', err);
    return null;
  }
}

export { appCheckInstance };
