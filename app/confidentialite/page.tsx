import Link from 'next/link';
import { PageShell } from '@/components/shared/PageShell';

export const metadata = {
  title: 'Politique de confidentialité — Skatta',
  description: 'Politique de confidentialité de la plateforme Skatta.',
};

export default function ConfidentialitePage() {
  return (
    <PageShell title="Politique de confidentialité" subtitle="Comment Skatta collecte, utilise et protège tes données.">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 text-slate-600 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-lg font-black text-slate-900">1. Responsable du traitement</h2>
          <p>
            Stacks, entreprise individuelle, SIREN 104 314 687, 5 allée Xavier
            Bichat, 77420 Champs-sur-Marne, France.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-black text-slate-900">2. Données collectées</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Compte :</strong> e-mail, nom complet, téléphone, rôle (candidat / employeur), informations d’entreprise facultatives pour les employeurs.</li>
            <li><strong>Offres :</strong> titre, description, salaire, lieu et coordonnées de contact fournies par l’employeur.</li>
            <li><strong>Candidatures :</strong> nom, téléphone et message du candidat, statut suivi par l’employeur.</li>
            <li><strong>Technique :</strong> cookies de session indispensables à la connexion (aucun cookie publicitaire).</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-black text-slate-900">3. Finalités et base légale</h2>
          <p>
            Les données servent uniquement à faire fonctionner la plateforme :
            créer et sécuriser ton compte, afficher les offres, transmettre les
            candidatures aux employeurs concernés et t’envoyer les e-mails
            indispensables (vérification d’inscription, confirmation de
            candidature, réinitialisation de mot de passe). Base légale :
            exécution du service demandé et consentement pour les e-mails.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-black text-slate-900">4. Destinataires</h2>
          <p>
            Tes données ne sont jamais vendues. Elles sont visibles uniquement
            par les personnes concernées : un employeur voit les candidatures de
            ses propres offres ; les candidats voient les offres publiées et les
            coordonnées de contact fournies par l’employeur. Nos sous-traitants
            techniques (Supabase pour la base de données et l’authentification,
            Vercel pour l’hébergement, Resend pour l’envoi d’e-mails) n’y
            accèdent que pour faire fonctionner le service.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-black text-slate-900">5. Conservation</h2>
          <p>
            Tes données sont conservées tant que ton compte est actif. Tu peux
            demander la suppression de ton compte et de tes données à tout
            moment auprès de Stacks (SIREN 104 314 687)
            ; la suppression est effectuée sous 30 jours, sauf obligation légale
            de conservation.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-black text-slate-900">6. Tes droits</h2>
          <p>
            Conformément au Règlement Général sur la Protection des Données
            (RGPD), tu disposes d’un droit d’accès, de rectification,
            d’effacement, de limitation et de portabilité de tes données, ainsi
            que d’un droit d’opposition. Pour exercer ces droits, contacte Stacks (SIREN 104 314 687).
            Tu peux également introduire une réclamation auprès de la CNIL.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-black text-slate-900">7. Sécurité</h2>
          <p>
            Les mots de passe sont chiffrés par notre prestataire
            d’authentification et ne sont jamais stockés en clair. L’accès aux
            données est protégé par des règles d’accès strictes (chaque
            utilisateur ne voit que ses propres données et celles qui le
            concernent).
          </p>
        </section>

        <p className="text-sm text-slate-400">
          Dernière mise à jour : novembre 2026.{' '}
          <Link href="/" className="text-skatta-green font-bold hover:underline">
            Retour à l’accueil
          </Link>
        </p>
      </div>
    </PageShell>
  );
}
