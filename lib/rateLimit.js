// Rate limiting simples em memoria para proteger endpoints sensiveis (ex.: /api/login).
// Limitacao conhecida: em deploys serverless com multiplas instancias o estado nao e
// compartilhado entre elas, entao isto reduz a superficie de ataque dentro de uma mesma
// instancia "quente", mas nao substitui um rate limiter distribuido (ex.: Upstash/Redis).
const WINDOW_MS = 15 * 60 * 1000; // 15 minutos
const MAX_ATTEMPTS = 5;

const attempts = new Map(); // key -> { count, firstAttemptAt }

function prune(now) {
  for (const [key, entry] of attempts) {
    if (now - entry.firstAttemptAt > WINDOW_MS) {
      attempts.delete(key);
    }
  }
}

export function isRateLimited(key) {
  const now = Date.now();
  prune(now);

  const entry = attempts.get(key);
  if (!entry) {
    return { limited: false };
  }

  if (entry.count < MAX_ATTEMPTS) {
    return { limited: false };
  }

  const retryAfterSeconds = Math.max(
    1,
    Math.ceil((entry.firstAttemptAt + WINDOW_MS - now) / 1000)
  );
  return { limited: true, retryAfterSeconds };
}

export function registerFailedAttempt(key) {
  const now = Date.now();
  const entry = attempts.get(key);

  if (!entry || now - entry.firstAttemptAt > WINDOW_MS) {
    attempts.set(key, { count: 1, firstAttemptAt: now });
    return;
  }

  entry.count += 1;
}

export function resetAttempts(key) {
  attempts.delete(key);
}
