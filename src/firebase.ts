import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer, type Firestore } from 'firebase/firestore';
import { getAnalytics, isSupported, type Analytics } from 'firebase/analytics';
import firebaseConfig from '../firebase-applet-config.json';

const envMeasurementId =
  typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_MEASUREMENT_ID
    ? String(import.meta.env.VITE_FIREBASE_MEASUREMENT_ID).trim()
    : '';

export const effectiveMeasurementId = envMeasurementId || firebaseConfig.measurementId || '';

const effectiveConfig = {
  ...firebaseConfig,
  ...(effectiveMeasurementId ? { measurementId: effectiveMeasurementId } : {}),
};

export const firebaseApp: FirebaseApp =
  getApps().length > 0 ? getApps()[0] : initializeApp(effectiveConfig);

export const db: Firestore = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);
export const auth: Auth = getAuth(firebaseApp);

let analyticsPromise: Promise<Analytics | null> | null = null;

export function getAnalyticsInstance(): Promise<Analytics | null> {
  if (!analyticsPromise) {
    analyticsPromise = (async () => {
      if (typeof window === 'undefined' || !effectiveMeasurementId) {
        return null;
      }
      try {
        const supported = await isSupported();
        if (!supported) {
          return null;
        }
        return getAnalytics(firebaseApp);
      } catch {
        return null;
      }
    })();
  }
  return analyticsPromise;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

async function testConnection(): Promise<void> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}

void testConnection();
