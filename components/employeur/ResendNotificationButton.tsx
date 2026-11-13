"use client";

import { useState } from 'react';

/** Renvoie les e-mails de notification d'une candidature (employeur). */
export function ResendNotificationButton({
  applicationId,
}: {
  applicationId: string;
}) {
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error' | 'skipped'>('idle');

  async function resend() {
    setState('sending');
    try {
      const res = await fetch('/api/notify-application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setState('error');
        return;
      }
      setState(data.skipped ? 'skipped' : 'sent');
      setTimeout(() => setState('idle'), 4000);
    } catch {
      setState('error');
    }
  }

  return (
    <button
      onClick={resend}
      disabled={state === 'sending'}
      className="text-xs font-bold text-skatta-green hover:underline disabled:opacity-60"
    >
      {state === 'sending'
        ? 'Envoi…'
        : state === 'sent'
          ? 'E-mails renvoyés ✓'
          : state === 'skipped'
            ? 'E-mails non configurés'
            : state === 'error'
              ? 'Échec — réessayer'
              : 'Renvoyer les e-mails'}
    </button>
  );
}
