import '@/styles/globals.css';

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
    <html lang="fr" className="dark">
      <body>
        {children}
      </body>
    </html>
  );
}
