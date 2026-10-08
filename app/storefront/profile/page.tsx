'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { User, LogIn, LogOut, Package, Mail, Phone, BadgeCheck, MapPin, Plus, Pencil, Trash2 } from 'lucide-react';
import { useAuthStore } from '@/features/auth/store/auth.store';
import {
  getCustomerToken,
  getCustomerUser,
  clearCustomerSession,
  type CustomerAuthData,
} from '@/features/storefront/services/customer-auth.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { LoadingState, EmptyState, ErrorState } from '@/components/dashboard/shared/StateComponents';
import { extractErrorMessage } from '@/lib/axios';
import { showToast } from '@/lib/notifications/toast';
import {
  useAddresses,
  useCreateAddress,
  useUpdateAddress,
  useDeleteAddress,
  useSetDefaultAddress,
  type AddressDto,
  type AddressInput,
} from '@/features/storefront/hooks/useAddresses';

function SignedOutPanel() {
  return (
    <div className="max-w-md mx-auto text-center space-y-6">
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 space-y-4">
        <div className="flex justify-center">
          <div className="h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <User className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Your Profile</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Sign in to view your profile, manage your details, and access your order history.
        </p>
        <Button asChild size="lg" className="w-full sm:w-auto">
          <Link href="/storefront/login">
            <LogIn className="h-5 w-5 mr-2" />
            Customer sign in
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
          <Link href="/login?redirect=/dashboard">Business owner sign in</Link>
        </Button>
      </div>
    </div>
  );
}

const emptyAddressForm: AddressInput = {
  label: '',
  street: '',
  city: '',
  state: '',
  country: '',
  phone: '',
  isDefault: false,
};

function SavedAddresses() {
  const { data: addresses, isPending, isError, error, refetch } = useAddresses();
  const createAddress = useCreateAddress();
  const updateAddress = useUpdateAddress();
  const deleteAddress = useDeleteAddress();
  const setDefaultAddress = useSetDefaultAddress();

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<AddressDto | null>(null);
  const [form, setForm] = useState<AddressInput>(emptyAddressForm);
  const [formError, setFormError] = useState<string | null>(null);

  const saving = createAddress.isPending || updateAddress.isPending;

  const startAdd = () => {
    setEditing(null);
    // Your first address is always the default, so tick the box when there's nothing saved yet.
    setForm({ ...emptyAddressForm, isDefault: (addresses?.length ?? 0) === 0 });
    setFormError(null);
    setShowForm(true);
  };

  const startEdit = (address: AddressDto) => {
    setEditing(address);
    setForm({
      label: address.label,
      street: address.street,
      city: address.city,
      state: address.state ?? '',
      country: address.country,
      phone: address.phone ?? '',
      isDefault: address.isDefault,
    });
    setFormError(null);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
    setFormError(null);
    setForm(emptyAddressForm);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload: AddressInput = {
      label: form.label?.trim(),
      street: form.street.trim(),
      city: form.city.trim(),
      state: form.state?.trim(),
      country: form.country.trim(),
      phone: form.phone?.trim(),
      isDefault: form.isDefault,
    };

    if (!payload.street || !payload.city || !payload.country) {
      setFormError('Please add a street address, city, and country.');
      return;
    }

    setFormError(null);
    const options = {
      onSuccess: closeForm,
      onError: (err: unknown) => setFormError(extractErrorMessage(err)),
    };

    if (editing) {
      updateAddress.mutate({ id: editing.id, data: payload }, options);
    } else {
      createAddress.mutate(payload, options);
    }
  };

  const handleDelete = (address: AddressDto) => {
    if (!window.confirm(`Remove "${address.label}" from your saved addresses?`)) return;
    deleteAddress.mutate(address.id, {
      onError: (err) => showToast('error', extractErrorMessage(err)),
    });
  };

  const handleSetDefault = (address: AddressDto) => {
    setDefaultAddress.mutate(address.id, {
      onError: (err) => showToast('error', extractErrorMessage(err)),
    });
  };

  if (isError) {
    return (
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <MapPin className="h-5 w-5 text-blue-600" />
          Saved addresses
        </h2>
        <ErrorState
          title="We couldn't load your saved addresses"
          description={extractErrorMessage(error)}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            Saved addresses
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Where we deliver your orders. You can save up to 20 addresses.
          </p>
        </div>
        {!showForm && (
          <Button size="sm" className="shrink-0" onClick={startAdd}>
            <Plus className="h-4 w-4 mr-1" />
            Add address
          </Button>
        )}
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/30 p-4 space-y-4"
        >
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              {editing ? 'Edit address' : 'Add an address'}
            </h3>
            <button
              type="button"
              className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              onClick={closeForm}
            >
              Cancel
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2 space-y-2">
              <Label htmlFor="address-label">Label</Label>
              <Input
                id="address-label"
                value={form.label ?? ''}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
                placeholder="Home"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">e.g. Home or Work</p>
            </div>
            <div className="sm:col-span-2 space-y-2">
              <Label htmlFor="address-street">Street address *</Label>
              <Input
                id="address-street"
                value={form.street}
                onChange={(e) => setForm({ ...form, street: e.target.value })}
                placeholder="123 Main Street"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address-city">City *</Label>
              <Input
                id="address-city"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="Lagos"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address-state">State</Label>
              <Input
                id="address-state"
                value={form.state ?? ''}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                placeholder="Lagos State"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address-country">Country *</Label>
              <Input
                id="address-country"
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                placeholder="Nigeria"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address-phone">Phone</Label>
              <Input
                id="address-phone"
                type="tel"
                value={form.phone ?? ''}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+234 800 000 0000"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={form.isDefault ?? false}
              onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300"
            />
            Set this as my default address
          </label>

          {formError && (
            <p className="text-sm text-red-600 dark:text-red-400" role="alert">
              {formError}
            </p>
          )}

          <div className="flex gap-3">
            <Button type="submit" size="sm" disabled={saving}>
              {saving ? 'Saving...' : editing ? 'Save changes' : 'Save address'}
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={closeForm} disabled={saving}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      {isPending ? (
        <LoadingState message="Loading your saved addresses..." />
      ) : addresses && addresses.length > 0 ? (
        <div className="space-y-3">
          {addresses.map((address) => (
            <div
              key={address.id}
              className="rounded-xl border border-gray-200 dark:border-gray-800 p-4 space-y-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-gray-900 dark:text-white">{address.label}</p>
                  {address.isDefault && <Badge variant="success">Default</Badge>}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{address.street}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {[address.city, address.state, address.country].filter(Boolean).join(', ')}
                </p>
                {address.phone && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5" />
                    {address.phone}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-2 border-t border-gray-100 dark:border-gray-800 pt-3">
                <Button type="button" variant="outline" size="sm" onClick={() => startEdit(address)}>
                  <Pencil className="h-3.5 w-3.5 mr-1.5" />
                  Edit
                </Button>
                {!address.isDefault && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleSetDefault(address)}
                    disabled={setDefaultAddress.isPending}
                  >
                    Make default
                  </Button>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-red-600 dark:text-red-400 hover:text-red-700"
                  onClick={() => handleDelete(address)}
                  disabled={deleteAddress.isPending}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={MapPin}
          title="No saved addresses yet"
          description="Add an address so we know where to deliver your orders."
          action={{ label: 'Add address', onClick: startAdd }}
          className="py-8"
        />
      )}
    </div>
  );
}

function CustomerPanel({ customer }: { customer: CustomerAuthData }) {
  const router = useRouter();
  const initials = (customer.fullName || customer.email || 'C')
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Your Profile</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Your store account details.
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 rounded-full">
            <AvatarFallback className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-lg font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <p className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              {customer.fullName || 'Customer'}
              <BadgeCheck className="h-5 w-5 text-emerald-500" aria-label="Customer account" />
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Store customer</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 border-t border-gray-100 dark:border-gray-800 pt-6">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" /> Email
            </p>
            <p className="text-sm text-gray-900 dark:text-white">{customer.email}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 border-t border-gray-100 dark:border-gray-800 pt-6">
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="/storefront/orders">
              <Package className="h-4 w-4 mr-2" />
              View my orders
            </Link>
          </Button>
          <Button
            variant="ghost"
            className="w-full sm:w-auto text-red-600 dark:text-red-400 hover:text-red-700"
            onClick={() => {
              clearCustomerSession();
              router.refresh();
            }}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign out
          </Button>
        </div>
      </div>

      <SavedAddresses />
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const authLoading = useAuthStore((s) => s.isLoading);
  const logout = useAuthStore((s) => s.logout);
  // Storefront customers use their own store-scoped session.
  // Once auth has finished loading and there's no business-owner session,
  // check for a store-customer session in localStorage.
  const customerChecked = !authLoading && !isAuthenticated;

  if (authLoading) return <LoadingState message="Checking your account..." />;

  if (!isAuthenticated || !user) {
    if (!customerChecked) return <LoadingState message="Checking your account..." />;
    const customer = getCustomerUser();
    if (customer && getCustomerToken()) return <CustomerPanel customer={customer} />;
    return <SignedOutPanel />;
  }

  const initials = user.fullName
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Your Profile</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Your account details across Carticom stores.
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 rounded-full">
            <AvatarImage src={user.avatarUrl} alt={user.fullName} />
            <AvatarFallback className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-lg font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <p className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              {user.fullName}
              {user.emailVerified && (
                <BadgeCheck className="h-5 w-5 text-emerald-500" aria-label="Email verified" />
              )}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{user.role.replace(/_/g, ' ')}</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 border-t border-gray-100 dark:border-gray-800 pt-6">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" /> Email
            </p>
            <p className="text-sm text-gray-900 dark:text-white">{user.email}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5" /> Phone
            </p>
            <p className="text-sm text-gray-900 dark:text-white">{user.phone || 'Not provided'}</p>
          </div>
          {user.businessName && (
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
                Business
              </p>
              <p className="text-sm text-gray-900 dark:text-white">{user.businessName}</p>
            </div>
          )}
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
              Member since
            </p>
            <p className="text-sm text-gray-900 dark:text-white">
              {new Date(user.createdAt).toLocaleDateString('en-NG', {
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 border-t border-gray-100 dark:border-gray-800 pt-6">
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="/storefront/orders">
              <Package className="h-4 w-4 mr-2" />
              View my orders
            </Link>
          </Button>
          <Button
            variant="ghost"
            className="w-full sm:w-auto text-red-600 dark:text-red-400 hover:text-red-700"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign out
          </Button>
        </div>
      </div>

      <SavedAddresses />
    </div>
  );
}
