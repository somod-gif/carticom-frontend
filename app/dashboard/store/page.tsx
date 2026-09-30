'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useMyStores, useUpdateStore } from '@/features/onboarding/hooks/useOnboarding';
import { LoadingState, EmptyState, ErrorState } from '@/components/dashboard/shared/StateComponents';
import { Globe, Eye, Upload, ExternalLink, Check, ChevronDown, Copy, Palette, Type, Link2, Layout, Code } from 'lucide-react';
import { showToast } from '@/lib/notifications/toast';
import { getTemplateIcon, getTemplatesForCategory } from '@/features/templates/registry';
import { BUSINESS_CATEGORIES } from '@/features/templates/types';
import axiosInstance from '@/lib/axios';
import { cn } from '@/lib/utils';
import { FileUpload } from '@/components/ui/FileUpload';

export default function StorePage() {
  const user = useAuthStore((state) => state.user);
  const { data: stores, isLoading, error, refetch } = useMyStores();
  const updateStore = useUpdateStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const store = stores?.[0] ?? null;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
const [editing, setEditing] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDesc, setSeoDesc] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#4f46e5');
  const [secondaryColor, setSecondaryColor] = useState('#7c3aed');
  const [fontFamily, setFontFamily] = useState('Inter');
  const [facebookUrl, setFacebookUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [twitterUrl, setTwitterUrl] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [customCss, setCustomCss] = useState('');

  const [syncedStore, setSyncedStore] = useState<typeof store>(null);

  useEffect(() => {
    if (store && store !== syncedStore) {
      setSyncedStore(store);
      setName(store.name ?? '');
      setDescription(store.description ?? '');
      setSeoTitle(store.name ?? '');
      setSeoDesc(store.description ?? '');
      setPrimaryColor(store.primaryColor ?? '#4f46e5');
      setSecondaryColor(store.secondaryColor ?? '#7c3aed');
      setFontFamily(store.fontFamily ?? 'Inter');
      setFacebookUrl(store.facebookUrl ?? '');
      setInstagramUrl(store.instagramUrl ?? '');
      setTwitterUrl(store.twitterUrl ?? '');
      setWhatsappNumber(store.whatsappNumber ?? '');
      setCustomCss(store.customCss ?? '');
    }
  }, [store, syncedStore]);

const handleSave = () => {
    if (!store) return;
    updateStore.mutate(
      { id: store.id, data: { storeName: name, description } },
      { onSuccess: () => setEditing(false) }
    );
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !store) return;
    try {
      const formData = new FormData();
      formData.append('file', file);
      await axiosInstance.post(`/api/v1/stores/${store.id}/logo`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }});
      showToast('success', 'Logo uploaded successfully');
      refetch();
    } catch {
      showToast('error', 'Failed to upload logo');
    }
  };

  const handleBannerUploaded = async (url: string) => {
    if (!store) return;
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const ext = url.split('.').pop() || 'png';
      const file = new File([blob], `banner.${ext}`, { type: blob.type });
      const formData = new FormData();
      formData.append('file', file);
      await axiosInstance.post(`/api/v1/stores/${store.id}/banner`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      showToast('success', 'Banner uploaded successfully');
      refetch();
    } catch {
      showToast('error', 'Failed to upload banner');
    }
  };

  const handleSaveSeo = async () => {
    if (!store) return;
    try {
      await updateStore.mutateAsync({
        id: store.id,
        data: { seoTitle, seoDescription: seoDesc },
      });
      showToast('success', 'SEO settings saved');
      refetch();
    } catch {
      showToast('error', 'Failed to save SEO settings');
    }
  };

  const handleSaveColors = async () => {
    if (!store) return;
    try {
      await updateStore.mutateAsync({
        id: store.id,
        data: { primaryColor, secondaryColor },
      });
      showToast('success', 'Colors saved');
      refetch();
    } catch {
      showToast('error', 'Failed to save colors');
    }
  };

  const handleSaveFont = async () => {
    if (!store) return;
    try {
      await updateStore.mutateAsync({
        id: store.id,
        data: { fontFamily },
      });
      showToast('success', 'Font saved');
      refetch();
    } catch {
      showToast('error', 'Failed to save font');
    }
  };

  const handleSaveSocialLinks = async () => {
    if (!store) return;
    try {
      await updateStore.mutateAsync({
        id: store.id,
        data: { facebookUrl, instagramUrl, twitterUrl, whatsappNumber },
      });
      showToast('success', 'Social links saved');
      refetch();
    } catch {
      showToast('error', 'Failed to save social links');
    }
  };

  const handleSaveCustomCss = async () => {
    if (!store) return;
    try {
      await updateStore.mutateAsync({
        id: store.id,
        data: { customCss },
      });
      showToast('success', 'Custom CSS saved');
      refetch();
    } catch {
      showToast('error', 'Failed to save custom CSS');
    }
  };

  const handleTogglePublish = async () => {
    if (!store) return;
    setPublishing(true);
    try {
      const action = store.status === 'ACTIVE' ? 'unpublish' : 'publish';
      await axiosInstance.patch(`/api/v1/stores/${store.id}/${action}`);
      showToast('success', `Store ${action === 'publish' ? 'published' : 'unpublished'} successfully`);
      refetch();
    } catch {
      showToast('error', 'Failed to update store status');
    } finally {
      setPublishing(false);
    }
  };

  if (isLoading) {
    return <LoadingState message="Loading store..." />;
  }

  if (error) {
    return <ErrorState onRetry={() => refetch()} />;
  }

  if (!store) {
    return <EmptyState title="No store found" description="You don't have any stores yet." />;
  }

  const isPublished = store.status === 'ACTIVE';
  const storefrontUrl = `${window.location.origin}/store/${store.slug}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Store</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your store settings and branding
          </p>
        </div>
          <div className="flex gap-2">
            {isPublished && (
              <a
                href={storefrontUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <Eye className="h-4 w-4" />
                View Store
              </a>
            )}
            <button
              onClick={() => {
                navigator.clipboard.writeText(storefrontUrl);
                showToast('success', 'Store link copied!');
              }}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <Copy className="h-4 w-4" />
              Copy Link
            </button>
            <button
              onClick={handleTogglePublish}
            disabled={publishing}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${
              isPublished
                ? 'border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <Globe className="h-4 w-4" />
            {publishing ? '...' : isPublished ? 'Unpublish' : 'Publish'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Store Information</h2>
            <button
              onClick={() => setEditing(!editing)}
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium"
            >
              {editing ? 'Cancel' : 'Edit'}
            </button>
          </div>
          {editing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Store Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  rows={3}
                />
              </div>
              <button
                onClick={handleSave}
                disabled={updateStore.isPending}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {updateStore.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Store Name</label>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">{store.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">{store.description || 'No description'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Slug</label>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">/{store.slug}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  store.status === 'ACTIVE'
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : store.status === 'PENDING'
                    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  {store.status}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Currency</label>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">{store.currency}</p>
              </div>
              {isPublished && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Store URL</label>
                  <a href={storefrontUrl} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400">
                    {storefrontUrl} <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Branding</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Logo</label>
              <div className="mt-2 flex items-start gap-4">
                <div className="relative w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center overflow-hidden shrink-0">
                  {store.logoUrl ? (
                    <Image src={store.logoUrl} alt="Store logo" fill unoptimized className="object-cover" />
                  ) : (
                    <span className="text-xs text-gray-500">No logo</span>
                  )}
                </div>
                <div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <Upload className="h-4 w-4" />
                    Upload Logo
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoUpload}
                  />
                  <p className="text-xs text-gray-500 mt-2">Recommended: 512x512px, PNG or JPG</p>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Banner</label>
              <div className="mt-2">
                <FileUpload
                  folder="banners"
                  onUploaded={handleBannerUploaded}
                  currentUrl={store.bannerUrl}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Business Owner</label>
              <p className="mt-1 text-sm text-gray-900 dark:text-white">{user?.fullName || 'Not set'}</p>
            </div>
          </div>
        </div>

        {/* Colors & Fonts */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Palette className="h-5 w-5" /> Colors & Fonts
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Primary Color</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-10 h-10 rounded border border-gray-300 dark:border-gray-700 cursor-pointer" />
                  <input type="text" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm font-mono" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Secondary Color</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} className="w-10 h-10 rounded border border-gray-300 dark:border-gray-700 cursor-pointer" />
                  <input type="text" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm font-mono" />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                <Type className="h-4 w-4" /> Font Family
              </label>
              <select value={fontFamily} onChange={(e) => setFontFamily(e.target.value)} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                <option value="Inter">Inter</option>
                <option value="Roboto">Roboto</option>
                <option value="Open Sans">Open Sans</option>
                <option value="Lato">Lato</option>
                <option value="Poppins">Poppins</option>
                <option value="Montserrat">Montserrat</option>
                <option value="Raleway">Raleway</option>
                <option value="Nunito">Nunito</option>
                <option value="Playfair Display">Playfair Display</option>
                <option value="Merriweather">Merriweather</option>
              </select>
            </div>
            <button onClick={handleSaveColors} disabled={updateStore.isPending} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm">
              Save Colors & Font
            </button>
          </div>
        </div>

        {/* Social Links */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Link2 className="h-5 w-5" /> Social Media Connect
          </h2>
          <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-6 text-center">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Coming Soon</p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Connect Facebook, Instagram, X and WhatsApp to your storefront — launching soon.
            </p>
          </div>
        </div>

        {/* Custom CSS */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Code className="h-5 w-5" /> Custom CSS
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Add custom CSS to further customize your storefront appearance. This will be injected into your store page.
          </p>
          <textarea
            value={customCss}
            onChange={(e) => setCustomCss(e.target.value)}
            placeholder="/* Add your custom CSS here */&#10;.store-header {&#10;  border-bottom: 2px solid #4f46e5;&#10;}"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm font-mono resize-y"
            rows={6}
          />
          <button onClick={handleSaveCustomCss} disabled={updateStore.isPending} className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm">
            Save Custom CSS
          </button>
        </div>

        {/* Template Selection */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Storefront Template</h2>
          <div className="space-y-4">
            {BUSINESS_CATEGORIES.map((cat) => {
              const catTemplates = getTemplatesForCategory(cat.value);
              if (catTemplates.length === 0) return null;
              return (
                <details key={cat.value} className="group rounded-2xl border border-gray-200 dark:border-gray-700 open:bg-gray-50 dark:open:bg-gray-800/50 transition-colors">
                  <summary className="flex items-center justify-between px-4 py-3 cursor-pointer list-none text-sm font-semibold text-gray-900 dark:text-white">
                    <span className="capitalize">{cat.label.toLowerCase()}</span>
                    <ChevronDown className="h-4 w-4 text-gray-400 group-open:rotate-180 transition-transform" />
                  </summary>
                  <div className="px-4 pb-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {catTemplates.map((t) => {
                      const Icon = getTemplateIcon(t.id);
                      const isActive = store.template === t.id || (!store.template && t.id === catTemplates[0].id);
                      return (
                        <button
                          key={t.id}
                          onClick={async () => {
                            try {
                              await updateStore.mutateAsync({ id: store.id, data: { template: t.id } });
                              showToast('success', `Template updated to ${t.name}`);
                              refetch();
                            } catch {
                              showToast('error', 'Failed to update template');
                            }
                          }}
                          disabled={updateStore.isPending}
                          className={cn(
                            'relative flex flex-col items-center gap-2 p-3 rounded-2xl border-2 text-center transition-all',
                            isActive
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-sm'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm'
                          )}
                        >
                          {isActive && (
                            <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                              <Check className="h-2.5 w-2.5 text-white" />
                            </div>
                          )}
                          <Icon className={cn('h-5 w-5', isActive ? 'text-blue-600' : 'text-gray-600')} />
                          <div>
                            <p className="text-xs font-semibold text-gray-900 dark:text-white">{t.name}</p>
                            <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">{t.description.slice(0, 50)}...</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </details>
              );
            })}
          </div>
        </div>

        {/* SEO Settings */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">SEO & Preview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
<div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">SEO Title</label>
                <input
                  type="text"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  maxLength={60}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="Store SEO title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">SEO Description</label>
                <textarea
                  value={seoDesc}
                  onChange={(e) => setSeoDesc(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  rows={3}
                  placeholder="Store SEO description"
                />
              </div>
              <div>
                <button
                  type="button"
                  onClick={handleSaveSeo}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  Save SEO
                </button>
                <p className="text-xs text-gray-500 mt-2">
                  Your storefront already publishes your store name and description for search engines.
                </p>
              </div>
            </div>
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">
              <p className="text-xs font-medium text-gray-500 uppercase mb-2">Google Preview</p>
              <p className="text-sm text-blue-700 dark:text-blue-400 truncate">{seoTitle || store.name} — Carticom</p>
              <p className="text-xs text-green-700 dark:text-green-400 truncate">{storefrontUrl}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{seoDesc || store.description || 'Shop on Carticom'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
