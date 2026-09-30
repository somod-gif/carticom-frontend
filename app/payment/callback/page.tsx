'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { paymentApi } from '@/features/onboarding/services/onboarding.service';
import { guestCheckoutRepository } from '@/features/dashboard/repositories/guest-checkout.repository';
import { Button } from '@/components/ui/button';
import { LoadingState } from '@/components/dashboard/shared/StateComponents';

type Status = 'processing' | 'success' | 'failed';

function PaymentCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const cleanParam = (v: string | null) => (v ? v.split('?')[0].split('&')[0] : null);
  const transactionId =
    cleanParam(searchParams.get('transactionId')) ||
    cleanParam(searchParams.get('reference')) ||
    cleanParam(searchParams.get('trxref'));
  const reference =
    cleanParam(searchParams.get('reference')) || cleanParam(searchParams.get('trxref'));
  const guest = searchParams.get('guest');

  const [status, setStatus] = useState<Status>('processing');
  const [message, setMessage] = useState('');
  const confirmedRef = useRef(false);

  useEffect(() => {
    if (!transactionId || confirmedRef.current) return;
    confirmedRef.current = true;

    const confirm = async () => {
      try {
        if (guest) {
          await guestCheckoutRepository.payConfirm({
            transactionId,
            providerReference: reference || transactionId,
          });
          setStatus('success');
        } else {
          await paymentApi.confirm({
            transactionId,
            status: 'success',
            providerReference: reference || transactionId,
          });
          setStatus('success');
        }
      } catch {
        setStatus('failed');
        setMessage('We could not verify your payment. It may still be processing — check your order shortly.');
      }
    };

    confirm();
  }, [transactionId, reference, guest]);

  const goHome = () => {
    if (guest) {
      router.push(`/guest-checkout/track?reference=${guest}`);
    } else if (orderId) {
      router.push(`/storefront/order-confirmation?id=${orderId}`);
    } else {
      router.push('/dashboard/subscription');
    }
  };

  if (status === 'processing') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600 mx-auto" />
          <p className="text-gray-600 dark:text-gray-400">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-16 text-center space-y-6">
      {status === 'success' ? (
        <>
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payment Successful</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Your payment has been received and confirmed.
          </p>
        </>
      ) : (
        <>
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payment Not Verified</h1>
          <p className="text-gray-500 dark:text-gray-400">{message || 'Payment could not be confirmed.'}</p>
        </>
      )}
      <Button onClick={goHome} className="rounded-xl">
        {guest ? 'Track Order' : orderId ? 'View Order' : 'Back to Subscription'}
      </Button>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={<LoadingState message="Loading..." />}>
      <PaymentCallbackContent />
    </Suspense>
  );
}