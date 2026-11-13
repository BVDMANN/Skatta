import { cn } from '@/lib/utils';

const APPLICATION_LABELS: Record<string, { label: string; className: string }> = {
  pending: { label: 'En attente', className: 'bg-amber-100 text-amber-800' },
  contacted: { label: 'Contacté', className: 'bg-blue-100 text-blue-800' },
  rejected: { label: 'Refusée', className: 'bg-red-100 text-red-800' },
  hired: { label: 'Embauché', className: 'bg-green-100 text-green-800' },
};

const OFFER_LABELS: Record<string, { label: string; className: string }> = {
  published: { label: 'Publiée', className: 'bg-green-100 text-green-800' },
  draft: { label: 'Brouillon', className: 'bg-slate-100 text-slate-700' },
  closed: { label: 'Fermée', className: 'bg-red-100 text-red-800' },
};

export function ApplicationStatusBadge({ status }: { status: string }) {
  const s = APPLICATION_LABELS[status] ?? { label: status, className: 'bg-slate-100 text-slate-700' };
  return (
    <span className={cn('inline-flex px-3 py-1 rounded-full text-xs font-black', s.className)}>
      {s.label}
    </span>
  );
}

export function OfferStatusBadge({ status }: { status: string }) {
  const s = OFFER_LABELS[status] ?? { label: status, className: 'bg-slate-100 text-slate-700' };
  return (
    <span className={cn('inline-flex px-3 py-1 rounded-full text-xs font-black', s.className)}>
      {s.label}
    </span>
  );
}
