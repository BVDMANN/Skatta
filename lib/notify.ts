import { Resend } from 'resend';

/**
 * Notifications e-mail (Resend). Si aucune clé RESEND_API_KEY n'est configurée,
 * l'envoi est ignoré proprement (log) et ne fait JAMAIS échouer l'action
 * appelante (candidature, publication…). Les candidatures restent visibles
 * dans le tableau de bord employeur même sans e-mail.
 */

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

function fromAddress(): string {
  return (
    process.env.RESEND_FROM ??
    'Skatta <onboarding@resend.dev>'
  );
}

export interface ApplicationNotification {
  offerTitle: string;
  offerNeighborhood: string;
  salary: number;
  candidateName: string;
  candidatePhone: string;
  candidateEmail: string;
  message: string;
  employerEmail: string | null;
  employerName: string;
}

const formatSalary = (n: number) => `${n.toLocaleString('fr-FR')} FCFA/jour`;

/** Envoie l'e-mail à l'employeur + la confirmation au candidat. */
export async function notifyNewApplication(
  n: ApplicationNotification
): Promise<{ employerSent: boolean; candidateSent: boolean; skipped: boolean }> {
  const resend = getResend();
  if (!resend) {
    console.log(
      `[notify] Resend non configuré — e-mails ignorés pour la candidature à « ${n.offerTitle} » (candidat : ${n.candidateName}).`
    );
    return { employerSent: false, candidateSent: false, skipped: true };
  }

  let employerSent = false;
  let candidateSent = false;

  if (n.employerEmail) {
    try {
      const { error } = await resend.emails.send({
        from: fromAddress(),
        to: n.employerEmail,
        subject: `Nouvelle candidature — ${n.offerTitle} (Skatta)`,
        html: `
          <h2>Nouvelle candidature sur Skatta</h2>
          <p>Bonjour ${n.employerName},</p>
          <p><strong>${n.candidateName}</strong> vient de postuler à votre offre
          <strong>« ${n.offerTitle} »</strong> (${n.offerNeighborhood}, ${formatSalary(n.salary)}).</p>
          <ul>
            <li>Téléphone : ${n.candidatePhone}</li>
            <li>E-mail : ${n.candidateEmail}</li>
            ${n.message ? `<li>Message : ${n.message}</li>` : ''}
          </ul>
          <p>Retrouvez toutes vos candidatures dans votre tableau de bord Skatta.</p>
          <p>— L'équipe Skatta</p>
        `,
      });
      if (error) console.error('[notify] e-mail employeur :', error);
      else employerSent = true;
    } catch (e) {
      console.error('[notify] e-mail employeur :', e);
    }
  }

  try {
    const { error } = await resend.emails.send({
      from: fromAddress(),
      to: n.candidateEmail,
      subject: `Candidature envoyée — ${n.offerTitle} (Skatta)`,
      html: `
        <h2>Candidature envoyée !</h2>
        <p>Bonjour ${n.candidateName},</p>
        <p>Votre candidature à l'offre <strong>« ${n.offerTitle} »</strong>
        (${n.offerNeighborhood}, ${formatSalary(n.salary)}) a bien été transmise à l'employeur.</p>
        <p>Si votre profil correspond, l'employeur vous contactera directement au ${n.candidatePhone}.</p>
        <p>Suivez vos candidatures dans votre espace Skatta.</p>
        <p>— L'équipe Skatta</p>
      `,
    });
    if (error) console.error('[notify] e-mail candidat :', error);
    else candidateSent = true;
  } catch (e) {
    console.error('[notify] e-mail candidat :', e);
  }

  return { employerSent, candidateSent, skipped: false };
}
