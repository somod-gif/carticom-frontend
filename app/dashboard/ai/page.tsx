'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentStoreId } from '@/hooks/useCurrentStore';
import { useAIConfig, useToggleAI } from '@/features/dashboard/hooks/useAI';
import { LoadingState, ErrorState, EmptyState } from '@/components/dashboard/shared/StateComponents';
import { AIStatus } from '@/features/dashboard/types/ai.types';
import { MessageSquare, ShoppingCart, TrendingUp, Brain, Loader2 } from 'lucide-react';
import axiosInstance from '@/lib/axios';
import { showToast } from '@/lib/notifications/toast';

const statusColors: Record<AIStatus, string> = {
  [AIStatus.ACTIVE]: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  [AIStatus.INACTIVE]: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
  [AIStatus.ERROR]: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  [AIStatus.PENDING]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'};

export default function AIPage() {
  const router = useRouter();
  const { storeId, isLoading: storesLoading } = useCurrentStoreId();
  const { data: aiConfig, isLoading, error, refetch } = useAIConfig(storeId ?? '');
  const toggleMutation = useToggleAI();
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<string | null>(null);

  const handleToggle = () => {
    if (!aiConfig || !storeId) return;
    toggleMutation.mutate({ storeId, enabled: !aiConfig.enabled });
  };

  if (isLoading || storesLoading) return <LoadingState message="Loading AI assistant settings..." />;
  if (error) return <ErrorState title="We couldn't load your AI assistant settings" onRetry={refetch} />;
  if (!storeId) return (
    <EmptyState
      title="Set up your shop first"
      description="You need a shop before the AI assistant can be switched on. It only takes a few minutes."
      action={{ label: 'Set up my shop', onClick: () => router.push('/onboarding') }}
    />
  );
  if (!aiConfig) return (
    <EmptyState
      title="This feature isn't switched on yet"
      description="The AI assistant isn't available for your shop yet. Contact support and we'll set it up with you."
      action={{ label: 'Contact support', onClick: () => router.push('/dashboard/support') }}
    />
  );

  const { enabled, status, usage, provider, model, settings } = aiConfig;

  const stats = [
    { label: 'Messages', value: String(usage.messages), icon: MessageSquare },
    { label: 'Conversations', value: String(usage.conversations), icon: ShoppingCart },
    { label: 'Tokens Used', value: usage.tokensUsed.toLocaleString(), icon: TrendingUp },
    { label: 'Status', value: status === AIStatus.ACTIVE ? 'Active' : 'Inactive', icon: Brain },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Carticom AI</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          AI-powered WhatsApp commerce for your business
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">AI assistant settings</h2>
            <p className="text-sm text-gray-500">
              {provider} — {model}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 text-sm rounded-full ${statusColors[status]}`}>
              {enabled ? 'Enabled' : 'Disabled'}
            </span>
            <button
              onClick={handleToggle}
              disabled={toggleMutation.isPending}
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                enabled
                  ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400'
                  : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400'
              }`}
            >
              {toggleMutation.isPending ? 'Updating...' : enabled ? 'Disable' : 'Enable'}
            </button>
          </div>
        </div>

        {settings && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <p className="text-xs text-gray-500">Welcome Message</p>
              <p className="text-sm text-gray-900 dark:text-white mt-1 truncate">
                {settings.welcomeMessage || '—'}
              </p>
            </div>
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <p className="text-xs text-gray-500">Language</p>
              <p className="text-sm text-gray-900 dark:text-white mt-1">{settings.language || '—'}</p>
            </div>
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <p className="text-xs text-gray-500">Tone</p>
              <p className="text-sm text-gray-900 dark:text-white mt-1">{settings.tone || '—'}</p>
            </div>
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <p className="text-xs text-gray-500">Auto Reply</p>
              <p className="text-sm text-gray-900 dark:text-white mt-1">
                {settings.autoReply ? 'Enabled' : 'Disabled'}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Knowledge Base</h2>
        <p className="text-sm text-gray-500 mb-4">Teach AI about your business — FAQs, policies, and products</p>
        <div className="text-center py-8 text-gray-500">
          No knowledge base items yet. Add FAQs and policies to train your AI.
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          'Generate Product Description',
          'Generate Marketing Copy',
          'Summarize Sales',
          'Predict Stock',
        ].map((action) => (
          <button
            key={action}
            onClick={async () => {
              if (!storeId) return;
              setAiLoading(action);
              setAiResult(null);
              try {
                const res = await axiosInstance.post('/api/v1/ai/generate', {
                  action,
                  storeId,
                });
                const data = res.data?.data;
                setAiResult(data?.result ?? `AI action "${action}" completed.`);
                showToast('success', `${action} completed`);
              } catch {
                showToast('info', `${action} — Coming soon`);
                setAiResult(null);
              } finally {
                setAiLoading(null);
              }
            }}
            disabled={!!aiLoading}
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-900 dark:text-white hover:border-blue-500 transition-colors disabled:opacity-50"
          >
            {aiLoading === action ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Running...
              </span>
            ) : (
              action
            )}
          </button>
        ))}
      </div>

      {aiResult && (
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">AI Result</h2>
          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{aiResult}</p>
        </div>
      )}
    </div>
  );
}
