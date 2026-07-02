import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';

export const metadata = {
  title: 'Dashboard de Consumo de Álcool',
  description: 'Dashboard de consumo global de álcool com login e Supabase.'
};

// Aplica o tema salvo (ou 'dark' por padrão) ANTES da hidratação do React,
// para evitar o "flash" do tema errado ao carregar a página.
const THEME_INIT_SCRIPT = `
(function () {
  try {
    var stored = window.localStorage.getItem('dashboard_theme');
    var theme = stored === 'light' || stored === 'dark' ? stored : 'dark';
    document.documentElement.setAttribute('data-theme', theme);
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
})();
`;

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
