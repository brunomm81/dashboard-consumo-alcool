(function () {
  const loginScreen = document.getElementById('login-screen');
  const dashboardScreen = document.getElementById('dashboard-screen');
  const loginForm = document.getElementById('login-form');
  const loginError = document.getElementById('login-error');
  const logoutBtn = document.getElementById('logout-btn');
  const csvInput = document.getElementById('csv-input');
  const saveStatus = document.getElementById('save-status');

  const SESSION_KEY = 'drinks_dashboard_authed';
  let charts = {};

  // ---------- SUPABASE ----------
  let supabaseClient = null;
  if (window.supabase && typeof SUPABASE_CONFIG !== 'undefined' && SUPABASE_CONFIG.url) {
    try {
      supabaseClient = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.publishableKey);
    } catch (e) {
      console.error('Falha ao inicializar o Supabase:', e);
    }
  }

  function setStatus(text, kind) {
    saveStatus.textContent = text;
    saveStatus.className = 'save-status' + (kind ? ' ' + kind : '');
  }

  // Envia os dados do CSV para o Supabase (tabela uploads + drinks)
  async function saveToSupabase(fileName, data) {
    if (!supabaseClient) {
      setStatus('Supabase não configurado', 'err');
      return;
    }
    setStatus('Salvando no Supabase...');
    try {
      const { data: upload, error: uploadErr } = await supabaseClient
        .from('uploads')
        .insert({ file_name: fileName, row_count: data.length })
        .select()
        .single();

      if (uploadErr) throw uploadErr;

      const rows = data.map(d => ({
        upload_id: upload.id,
        country: d.country,
        beer_servings: Math.round(d.beer),
        spirit_servings: Math.round(d.spirit),
        wine_servings: Math.round(d.wine),
        total_litres_of_pure_alcohol: d.total
      }));

      const { error: drinksErr } = await supabaseClient.from('drinks').insert(rows);
      if (drinksErr) throw drinksErr;

      setStatus(`${data.length} registros salvos no Supabase`, 'ok');
    } catch (err) {
      console.error('Erro ao salvar no Supabase:', err);
      setStatus('Erro ao salvar no Supabase: ' + (err.message || err), 'err');
    }
  }

  // ---------- AUTENTICAÇÃO ----------
  function showDashboard() {
    loginScreen.classList.add('hidden');
    dashboardScreen.classList.remove('hidden');
  }

  function showLogin() {
    dashboardScreen.classList.add('hidden');
    loginScreen.classList.remove('hidden');
  }

  if (sessionStorage.getItem(SESSION_KEY) === '1') {
    showDashboard();
  }

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const user = document.getElementById('username').value.trim();
    const pass = document.getElementById('password').value;

    if (user === AUTH_CONFIG.username && pass === AUTH_CONFIG.password) {
      sessionStorage.setItem(SESSION_KEY, '1');
      loginError.textContent = '';
      loginForm.reset();
      showDashboard();
    } else {
      loginError.textContent = 'Usuário ou senha inválidos.';
    }
  });

  logoutBtn.addEventListener('click', () => {
    sessionStorage.removeItem(SESSION_KEY);
    showLogin();
  });

  // ---------- CSV PARSING ----------
  function parseCSV(text) {
    const lines = text.replace(/\r\n/g, '\n').split('\n').filter(l => l.trim().length > 0);
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

    const headers = parseLine(lines[0]).map(h => h.toLowerCase());
    const rows = lines.slice(1).map(parseLine).map(cols => {
      const obj = {};
      headers.forEach((h, i) => { obj[h] = cols[i]; });
      return obj;
    });

    return { headers, rows };
  }

  function findColumn(headers, candidates) {
    return headers.find(h => candidates.includes(h));
  }

  // ---------- UPLOAD ----------
  csvInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const { headers, rows } = parseCSV(evt.target.result);
        const data = renderDashboard(headers, rows);
        if (data) saveToSupabase(file.name, data);
      } catch (err) {
        alert('Não foi possível ler o arquivo CSV: ' + err.message);
      }
    };
    reader.readAsText(file, 'utf-8');
    // permite reenviar o mesmo arquivo
    e.target.value = '';
  });

  function renderDashboard(headers, rows) {
    const colCountry = findColumn(headers, ['country', 'pais', 'país']);
    const colBeer = findColumn(headers, ['beer_servings']);
    const colSpirit = findColumn(headers, ['spirit_servings']);
    const colWine = findColumn(headers, ['wine_servings']);
    const colTotal = findColumn(headers, ['total_litres_of_pure_alcohol']);

    if (!colCountry || !colTotal) {
      alert('O CSV precisa ter ao menos as colunas "country" e "total_litres_of_pure_alcohol".');
      return null;
    }

    const data = rows.map(r => ({
      country: r[colCountry] || '',
      beer: parseFloat(r[colBeer]) || 0,
      spirit: parseFloat(r[colSpirit]) || 0,
      wine: parseFloat(r[colWine]) || 0,
      total: parseFloat(r[colTotal]) || 0
    })).filter(d => d.country);

    document.getElementById('empty-state').classList.add('hidden');
    document.getElementById('stats-grid').classList.remove('hidden');
    document.getElementById('charts-grid').classList.remove('hidden');
    document.getElementById('table-section').classList.remove('hidden');

    renderStats(data);
    renderCharts(data);
    renderTable(headers, rows);

    return data;
  }

  function renderStats(data) {
    const total = data.length;
    const avgLitres = total ? (data.reduce((s, d) => s + d.total, 0) / total) : 0;
    const topCountry = data.reduce((max, d) => (d.total > (max ? max.total : -1) ? d : max), null);

    const beerSum = data.reduce((s, d) => s + d.beer, 0);
    const spiritSum = data.reduce((s, d) => s + d.spirit, 0);
    const wineSum = data.reduce((s, d) => s + d.wine, 0);
    const drinkTotals = { Cerveja: beerSum, Destilados: spiritSum, Vinho: wineSum };
    const topDrink = Object.entries(drinkTotals).sort((a, b) => b[1] - a[1])[0];

    document.getElementById('stat-countries').textContent = total;
    document.getElementById('stat-avg-litres').textContent = avgLitres.toFixed(2) + ' L';
    document.getElementById('stat-top-country').textContent = topCountry ? `${topCountry.country} (${topCountry.total.toFixed(1)}L)` : '-';
    document.getElementById('stat-top-drink').textContent = topDrink ? topDrink[0] : '-';
  }

  function destroyCharts() {
    Object.values(charts).forEach(c => c && c.destroy());
    charts = {};
  }

  function renderCharts(data) {
    destroyCharts();

    const sortedByTotal = [...data].sort((a, b) => b.total - a.total);
    const top10 = sortedByTotal.slice(0, 10);
    const palette = ['#6c8dff', '#35d0ba', '#ffb84c', '#ff6b6b', '#a78bfa'];

    // 1. Top 10 países por litros puros
    charts.topCountries = new Chart(document.getElementById('chart-top-countries'), {
      type: 'bar',
      data: {
        labels: top10.map(d => d.country),
        datasets: [{
          label: 'Litros puros de álcool',
          data: top10.map(d => d.total),
          backgroundColor: palette[0]
        }]
      },
      options: baseOptions('y')
    });

    // 2. Distribuição de países por faixa de consumo
    const bins = [
      { label: '0–2 L', min: 0, max: 2 },
      { label: '2–4 L', min: 2, max: 4 },
      { label: '4–6 L', min: 4, max: 6 },
      { label: '6–8 L', min: 6, max: 8 },
      { label: '8–10 L', min: 8, max: 10 },
      { label: '10+ L', min: 10, max: Infinity }
    ];
    const binCounts = bins.map(b => data.filter(d => d.total >= b.min && d.total < b.max).length);

    charts.distribution = new Chart(document.getElementById('chart-distribution'), {
      type: 'bar',
      data: {
        labels: bins.map(b => b.label),
        datasets: [{
          label: 'Nº de países',
          data: binCounts,
          backgroundColor: palette[1]
        }]
      },
      options: baseOptions('x')
    });

    // 3. Consumo global por tipo de bebida
    const beerSum = data.reduce((s, d) => s + d.beer, 0);
    const spiritSum = data.reduce((s, d) => s + d.spirit, 0);
    const wineSum = data.reduce((s, d) => s + d.wine, 0);

    charts.drinkType = new Chart(document.getElementById('chart-drink-type'), {
      type: 'doughnut',
      data: {
        labels: ['Cerveja', 'Destilados', 'Vinho'],
        datasets: [{
          data: [beerSum, spiritSum, wineSum],
          backgroundColor: [palette[0], palette[2], palette[3]]
        }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#e7ecf5' } } } }
    });

    // 4. Cerveja x Destilados x Vinho (Top 10 países)
    charts.breakdown = new Chart(document.getElementById('chart-breakdown'), {
      type: 'bar',
      data: {
        labels: top10.map(d => d.country),
        datasets: [
          { label: 'Cerveja', data: top10.map(d => d.beer), backgroundColor: palette[0] },
          { label: 'Destilados', data: top10.map(d => d.spirit), backgroundColor: palette[2] },
          { label: 'Vinho', data: top10.map(d => d.wine), backgroundColor: palette[3] }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { color: '#e7ecf5' } } },
        scales: {
          x: { stacked: true, ticks: { color: '#9aa7bd' }, grid: { color: '#2c374d' } },
          y: { stacked: true, ticks: { color: '#9aa7bd' }, grid: { color: '#2c374d' } }
        }
      }
    });
  }

  function baseOptions(indexAxis) {
    return {
      indexAxis,
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { labels: { color: '#e7ecf5' } } },
      scales: {
        x: { ticks: { color: '#9aa7bd' }, grid: { color: '#2c374d' } },
        y: { ticks: { color: '#9aa7bd' }, grid: { color: '#2c374d' } }
      }
    };
  }

  function renderTable(headers, rows) {
    const thead = document.querySelector('#data-table thead');
    const tbody = document.querySelector('#data-table tbody');

    thead.innerHTML = '<tr>' + headers.map(h => `<th>${h}</th>`).join('') + '</tr>';
    tbody.innerHTML = rows.map(r =>
      '<tr>' + headers.map(h => `<td>${r[h] ?? ''}</td>`).join('') + '</tr>'
    ).join('');
  }
})();
