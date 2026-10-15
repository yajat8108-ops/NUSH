import admin from 'firebase-admin';

let firebaseAdminApp: admin.app.App | null = null;

export function getFirebaseAdmin(): admin.app.App | null {
  if (firebaseAdminApp) return firebaseAdminApp;
  if (admin.apps.length > 0) {
    firebaseAdminApp = admin.apps[0]!;
    return firebaseAdminApp;
  }

  const serviceAccountRaw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!serviceAccountRaw) {
    console.warn('[FCM] FIREBASE_SERVICE_ACCOUNT_JSON not set. Push notifications will be simulated.');
    return null;
  }

  try {
    // Strip surrounding single or double quotes that may be present
    // when the value is pasted into Vercel dashboard (e.g. '{"type":...}')
    const trimmed = serviceAccountRaw.trim().replace(/^['"]|['"]$/g, '');
    const serviceAccount = JSON.parse(trimmed);
    firebaseAdminApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    return firebaseAdminApp;
  } catch (error) {
    console.error('[FCM] Failed to initialize Firebase Admin SDK:', error);
    return null;
  }
}
