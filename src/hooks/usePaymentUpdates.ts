import { useEffect } from 'react';
import { Payment, subscribeToPaymentUpdates, unsubscribeFromPaymentUpdates } from '../lib/paymentService';

export function usePaymentUpdates(
  applicationId: string,
  onPaymentUpdate: (payment: Payment) => void
) {
  useEffect(() => {
    let subscription: any = null;

    const setupSubscription = async () => {
      try {
        subscription = subscribeToPaymentUpdates(applicationId, onPaymentUpdate);
      } catch (error) {
        console.error('Error setting up payment subscription:', error);
      }
    };

    setupSubscription();

    return () => {
      if (subscription) {
        unsubscribeFromPaymentUpdates(subscription);
      }
    };
  }, [applicationId, onPaymentUpdate]);
}

export default usePaymentUpdates;
