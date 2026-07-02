// Parser de CSV simples (suporta valores entre aspas). Usado no cliente.
export function parseCSV(text) {
  const lines = text
    .replace(/\r\n/g, '\n')
    .split('\n')
    .filter((l) => l.trim().length > 0);

  if (lines.length === 0) return { headers: [], rows: [] };

  const parseLine = (line) => {
    const result = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === ',' && !inQuotes) {
        result.push(cur.trim());
        cur = '';
      } else {
        cur += ch;
      }
    }
    result.push(cur.trim());
    return result;
  };

  const headers = parseLine(lines[0]).map((h) => h.toLowerCase());
  const rows = lines.slice(1).map(parseLine).map((cols) => {
    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = cols[i];
    });
    return obj;
  });

  return { headers, rows };
}

function findColumn(headers, candidates) {
  return headers.find((h) => candidates.includes(h));
}

// Converte as linhas cruas do CSV em objetos normalizados de consumo.
// Retorna { data, error }.
export function normalizeDrinks(headers, rows) {
  const colCountry = findColumn(headers, ['country', 'pais', 'país']);
  const colBeer = findColumn(headers, ['beer_servings']);
  const colSpirit = findColumn(headers, ['spirit_servings']);
  const colWine = findColumn(headers, ['wine_servings']);
  const colTotal = findColumn(headers, ['total_litres_of_pure_alcohol']);

  if (!colCountry || !colTotal) {
    return {
      data: null,
      error:
        'O CSV precisa ter ao menos as colunas "country" e "total_litres_of_pure_alcohol".'
    };
  }

  const data = rows
    .map((r) => ({
      country: r[colCountry] || '',
      beer: parseFloat(r[colBeer]) || 0,
      spirit: parseFloat(r[colSpirit]) || 0,
      wine: parseFloat(r[colWine]) || 0,
      total: parseFloat(r[colTotal]) || 0
    }))
    .filter((d) => d.country);

  return { data, error: null };
}
