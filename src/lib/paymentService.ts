import { supabase } from './supabase';

export type PaymentMethod = 'bank' | 'crypto' | 'cashplus' | 'interac';

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
  interac: {
    email: string;
    amount: number;
    currency: string;
    autoDeposit: boolean;
    reference: string;
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
    const { data, error } = await supabase
      .from('payments')
      .insert([
        {
          application_id: applicationId,
          user_id: userId,
          amount,
          currency: 'MAD',
          method,
          status: 'pending',
          payment_reference: '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
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
    const { data, error } = await supabase
      .from('payments')
      .update({
        payment_reference: paymentReference,
        updated_at: new Date().toISOString(),
      })
      .eq('id', paymentId)
      .select()
      .single();

    if (error) throw error;
    return data;
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
    const { data, error } = await supabase
      .from('payments')
      .update({
        status: 'verified',
        verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', paymentId)
      .select()
      .single();

    if (error) throw error;

    // Update the associated application payment status
    if (data) {
      await supabase
        .from('llc_applications')
        .update({
          payment_status: 'completed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', data.application_id);
    }

    return data;
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
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .single();

    if (error) throw error;
    return data;
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
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('application_id', applicationId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching application payments:', error);
    throw error;
  }
}

/**
 * Get payments for a user
 */
export async function getUserPayments(userId: string): Promise<Payment[]> {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching user payments:', error);
    throw error;
  }
}

/**
 * Get all pending payments (admin)
 */
export async function getPendingPayments(): Promise<Payment[]> {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching pending payments:', error);
    throw error;
  }
}

/**
 * Setup real-time subscription for payment updates
 */
export function subscribeToPaymentUpdates(
  applicationId: string,
  callback: (payment: Payment) => void
) {
  // Note: Supabase real-time subscriptions require channel subscription
  // For now, we'll return a polling-based subscription
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
  interac: {
    email: 'payments@ogssolutions.com',
    amount: 1000,
    currency: 'CAD',
    autoDeposit: true,
    reference: 'OGS-SOLUTIONS',
  },
};
