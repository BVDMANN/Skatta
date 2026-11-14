import Link from 'next/link';
import { PageShell } from '@/components/shared/PageShell';

export const metadata = {
  title: 'Mentions légales — Skatta',
  description: 'Mentions légales de la plateforme Skatta.',
};

export default function MentionsLegalesPage() {
  return (
    <PageShell title="Mentions légales" subtitle="Informations sur l’éditeur et l’hébergement de Skatta.">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 text-slate-600 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-lg font-black text-slate-900">Éditeur du site</h2>
          <p>
            Le site Skatta est édité par <strong>Stacks</strong>, entreprise
            individuelle immatriculée au Registre National des Entreprises (RNE),
            SIREN <strong>104 314 687</strong>, dont le siège est situé au{' '}
            <strong>5 allée Xavier Bichat, 77420 Champs-sur-Marne, France</strong>.
          </p>
          <p>
            Contact : Stacks — SIREN 104 314 687.
          </p>
          <p>
            Directeur de la publication : Stacks, entreprise individuelle (SIREN 104 314 687).
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-black text-slate-900">Hébergement</h2>
          <p>
            Le site est hébergé par Vercel Inc., 340 S Lemon Ave #4133, Walnut,
            CA 91789, États-Unis.{' '}
            <span className="text-amber-700 bg-amber-50 px-1 rounded">[à compléter : confirmer l’hébergeur au moment du déploiement]</span>
          </p>
          <p>
            Les données (comptes, offres, candidatures) sont hébergées par
            Supabase Inc. (base de données PostgreSQL et authentification),{' '}
            <span className="text-amber-700 bg-amber-50 px-1 rounded">[à compléter : région d’hébergement choisie dans Supabase]</span>
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-black text-slate-900">Propriété intellectuelle</h2>
          <p>
            L’ensemble du contenu du site Skatta (textes, design, logo) est la
            propriété exclusive de Stacks, sauf mention contraire. Les photos
            d’illustration proviennent de la banque d’images libre Unsplash.
            Toute reproduction, même partielle, est interdite sans autorisation
            écrite préalable.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-black text-slate-900">Offres publiées</h2>
          <p>
            Les offres publiées par les employeurs le sont sous leur seule
            responsabilité. Skatta ne garantit ni l’exactitude des annonces, ni
            l’aboutissement d’une embauche. Les 6 offres initiales affichées au
            lancement sont des <strong>exemples fictifs</strong> destinés à
            présenter la plateforme ; elles ne correspondent à aucun employeur réel.
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
