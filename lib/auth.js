// Utilitarios de autenticacao compartilhados (servidor).
export const AUTH_COOKIE = 'dash_auth';

// Valor esperado do cookie de sessao. Baseado no segredo do ambiente.
export function expectedCookieValue() {
  return process.env.AUTH_COOKIE_SECRET || '';
}

export function isValidLogin(username, password) {
  return (
    username === process.env.DASHBOARD_USER &&
    password === process.env.DASHBOARD_PASSWORD
  );
}
