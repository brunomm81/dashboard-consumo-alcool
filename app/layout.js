import './globals.css';

export const metadata = {
  title: 'Dashboard de Consumo de Álcool',
  description: 'Dashboard de consumo global de álcool com login e Supabase.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
