import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDoc,
  query, 
  where, 
  orderBy, 
  getDocs
} from 'firebase/firestore';
import { db } from './firebase-types';

export type PaymentMethod = 'bank' | 'crypto' | 'cashplus';

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'verified';

export interface Payment {
  id: string;
  application_id: string;
  user_id: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  payment_reference: string; // Bank transfer reference, crypto tx hash, or Cash Plus receipt
  verified_at?: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentDetails {
  bank: {
    accountHolder: string;
    bankName: string;
    accountNumber: string;
    amount: number;
    currency: string;
  };
  crypto: {
    network: string;
    walletAddress: string;
    amount: number;
    currency: string;
  };
  cashplus: {
    merchantCode: string;
    amount: number;
    currency: string;
    phone: string;
  };
}

/**
 * Create a new payment record
 */
export async function createPayment(
  applicationId: string,
  userId: string,
  amount: number,
  method: PaymentMethod
) {
  try {
    const now = new Date().toISOString();
    const docRef = await addDoc(collection(db, 'payments'), {
      application_id: applicationId,
      user_id: userId,
      amount,
      currency: 'MAD',
      method,
      status: 'pending',
      payment_reference: '',
      created_at: now,
      updated_at: now,
    });

    return {
      id: docRef.id,
      application_id: applicationId,
      user_id: userId,
      amount,
      currency: 'MAD',
      method,
      status: 'pending',
      payment_reference: '',
      created_at: now,
      updated_at: now,
    };
  } catch (error) {
    console.error('Error creating payment:', error);
    throw error;
  }
}

/**
 * Update payment with reference and mark as submitted
 */
export async function updatePaymentReference(
  paymentId: string,
  paymentReference: string
) {
  try {
    const paymentRef = doc(db, 'payments', paymentId);
    const updateData = {
      payment_reference: paymentReference,
      updated_at: new Date().toISOString(),
    };
    await updateDoc(paymentRef, updateData);

    const snapshot = await getDoc(paymentRef);
    return { id: snapshot.id, ...snapshot.data() };
  } catch (error) {
    console.error('Error updating payment reference:', error);
    throw error;
  }
}

/**
 * Verify and complete a payment (admin only)
 */
export async function verifyPayment(paymentId: string) {
  try {
    const paymentRef = doc(db, 'payments', paymentId);
    const updateData = {
      status: 'verified',
      verified_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    await updateDoc(paymentRef, updateData);

    const snapshot = await getDoc(paymentRef);
    const paymentData = snapshot.data();

    // Update the associated application payment status
    if (paymentData?.application_id) {
      const appRef = doc(db, 'llc_applications', paymentData.application_id);
      await updateDoc(appRef, {
        payment_status: 'completed',
        updated_at: new Date().toISOString(),
      });
    }

    return { id: snapshot.id, ...paymentData };
  } catch (error) {
    console.error('Error verifying payment:', error);
    throw error;
  }
}

/**
 * Get payment by ID
 */
export async function getPayment(paymentId: string): Promise<Payment> {
  try {
    const snapshot = await getDoc(doc(db, 'payments', paymentId));
    if (!snapshot.exists()) {
      throw new Error('Payment not found');
    }
    return { id: snapshot.id, ...snapshot.data() } as Payment;
  } catch (error) {
    console.error('Error fetching payment:', error);
    throw error;
  }
}

/**
 * Get payments for an application
 */
export async function getApplicationPayments(
  applicationId: string
): Promise<Payment[]> {
  try {
    const q = query(
      collection(db, 'payments'),
      where('application_id', '==', applicationId),
      orderBy('created_at', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Payment[];
  } catch (error) {
    console.error('Error fetching application payments:', error);
    return [];
  }
}

/**
 * Get payments for a user
 */
export async function getUserPayments(userId: string): Promise<Payment[]> {
  try {
    const q = query(
      collection(db, 'payments'),
      where('user_id', '==', userId),
      orderBy('created_at', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Payment[];
  } catch (error) {
    console.error('Error fetching user payments:', error);
    return [];
  }
}

/**
 * Get all pending payments (admin)
 */
export async function getPendingPayments(): Promise<Payment[]> {
  try {
    const q = query(
      collection(db, 'payments'),
      where('status', '==', 'pending'),
      orderBy('created_at', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Payment[];
  } catch (error) {
    console.error('Error fetching pending payments:', error);
    return [];
  }
}

/**
 * Setup real-time subscription for payment updates
 */
export function subscribeToPaymentUpdates(
  applicationId: string,
  callback: (payment: Payment) => void
) {
  // Polling-based subscription for payment updates
  // Can be upgraded to Firebase Realtime listeners for true real-time updates
  const interval = setInterval(async () => {
    try {
      const payments = await getApplicationPayments(applicationId);
      if (payments.length > 0) {
        callback(payments[0]);
      }
    } catch (error) {
      console.error('Error polling payments:', error);
    }
  }, 5000); // Poll every 5 seconds

  return { interval };
}

/**
 * Unsubscribe from payment updates
 */
export async function unsubscribeFromPaymentUpdates(
  subscription: any
): Promise<void> {
  if (subscription && subscription.interval) {
    clearInterval(subscription.interval);
  }
}

export const PAYMENT_DETAILS: PaymentDetails = {
  bank: {
    accountHolder: 'OGS Solutions',
    bankName: 'Crédit Immobilier et Hôtelier (CIH)',
    accountNumber: '230 794 3484569211021500 44',
    amount: 1000,
    currency: 'MAD',
  },
  crypto: {
    network: 'USDT - TRC20',
    walletAddress: 'TQCkG6WnTWjZiT9mfV8p5kK3q9L2mN4pRx',
    amount: 50,
    currency: 'USDT',
  },
  cashplus: {
    merchantCode: 'OGS-SOLUTIONS',
    amount: 1000,
    currency: 'MAD',
    phone: '+212 653-498642',
  },
};
/**
 * Get all applications with paid or advance payment status
 */
export async function getPaidApplications() {
  try {
    // Get paid applications
    const paidQuery = query(
      collection(db, 'llc_applications'),
      where('payment_status', '==', 'paid')
    );
    const paidSnapshot = await getDocs(paidQuery);
    const paidApps = paidSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Get advance applications
    const advanceQuery = query(
      collection(db, 'llc_applications'),
      where('payment_status', '==', 'advance')
    );
    const advanceSnapshot = await getDocs(advanceQuery);
    const advanceApps = advanceSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Combine both arrays
    const apps = [...paidApps, ...advanceApps];
    
    // Sort by created_at in descending order (application code instead of Firestore)
    apps.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return apps;
  } catch (error) {
    console.error('Error fetching paid applications:', error);
    return [];
  }
}