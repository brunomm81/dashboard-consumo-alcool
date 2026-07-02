// Utilitarios de autenticacao compartilhados (servidor).
export const AUTH_COOKIE = 'dash_auth';

// Valor esperado do cookie de sessao. Baseado no segredo do ambiente.
export function expectedCookieValue() {
  return process.env.AUTH_COOKIE_SECRET || '';
}

export function isValidLogin(username, password) {
  const expectedUser = process.env.DASHBOARD_USER;
  const expectedPassword = process.env.DASHBOARD_PASSWORD;

  if (!expectedUser || !expectedPassword) {
    return false;
  }

  return username === expectedUser && password === expectedPassword;
}
