'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { ArrowLeft, Building2, Globe, Users, Package, DollarSign, Clock, Loader2 } from 'lucide-react';

import { LoadingState, ErrorState } from '@/components/dashboard/shared/StateComponents';
import { customSolutionsService } from '@/features/custom-solutions/services/custom-solutions.service';
import { CustomSolutionStatus } from '@/features/custom-solutions/types';
import type { UpdateStatusDto, QuotationDto } from '@/features/custom-solutions/types';

const ALLOWED_TRANSITIONS: Record<CustomSolutionStatus, CustomSolutionStatus[]> = {
  [CustomSolutionStatus.SUBMITTED]: [CustomSolutionStatus.UNDER_REVIEW, CustomSolutionStatus.REJECTED],
  [CustomSolutionStatus.UNDER_REVIEW]: [CustomSolutionStatus.MEETING_SCHEDULED, CustomSolutionStatus.QUOTATION_SENT, CustomSolutionStatus.REJECTED],
  [CustomSolutionStatus.MEETING_SCHEDULED]: [CustomSolutionStatus.QUOTATION_SENT, CustomSolutionStatus.NEGOTIATION, CustomSolutionStatus.REJECTED],
  [CustomSolutionStatus.QUOTATION_SENT]: [CustomSolutionStatus.NEGOTIATION, CustomSolutionStatus.QUOTATION_SENT, CustomSolutionStatus.APPROVED, CustomSolutionStatus.REJECTED],
  [CustomSolutionStatus.NEGOTIATION]: [CustomSolutionStatus.QUOTATION_SENT, CustomSolutionStatus.APPROVED, CustomSolutionStatus.REJECTED],
  [CustomSolutionStatus.APPROVED]: [CustomSolutionStatus.DEVELOPMENT, CustomSolutionStatus.QUOTATION_SENT],
  [CustomSolutionStatus.PAID]: [CustomSolutionStatus.DEVELOPMENT],
  [CustomSolutionStatus.DEVELOPMENT]: [CustomSolutionStatus.TESTING],
  [CustomSolutionStatus.TESTING]: [CustomSolutionStatus.DEPLOYED],
  [CustomSolutionStatus.DEPLOYED]: [CustomSolutionStatus.COMPLETED],
  [CustomSolutionStatus.REJECTED]: [],
  [CustomSolutionStatus.COMPLETED]: [],
};

const statusColors: Record<string, string> = {
  [CustomSolutionStatus.SUBMITTED]: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  [CustomSolutionStatus.UNDER_REVIEW]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  [CustomSolutionStatus.MEETING_SCHEDULED]: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  [CustomSolutionStatus.QUOTATION_SENT]: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
  [CustomSolutionStatus.NEGOTIATION]: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  [CustomSolutionStatus.APPROVED]: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  [CustomSolutionStatus.PAID]: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  [CustomSolutionStatus.DEVELOPMENT]: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
  [CustomSolutionStatus.TESTING]: 'bg-brand-100 text-brand-800 dark:bg-brand-900/30 dark:text-brand-400',
  [CustomSolutionStatus.DEPLOYED]: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  [CustomSolutionStatus.COMPLETED]: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  [CustomSolutionStatus.REJECTED]: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'};

export default function SuperAdminCustomSolutionDetailPage() {
  const params = useParams();
  const queryClient = useQueryClient();
  const id = params.id as string;

  const [note, setNote] = useState('');
  const [quotationAmount, setQuotationAmount] = useState('');
  const [quotationNote, setQuotationNote] = useState('');
  const [quotationFile, setQuotationFile] = useState<File | null>(null);
  const [assigneeId, setAssigneeId] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  const { data: req, isLoading, error, refetch } = useQuery({
    queryKey: ['super-admin', 'custom-solutions', id],
    queryFn: () => customSolutionsService.getById(id),
    enabled: !!id});

  useEffect(() => {
    if (!req) return;
    setAssigneeId(req.assignedTo ?? '');
    setAdminNotes(req.adminNotes ?? '');
  }, [req]);

  const statusMutation = useMutation({
    mutationFn: ({ status, note: n }: UpdateStatusDto) =>
      customSolutionsService.adminUpdateStatus(id, { status, note: n }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['super-admin', 'custom-solutions'] });
      refetch();
      setNote('');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Invalid status transition');
    }});

  const quotationMutation = useMutation({
    mutationFn: (dto: QuotationDto) =>
      customSolutionsService.adminUploadQuotation(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['super-admin', 'custom-solutions'] });
      refetch();
      setQuotationAmount('');
      setQuotationNote('');
      setQuotationFile(null);
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to upload quotation');
    }});

  const assignMutation = useMutation({
    mutationFn: (dto: { assigneeId: string }) => customSolutionsService.adminAssign(id, dto),
    onSuccess: () => {
      toast.success('Request assigned');
      queryClient.invalidateQueries({ queryKey: ['super-admin', 'custom-solutions'] });
      refetch();
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to assign request');
    }});

  const notesMutation = useMutation({
    mutationFn: (dto: { note: string }) => customSolutionsService.adminAddNotes(id, dto),
    onSuccess: () => {
      toast.success('Notes saved');
      queryClient.invalidateQueries({ queryKey: ['super-admin', 'custom-solutions'] });
      refetch();
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to save notes');
    }});

  if (isLoading) return <LoadingState message="Loading custom solution..." />;
  if (error) return <ErrorState title="Failed to load custom solution" onRetry={refetch} />;
  if (!req) return null;

  const nextStatuses = ALLOWED_TRANSITIONS[req.status as CustomSolutionStatus] ?? [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <Link
          href="/super-admin/custom-solutions"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Custom Solutions
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{req.businessName}</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Custom Solution Request</p>
          </div>
          <span className={`px-3 py-1 text-sm rounded-full font-medium ${statusColors[req.status]}`}>
            {req.status.replace(/_/g, ' ')}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Business Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoRow icon={<Building2 className="h-5 w-5 text-gray-400" />} label="Industry" value={req.industry} />
              <InfoRow icon={<Globe className="h-5 w-5 text-gray-400" />} label="Country" value={req.country} />
              {req.currentWebsite && <InfoRow icon={<Globe className="h-5 w-5 text-gray-400" />} label="Website" value={req.currentWebsite} />}
              <InfoRow icon={<Users className="h-5 w-5 text-gray-400" />} label="Employees" value={req.employees} />
              <InfoRow icon={<Package className="h-5 w-5 text-gray-400" />} label="Monthly Orders" value={req.monthlyOrders} />
              <InfoRow icon={<DollarSign className="h-5 w-5 text-gray-400" />} label="Budget" value={req.budget} />
              <InfoRow icon={<Clock className="h-5 w-5 text-gray-400" />} label="Timeline" value={req.timeline} />
              <InfoRow icon={<Clock className="h-5 w-5 text-gray-400" />} label="Submitted" value={new Date(req.createdAt).toLocaleDateString()} />
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Services Required</h2>
            <div className="flex flex-wrap gap-2">
              {req.services.map((service) => (
                <span key={service} className="px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm font-medium">
                  {service}
                </span>
              ))}
            </div>
          </div>

          {req.additionalRequirements && (
            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Additional Requirements</h2>
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{req.additionalRequirements}</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Update Status</h2>
            <div className="space-y-2">
              {nextStatuses.map((status) => (
                <button
                  key={status}
                  onClick={() => statusMutation.mutate({ status, note })}
                  disabled={statusMutation.isPending}
                  className="w-full text-left px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  {status.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
            <div className="mt-3">
              <label className="block text-sm text-gray-500 mb-1">Note (optional)</label>
              <textarea
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                placeholder="Add a note..."
              />
            </div>
            {nextStatuses.includes(CustomSolutionStatus.REJECTED) && (
              <button
                onClick={() => statusMutation.mutate({ status: CustomSolutionStatus.REJECTED, note })}
                disabled={statusMutation.isPending}
                className="mt-3 w-full px-4 py-2.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {statusMutation.isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Updating...
                  </span>
                ) : (
                  'Reject Request'
                )}
              </button>
            )}
          </div>

          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Assignment</h2>
            {req.assignedToName && (
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                Assigned to: <span className="font-medium">{req.assignedToName}</span>
              </p>
            )}
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-500 mb-1">Admin User ID</label>
                <input
                  type="text"
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                  placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
                />
              </div>
              <button
                onClick={() => {
                  if (!assigneeId.trim()) {
                    toast.error('Admin User ID is required');
                    return;
                  }
                  assignMutation.mutate({ assigneeId: assigneeId.trim() });
                }}
                disabled={assignMutation.isPending}
                className="w-full px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {assignMutation.isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Assigning...
                  </span>
                ) : (
                  'Assign Request'
                )}
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Admin Notes</h2>
            <div className="space-y-3">
              <textarea
                rows={4}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                placeholder="Internal notes for the assigned team..."
              />
              <button
                onClick={() => {
                  if (!adminNotes.trim()) {
                    toast.error('Note cannot be empty');
                    return;
                  }
                  notesMutation.mutate({ note: adminNotes });
                }}
                disabled={notesMutation.isPending}
                className="w-full px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {notesMutation.isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </span>
                ) : (
                  'Save Notes'
                )}
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Upload Quotation</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-500 mb-1">Amount (₦)</label>
                <input
                  type="number"
                  value={quotationAmount}
                  onChange={(e) => setQuotationAmount(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                  placeholder="e.g. 5000000"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Note</label>
                <textarea
                  rows={2}
                  value={quotationNote}
                  onChange={(e) => setQuotationNote(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                  placeholder="Quotation description..."
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">File (PDF)</label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setQuotationFile(e.target.files?.[0] ?? null)}
                  className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-400"
                />
              </div>
              <button
                onClick={() => {
                  const amount = Number(quotationAmount);
                  if (!amount || amount <= 0) return;
                  quotationMutation.mutate({ amount, note: quotationNote, file: quotationFile ?? undefined });
                }}
                disabled
                className="w-full px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                Quotation upload isn't available yet
              </button>
            </div>
          </div>

          {req.quotationUrl && (
            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quotation Sent</h2>
              {req.quotationAmount && (
                <p className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  ₦{req.quotationAmount.toLocaleString()}
                </p>
              )}
              {req.quotationNote && <p className="text-sm text-gray-500">{req.quotationNote}</p>}
              <a
                href={req.quotationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block text-sm text-blue-600 hover:underline"
              >
                View Quotation Document
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      {icon}
      <div>
        <p className="text-gray-500">{label}</p>
        <p className="font-medium text-gray-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
}
