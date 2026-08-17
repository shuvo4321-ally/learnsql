import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInAnonymously,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  User
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  collection,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { ChatMessage } from '../types';

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firestore with specific databaseId if provided
export const db = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Initialize Auth
export const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence).catch((err) => {
  console.error("Auth persistence error:", err);
});
export const googleProvider = new GoogleAuthProvider();

export interface SavedConversation {
  id: string;
  userId: string;
  title: string;
  dbName: string;
  activeSampleDbId?: string;
  messages: ChatMessage[];
  createdAt: any;
  updatedAt: any;
}

// Auth Helpers
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    if (result.user) {
      await syncUserProfile(result.user);
    }
    return result.user;
  } catch (error: any) {
    console.error('Google Sign In Error:', error);
    throw error;
  }
};

export const signInAsGuest = async () => {
  try {
    const result = await signInAnonymously(auth);
    if (result.user) {
      await syncUserProfile(result.user);
    }
    return result.user;
  } catch (error: any) {
    console.error('Anonymous Sign In Error:', error);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (error: any) {
    console.error('Logout Error:', error);
  }
};

export const syncUserProfile = async (user: User) => {
  if (!user) return;
  const userRef = doc(db, 'users', user.uid);
  try {
    await setDoc(
      userRef,
      {
        uid: user.uid,
        email: user.email || 'Guest User',
        displayName: user.displayName || (user.isAnonymous ? 'Guest User' : 'LuminaSQL User'),
        photoURL: user.photoURL || '',
        isAnonymous: user.isAnonymous,
        updatedAt: new Date().toISOString()
      },
      { merge: true }
    );
  } catch (err) {
    console.error('Error syncing user profile:', err);
  }
};

// Firestore Conversation Helpers

/**
 * Saves or updates a conversation for a user in Firestore
 */
export const saveConversationToFirestore = async (
  userId: string,
  conversationId: string,
  data: {
    title: string;
    dbName: string;
    activeSampleDbId?: string;
    messages: ChatMessage[];
  }
) => {
  if (!userId || !conversationId) return;

  const convRef = doc(db, 'users', userId, 'conversations', conversationId);
  
  // Clean undefined properties from messages for Firestore compatibility
  const cleanedMessages = data.messages.map((m) => {
    const cleanObj: Record<string, any> = {};
    Object.keys(m).forEach((key) => {
      const val = (m as any)[key];
      if (val !== undefined) {
        cleanObj[key] = val;
      }
    });
    return cleanObj;
  });

  try {
    const nowIso = new Date().toISOString();
    const existingSnap = await getDoc(convRef);
    const existingCreatedAt = existingSnap.exists() ? existingSnap.data()?.createdAt : null;

    await setDoc(
      convRef,
      {
        id: conversationId,
        userId,
        title: data.title || 'SQL Session',
        dbName: data.dbName,
        activeSampleDbId: data.activeSampleDbId || '',
        messages: cleanedMessages,
        updatedAt: nowIso,
        createdAt: existingCreatedAt || nowIso
      },
      { merge: true }
    );
  } catch (err) {
    console.error('Error saving conversation to Firestore:', err);
  }
};

/**
 * Subscribes to real-time conversation list updates for a user
 */
export const subscribeToUserConversations = (
  userId: string,
  callback: (conversations: SavedConversation[]) => void
) => {
  if (!userId) {
    callback([]);
    return () => {};
  }

  const convsRef = collection(db, 'users', userId, 'conversations');
  const q = query(convsRef, orderBy('updatedAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const convs: SavedConversation[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<SavedConversation, 'id'>)
      }));
      callback(convs);
    },
    (err) => {
      console.error('Error fetching user conversations:', err);
      callback([]);
    }
  );
};

/**
 * Deletes a conversation from Firestore
 */
export const deleteConversationFromFirestore = async (userId: string, conversationId: string) => {
  if (!userId || !conversationId) return;
  try {
    const convRef = doc(db, 'users', userId, 'conversations', conversationId);
    await deleteDoc(convRef);
  } catch (err) {
    console.error('Error deleting conversation:', err);
  }
};
