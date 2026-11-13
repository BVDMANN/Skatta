import '@/styles/globals.css';
import 'leaflet/dist/leaflet.css';

export const metadata = {
  title: 'Skatta | Trouve ton Skatta',
  description: 'La plateforme premium pour le travail journalier au Gabon.',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>
        {children}
      </body>
    </html>
  );
}
