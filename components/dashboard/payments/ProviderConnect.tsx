'use client';

import { useEffect, useState } from 'react';
import { KeyRound, CheckCircle2, AlertCircle, Link2, Eye, EyeOff } from 'lucide-react';
import { storeApi } from '@/features/onboarding/services/onboarding.service';
import type { StorePaymentConfigDto } from '@/features/onboarding/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog } from '@/components/ui/dialog';
import { showToast } from '@/lib/notifications/toast';

type Provider = 'PAYSTACK' | 'FLUTTERWAVE';

interface ProviderCard {
  provider: Provider;
  name: string;
  connected: boolean;
  hint: string;
}

export function ProviderConnect({ storeId }: { storeId: string }) {
  const [config, setConfig] = useState<StorePaymentConfigDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeProvider, setActiveProvider] = useState<Provider>('PAYSTACK');
  const [saving, setSaving] = useState(false);
  const [showSecrets, setShowSecrets] = useState(false);

  const [paystackSecretKey, setPaystackSecretKey] = useState('');
  const [paystackPublicKey, setPaystackPublicKey] = useState('');
  const [flutterwaveSecretKey, setFlutterwaveSecretKey] = useState('');
  const [flutterwaveVerifyHash, setFlutterwaveVerifyHash] = useState('');

  const load = async () => {
    try {
      const res = await storeApi.getPaymentConfig(storeId);
      const cfg = res.data.data ?? null;
      setConfig(cfg);
      if (cfg?.activeProvider) setActiveProvider(cfg.activeProvider as Provider);
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await storeApi.getPaymentConfig(storeId);
        if (cancelled) return;
        const cfg = res.data.data ?? null;
        setConfig(cfg);
        if (cfg?.activeProvider) setActiveProvider(cfg.activeProvider as Provider);
        setError(false);
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [storeId]);

  const openDialog = (provider: Provider) => {
    setActiveProvider(provider);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const payload: Record<string, string> = { activeProvider };
      if (activeProvider === 'PAYSTACK') {
        if (paystackSecretKey.trim()) payload.paystackSecretKey = paystackSecretKey.trim();
        if (paystackPublicKey.trim()) payload.paystackPublicKey = paystackPublicKey.trim();
      } else {
        if (flutterwaveSecretKey.trim()) payload.flutterwaveSecretKey = flutterwaveSecretKey.trim();
        if (flutterwaveVerifyHash.trim()) payload.flutterwaveVerifyHash = flutterwaveVerifyHash.trim();
      }
      await storeApi.savePaymentCredentials(storeId, payload);
      showToast('success', 'Payment details saved');
      setDialogOpen(false);
      setPaystackSecretKey('');
      setPaystackPublicKey('');
      setFlutterwaveSecretKey('');
      setFlutterwaveVerifyHash('');
      await load();
    } catch {
      showToast('error', "We couldn't save your details. Check the keys and try again.");
    } finally {
      setSaving(false);
    }
  };

  const cards: ProviderCard[] = [
    {
      provider: 'PAYSTACK',
      name: 'Paystack',
      connected: !!config?.paystackConnected,
      hint: config?.paystackPublicKeyMasked
        ? `Key on file: ${config.paystackPublicKeyMasked}`
        : 'Accept card, transfer, and USSD payments in Nigeria.',
    },
    {
      provider: 'FLUTTERWAVE',
      name: 'Flutterwave',
      connected: !!config?.flutterwaveConnected,
      hint: 'Accept payments across 30+ African countries and 150+ currencies.',
    },
  ];

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 space-y-3">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Payment Methods</h2>
        <div className="space-y-3">
          {['Paystack', 'Flutterwave'].map((name) => (
            <div key={name} className="h-14 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Payment Methods</h2>
          <Button variant="outline" size="sm" onClick={load}>Retry</Button>
        </div>
        <p className="mt-4 text-sm text-gray-500 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-500" />
          We couldn&apos;t load your payment settings.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Payment Methods</h2>
        <span className="text-xs text-gray-500">
          {config?.activeProvider
            ? `Using ${config.activeProvider === 'PAYSTACK' ? 'Paystack' : 'Flutterwave'}`
            : 'Not connected yet'}
        </span>
      </div>

      <div className="space-y-3">
        {cards.map((card) => (
          <div
            key={card.provider}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
          >
            <div className="flex items-start gap-3">
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${card.connected ? 'bg-green-100 dark:bg-green-900/30' : 'bg-blue-50 dark:bg-blue-900/20'}`}>
                {card.connected
                  ? <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                  : <KeyRound className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                  {card.name}
                  {config?.activeProvider === card.provider && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                      ACTIVE
                    </span>
                  )}
                </p>
                <p className="text-xs text-gray-500 mt-0.5 max-w-sm">{card.hint}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className={`text-xs px-2 py-1 rounded-full ${card.connected
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                {card.connected ? 'Connected' : 'Not Connected'}
              </span>
              <Button variant="outline" size="sm" onClick={() => openDialog(card.provider)}>
                <Link2 className="h-3.5 w-3.5 mr-1.5" />
                {card.connected ? 'Manage' : 'Connect'}
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={`Connect ${activeProvider === 'PAYSTACK' ? 'Paystack' : 'Flutterwave'}`}
        description={activeProvider === 'PAYSTACK'
          ? 'Paste your two Paystack keys below. Your secret key is stored safely and never shown again.'
          : 'Paste your two Flutterwave keys below. They are stored safely and never shown again.'}
      >
        <div className="space-y-4 py-2">
          <div className="flex gap-2">
            {(['PAYSTACK', 'FLUTTERWAVE'] as Provider[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setActiveProvider(p)}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${activeProvider === p
                  ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                  : 'border-gray-200 text-gray-600 dark:border-gray-700 dark:text-gray-400 hover:border-gray-300'}`}
              >
                {p === 'PAYSTACK' ? 'Paystack' : 'Flutterwave'}
              </button>
            ))}
          </div>

          {activeProvider === 'PAYSTACK' ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="paystack-secret">Secret key</Label>
                <div className="relative">
                  <Input
                    id="paystack-secret"
                    type={showSecrets ? 'text' : 'password'}
                    placeholder="sk_live_..."
                    value={paystackSecretKey}
                    onChange={(e) => setPaystackSecretKey(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecrets(!showSecrets)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label="Show or hide the secret key"
                  >
                    {showSecrets ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500">Copy it from Settings → API Keys in your Paystack dashboard.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="paystack-public">Public key</Label>
                <Input
                  id="paystack-public"
                  type="text"
                  placeholder="pk_live_..."
                  value={paystackPublicKey}
                  onChange={(e) => setPaystackPublicKey(e.target.value)}
                />
                <p className="text-xs text-gray-500">On the same page as the secret key. This one is safe to share.</p>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="flw-secret">Secret key</Label>
                <div className="relative">
                  <Input
                    id="flw-secret"
                    type={showSecrets ? 'text' : 'password'}
                    placeholder="FLWSECK-..."
                    value={flutterwaveSecretKey}
                    onChange={(e) => setFlutterwaveSecretKey(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecrets(!showSecrets)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label="Show or hide the secret key"
                  >
                    {showSecrets ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500">Copy it from Settings → API in your Flutterwave dashboard.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="flw-verify">Secret key (payment confirmation)</Label>
                <Input
                  id="flw-verify"
                  type="text"
                  placeholder="Paste it here"
                  value={flutterwaveVerifyHash}
                  onChange={(e) => setFlutterwaveVerifyHash(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  Paste the secret key from your provider&apos;s dashboard — it&apos;s how we confirm a payment
                  really happened. You&apos;ll find it on the Webhooks page of your Flutterwave dashboard.
                </p>
              </div>
            </>
          )}

          <details className="rounded-lg border border-gray-200 dark:border-gray-700 p-3">
            <summary className="cursor-pointer select-none text-xs font-medium text-gray-600 dark:text-gray-300">
              Advanced — automatic order updates
            </summary>
            <div className="mt-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-3 text-xs text-amber-800 dark:text-amber-300">
              Whoever helps you set up Carticom may need this address. It goes into the webhook settings of your
              provider&apos;s dashboard, so order updates arrive automatically:{' '}
              <code className="font-mono">https://&lt;your-backend&gt;/api/v1/payments/webhook</code>
            </div>
          </details>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save details'}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
