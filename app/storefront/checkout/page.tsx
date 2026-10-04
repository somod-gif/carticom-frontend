'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, Loader2, ShoppingBag, Tag, Truck, Package, CreditCard, Building2, Smartphone } from 'lucide-react';
import { cartApi, checkoutApi, paymentApi } from '@/features/onboarding/services/onboarding.service';
import type { CartDto } from '@/features/onboarding/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { LoadingState, EmptyState, ErrorState } from '@/components/dashboard/shared/StateComponents';
import { useCartStore } from '@/store/cart.store';
import { extractErrorMessage } from '@/lib/axios';
import { toast } from 'sonner';

interface CustomerDetails {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
}

function CheckoutPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const storeId = searchParams.get('store') || useCartStore.getState().storeId || '';
  const [cart, setCart] = useState<CartDto | null>(null);
  const [loadingCart, setLoadingCart] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [deliveryMethod, setDeliveryMethod] = useState<'PICKUP' | 'LOCAL_DELIVERY' | 'INTERSTATE_DELIVERY'>('LOCAL_DELIVERY');
  const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'BANK_TRANSFER' | 'MOBILE_MONEY'>('CARD');
  const [couponCode, setCouponCode] = useState('');
  const [notes, setNotes] = useState('');

  const [customer, setCustomer] = useState<CustomerDetails>({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: ''});

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!storeId) {
        setLoadingCart(false);
        return;
      }
      try {
        const res = await cartApi.get(storeId);
        if (cancelled) return;
        if (!res.data.data) setCart(null);
        else setCart(res.data.data);
      } catch (err) {
        if (cancelled) return;
        const status = (err as { response?: { status?: number } })?.response?.status;
        if (status === 404) {
          useCartStore.getState().reset();
          setCart(null);
        } else {
          setError(extractErrorMessage(err));
        }
      } finally {
        if (!cancelled) setLoadingCart(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [storeId, retryKey]);

  const handleRetry = () => {
    setLoadingCart(true);
    setError(null);
    setRetryKey((k) => k + 1);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCustomer((prev) => ({ ...prev, [name]: value }));
  };

  const isFormValid = () => {
    if (deliveryMethod === 'PICKUP') {
      return customer.fullName.trim().length > 0 &&
        customer.email.trim().length > 0 &&
        customer.phone.trim().length > 0;
    }
    return customer.fullName.trim().length > 0 &&
      customer.email.trim().length > 0 &&
      customer.phone.trim().length > 0 &&
      customer.address.trim().length > 0 &&
      customer.city.trim().length > 0 &&
      customer.state.trim().length > 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid() || !cart) return;

    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        deliveryMethod,
        paymentMethod,
        notes: notes || undefined,
        couponCode: couponCode || undefined,
        customerName: customer.fullName.trim(),
        customerEmail: customer.email.trim(),
        customerPhone: customer.phone.trim()};

      if (deliveryMethod !== 'PICKUP') {
        payload.shippingAddress = {
          fullName: customer.fullName,
          phone: customer.phone,
          address: customer.address,
          city: customer.city,
          state: customer.state,
          country: 'NG'};
      }

      const res = await checkoutApi.checkout(cart.storeId, payload);
      const order = res?.data?.data;
      const orderId = order?.id;

      if (!orderId) {
        toast.error('Order was not created. Please try again.');
        return;
      }

      const orderTotal = Number(order.total || 0);

      if (orderTotal > 0) {
        const payRes = await paymentApi.initiate({
          orderId,
          paymentMethod,
          paymentProvider: 'paystack',
          email: customer.email,
          callbackUrl: `${window.location.origin}/payment/callback?orderId=${orderId}`,
        });
        const data = payRes?.data?.data;
        const authUrl = data?.authorizationUrl;
        if (authUrl) {
          window.location.href = authUrl;
          return;
        }
        toast.error('Payment link could not be generated. Your order is saved — retry payment from your orders page.');
        return;
      }

      toast.success('Order placed successfully!');
      router.push(`/storefront/order-confirmation?id=${orderId}`);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingCart) return <LoadingState message="Preparing checkout..." />;

  if (error) return <ErrorState title="Checkout unavailable" description={error} onRetry={handleRetry} />;

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="Nothing to checkout"
        description="Your cart is empty. Add some items before checking out."
        action={{
          label: 'Browse Stores',
          onClick: () => router.push('/storefront')}}
      />
    );
  }

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: cart.currency || 'NGN',
      minimumFractionDigits: 2}).format(price);

  return (
    <div className="space-y-6 py-4 max-w-3xl mx-auto">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Cart
      </button>

      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Checkout
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Delivery Method */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Truck className="h-5 w-5 text-blue-600" />
            Delivery Method
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { value: 'PICKUP' as const, label: 'Pickup', desc: 'Collect from store' },
              { value: 'LOCAL_DELIVERY' as const, label: 'Local Delivery', desc: 'Same city delivery' },
              { value: 'INTERSTATE_DELIVERY' as const, label: 'Interstate', desc: 'Cross-country shipping' },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setDeliveryMethod(option.value)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  deliveryMethod === option.value
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }`}
              >
                <Package className={`h-5 w-5 mb-2 ${
                  deliveryMethod === option.value ? 'text-blue-600' : 'text-gray-400'
                }`} />
                <div className="font-medium text-sm text-gray-900 dark:text-white">{option.label}</div>
                <div className="text-xs text-gray-500">{option.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Customer Details */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">
            Customer Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input id="fullName" name="fullName" value={customer.fullName} onChange={handleChange} placeholder="John Doe" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" name="email" type="email" value={customer.email} onChange={handleChange} placeholder="john@example.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input id="phone" name="phone" type="tel" value={customer.phone} onChange={handleChange} placeholder="+234 800 000 0000" required />
            </div>
            {deliveryMethod !== 'PICKUP' && (
              <>
                <div className="sm:col-span-2 space-y-2">
                  <Label htmlFor="address">Delivery Address *</Label>
                  <Input id="address" name="address" value={customer.address} onChange={handleChange} placeholder="123 Main Street" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input id="city" name="city" value={customer.city} onChange={handleChange} placeholder="Lagos" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Input id="state" name="state" value={customer.state} onChange={handleChange} placeholder="Lagos State" required />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Payment Method */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-blue-600" />
            Payment Method
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { value: 'CARD' as const, icon: CreditCard, label: 'Card', desc: 'Debit/Credit card' },
              { value: 'BANK_TRANSFER' as const, icon: Building2, label: 'Bank Transfer', desc: 'Pay via bank transfer' },
              { value: 'MOBILE_MONEY' as const, icon: Smartphone, label: 'Mobile Money', desc: 'USSD or mobile wallet' },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setPaymentMethod(option.value)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  paymentMethod === option.value
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }`}
              >
                <option.icon className={`h-5 w-5 mb-2 ${
                  paymentMethod === option.value ? 'text-blue-600' : 'text-gray-400'
                }`} />
                <div className="font-medium text-sm text-gray-900 dark:text-white">{option.label}</div>
                <div className="text-xs text-gray-500">{option.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Coupon + Notes */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Tag className="h-5 w-5 text-blue-600" />
            Coupon & Notes
          </h2>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="couponCode">Coupon Code</Label>
              <span className="inline-flex items-center rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Coming soon
              </span>
            </div>
            <Input
              id="couponCode"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              placeholder="e.g. WELCOME10"
              className="uppercase opacity-60"
              disabled
              aria-disabled="true"
            />
            <p className="text-xs text-gray-400">Discount codes are on the way — stay tuned.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Order Notes (optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special instructions for the store..."
              rows={3}
            />
          </div>
        </div>

        {/* Order Summary */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">
            Order Summary
          </h2>
          <div className="space-y-3">
            {cart.items.map((item) => (
              <div key={item.productId} className="flex items-center justify-between gap-3 text-sm">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="relative w-9 h-9 shrink-0 rounded-md bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    {item.productImage ? (
                      <Image src={item.productImage} alt={item.productName || 'Product'} fill unoptimized className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">N/A</div>
                    )}
                  </div>
                  <span className="text-gray-600 dark:text-gray-400 truncate">
                    {item.productName || 'Product'} &times; {item.quantity}
                  </span>
                </div>
                <span className="font-medium text-gray-900 dark:text-white shrink-0">
                  {formatPrice(item.lineTotal)}
                </span>
              </div>
            ))}
          </div>
          <div className="pt-3 border-t border-gray-200 dark:border-gray-800 space-y-1">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>Subtotal</span>
              <span>{formatPrice(cart.subtotal)}</span>
            </div>
            {cart.shipping > 0 && (
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>Shipping</span>
                <span>{formatPrice(cart.shipping)}</span>
              </div>
            )}
            {cart.discount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount</span>
                <span>-{formatPrice(cart.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white pt-2 border-t border-gray-200 dark:border-gray-800">
              <span>Total</span>
              <span>{formatPrice(cart.total)}</span>
            </div>
          </div>
        </div>

        <Button type="submit" size="lg" className="w-full h-14 text-base" disabled={!isFormValid() || submitting}>
          {submitting ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Placing Order...
            </>
          ) : (
            `Place Order — ${formatPrice(cart.total)}`
          )}
        </Button>
      </form>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <CheckoutPageContent />
    </Suspense>
  );
}
