import Link from 'next/link';
import { PageShell } from '@/components/shared/PageShell';

export const metadata = {
  title: 'Conditions Générales d’Utilisation — Skatta',
  description: 'Conditions Générales d’Utilisation de la plateforme Skatta.',
};

export default function CguPage() {
  return (
    <PageShell title="Conditions Générales d’Utilisation" subtitle="Règles d’utilisation de la plateforme Skatta.">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 text-slate-600 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-lg font-black text-slate-900">1. Objet</h2>
          <p>
            Skatta est une plateforme de mise en relation entre des candidats
            cherchant des missions journalières au Gabon et des employeurs
            publiant des offres. Skatta n’est pas partie aux contrats conclus
            entre candidats et employeurs.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-black text-slate-900">2. Comptes</h2>
          <p>
            L’inscription est gratuite et nécessite une adresse e-mail valide,
            vérifiée par un lien envoyé par e-mail. Chaque utilisateur choisit un
            rôle : <strong>Candidat</strong> (postuler aux offres) ou{' '}
            <strong>Employeur</strong> (publier des offres). L’utilisateur est
            responsable de la confidentialité de son mot de passe et de
            l’exactitude des informations fournies.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-black text-slate-900">3. Candidatures</h2>
          <p>
            Un candidat ne peut postuler qu’une seule fois à une même offre. Sa
            candidature (nom, téléphone, message) est transmise à l’employeur,
            qui peut en changer le statut (en attente, contacté, refusée,
            embauché). Skatta ne garantit aucune réponse ni aucune embauche.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-black text-slate-900">4. Publication d’offres</h2>
          <p>
            L’employeur s’engage à publier des offres réelles, licites et
            sincères (mission, salaire, lieu, conditions). Il peut modifier ou
            fermer ses offres à tout moment. Skatta se réserve le droit de
            retirer toute offre illicite, trompeuse ou contraire aux présentes
            conditions.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-black text-slate-900">5. Contenus interdits</h2>
          <p>
            Sont interdits : les offres d’emploi illégales, les contenus
            discriminatoires, trompeurs ou portant atteinte à la dignité des
            personnes, ainsi que toute utilisation de la plateforme à des fins
            de démarchage sans rapport avec l’emploi. Tout manquement peut
            entraîner la suspension du compte.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-black text-slate-900">6. Responsabilité</h2>
          <p>
            Skatta met en relation candidats et employeurs mais n’intervient pas
            dans l’exécution des missions, les paiements (effectués directement
            entre les parties, le plus souvent en espèces à la fin de la
            journée) ni les litiges éventuels. La responsabilité de Skatta ne
            saurait être engagée au-delà de la mise à disposition de la plateforme.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-black text-slate-900">7. Données personnelles</h2>
          <p>
            Le traitement des données personnelles est décrit dans notre{' '}
            <Link href="/confidentialite" className="text-skatta-green font-bold hover:underline">
              politique de confidentialité
            </Link>
            .
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-black text-slate-900">8. Contact</h2>
          <p>
            Pour toute question : Stacks, entreprise individuelle — SIREN 104 314 687.
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
