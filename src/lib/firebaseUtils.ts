import { db } from './firebase';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  QueryConstraint,
} from 'firebase/firestore';

// ============================================================================
// USER OPERATIONS
// ============================================================================

export interface UserProfile {
  uid: string;
  email: string;
  full_name: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Get user profile from Firestore
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    return userSnap.exists() ? (userSnap.data() as UserProfile) : null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  uid: string,
  updates: Partial<UserProfile>
): Promise<boolean> {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      ...updates,
      updated_at: new Date().toISOString(),
    });
    return true;
  } catch (error) {
    console.error('Error updating user profile:', error);
    return false;
  }
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string): Promise<UserProfile | null> {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);
    return querySnapshot.empty ? null : (querySnapshot.docs[0].data() as UserProfile);
  } catch (error) {
    console.error('Error fetching user by email:', error);
    return null;
  }
}

// ============================================================================
// GENERIC COLLECTION OPERATIONS
// ============================================================================

/**
 * Get all documents from a collection
 */
export async function getCollectionData<T>(collectionName: string): Promise<T[]> {
  try {
    const collectionRef = collection(db, collectionName);
    const querySnapshot = await getDocs(collectionRef);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as T));
  } catch (error) {
    console.error(`Error fetching ${collectionName}:`, error);
    return [];
  }
}

/**
 * Get a single document
 */
export async function getDocument<T>(collectionName: string, docId: string): Promise<T | null> {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? ({ id: docSnap.id, ...docSnap.data() } as T) : null;
  } catch (error) {
    console.error(`Error fetching document ${docId}:`, error);
    return null;
  }
}

/**
 * Query collection with conditions
 */
export async function queryCollection<T>(
  collectionName: string,
  constraints: QueryConstraint[]
): Promise<T[]> {
  try {
    console.log(`Querying ${collectionName} with constraints:`, constraints);
    const collectionRef = collection(db, collectionName);
    const q = query(collectionRef, ...constraints);
    const querySnapshot = await getDocs(q);
    console.log(`Query returned ${querySnapshot.docs.length} documents from ${collectionName}`);
    const results = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as T));
    console.log(`Mapped results:`, results);
    return results;
  } catch (error: any) {
    console.error(`Error querying ${collectionName}:`, error);
    console.error('Error details:', { code: error.code, message: error.message });
    return [];
  }
}

/**
 * Create a new document
 */
export async function createDocument<T>(
  collectionName: string,
  data: T
): Promise<string | null> {
  try {
    console.log(`Creating document in ${collectionName}:`, data);
    const collectionRef = collection(db, collectionName);
    const timestamp = new Date().toISOString();
    const docRef = await addDoc(collectionRef, {
      ...data,
      created_at: timestamp,
      updated_at: timestamp,
    });
    console.log(`Document successfully created in ${collectionName} with ID:`, docRef.id);
    return docRef.id;
  } catch (error: any) {
    console.error(`Error creating document in ${collectionName}:`, error);
    console.error('Error details:', { code: error.code, message: error.message });
    return null;
  }
}

/**
 * Update a document
 */
export async function updateDocument<T>(
  collectionName: string,
  docId: string,
  updates: Partial<T>
): Promise<boolean> {
  try {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, {
      ...updates,
      updated_at: new Date().toISOString(),
    });
    return true;
  } catch (error) {
    console.error(`Error updating document ${docId}:`, error);
    return false;
  }
}

/**
 * Delete a document
 */
export async function deleteDocument(collectionName: string, docId: string): Promise<boolean> {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error(`Error deleting document ${docId}:`, error);
    return false;
  }
}

// ============================================================================
// FORM SUBMISSION OPERATIONS
// ============================================================================

export interface FormSubmission {
  id?: string;
  user_id: string;
  form_type: string;
  form_data: Record<string, unknown>;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  created_at?: string;
  updated_at?: string;
}

/**
 * Submit a form
 */
export async function submitForm(submission: FormSubmission): Promise<string | null> {
  return createDocument('form_submissions', submission);
}

/**
 * Get user's form submissions
 */
export async function getUserFormSubmissions(userId: string): Promise<FormSubmission[]> {
  return queryCollection<FormSubmission>('form_submissions', [where('user_id', '==', userId)]);
}

/**
 * Update form submission status
 */
export async function updateFormStatus(
  submissionId: string,
  status: FormSubmission['status']
): Promise<boolean> {
  return updateDocument('form_submissions', submissionId, { status });
}

// ============================================================================
// CONTACT MESSAGE OPERATIONS
// ============================================================================

export interface ContactMessage {
  id?: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'responded';
  created_at?: string;
  updated_at?: string;
}

/**
 * Submit contact form
 */
export async function submitContactMessage(message: Omit<ContactMessage, 'status' | 'created_at' | 'updated_at'>): Promise<string | null> {
  return createDocument('contact_messages', {
    ...message,
    status: 'new',
  });
}

/**
 * Get all contact messages (admin only)
 */
export async function getContactMessages(): Promise<ContactMessage[]> {
  return getCollectionData<ContactMessage>('contact_messages');
}

/**
 * Mark message as read
 */
export async function markMessageAsRead(messageId: string): Promise<boolean> {
  return updateDocument('contact_messages', messageId, { status: 'read' });
}

// ============================================================================
// PACKAGE OPERATIONS
// ============================================================================

export interface Package {
  id?: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

/**
 * Get all active packages
 */
export async function getActivePackages(): Promise<Package[]> {
  return queryCollection<Package>('packages', [where('is_active', '==', true)]);
}

/**
 * Get all packages (admin)
 */
export async function getAllPackages(): Promise<Package[]> {
  return getCollectionData<Package>('packages');
}

/**
 * Get specific package
 */
export async function getPackage(packageId: string): Promise<Package | null> {
  return getDocument<Package>('packages', packageId);
}

/**
 * Create package (admin)
 */
export async function createPackage(pkg: Package): Promise<string | null> {
  return createDocument('packages', pkg);
}

/**
 * Update package (admin)
 */
export async function updatePackage(packageId: string, updates: Partial<Package>): Promise<boolean> {
  return updateDocument('packages', packageId, updates);
}

// ============================================================================
// PACKAGE STATE PRICING OPERATIONS
// ============================================================================

export interface PackageStatePrice {
  id: string;
  state: string;
  basic_price: number;
  epic_price: number;
  ultimate_price: number;
  [key: string]: any;
}

/**
 * Fetch package prices for all states from package_state collection
 */
export async function getPackagePricesByState(): Promise<PackageStatePrice[]> {
  try {
    console.log('Fetching package prices for all states...');
    const prices = await getCollectionData<PackageStatePrice>('package_state');
    console.log('Package prices by state:', prices);
    return prices;
  } catch (error) {
    console.error('Error fetching package prices by state:', error);
    return [];
  }
}

/**
 * Fetch package price for a specific state
 */
export async function getPackagePriceForState(state: string): Promise<PackageStatePrice | null> {
  try {
    console.log(`Fetching package prices for state: ${state}`);
    const price = await getDocument<PackageStatePrice>('package_state', state);
    console.log(`Package price for ${state}:`, price);
    return price;
  } catch (error) {
    console.error(`Error fetching package price for state ${state}:`, error);
    return null;
  }
}
