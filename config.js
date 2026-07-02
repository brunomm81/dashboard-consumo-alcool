// =====================================================================
// Configuração do front-end (carregada pelo navegador).
//
// ATENÇÃO: tudo neste arquivo fica visível para qualquer pessoa que
// acessar o site publicado. Por isso aqui só entram valores "públicos":
//   - URL do Supabase
//   - chave publishable / anon (projetadas para uso no navegador)
//   - credenciais de login do dashboard (a validação é feita no cliente,
//     portanto NÃO é uma segurança real — é apenas uma barreira simples).
//
// As chaves SECRETAS (service_role / secret) ficam somente no .env local
// e nunca devem ser colocadas aqui.
// =====================================================================

// ---------- Credenciais de acesso ao dashboard ----------
const AUTH_CONFIG = {
  username: "admin",
  password: "123@456"
};

// ---------- Supabase ----------
const SUPABASE_CONFIG = {
  url: "https://xcepypsmtjxxrwcvxlzt.supabase.co",
  // Chave publishable (pública, segura para o navegador)
  publishableKey: "sb_publishable_kXrp3i19AV0VM08D9e_7DA_CaBsUcKs"
};
