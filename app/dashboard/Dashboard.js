'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { parseCSV, normalizeDrinks } from '@/lib/csv';
import Charts from './Charts';
import AnimatedContent from '@/components/AnimatedContent';
import SpotlightCard from '@/components/SpotlightCard';
import CountUp from '@/components/CountUp';
import GradientText from '@/components/GradientText';
import ThemeToggle from '@/components/ThemeToggle';

export default function Dashboard() {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [data, setData] = useState(null);
  const [headers, setHeaders] = useState([]);
  const [rawRows, setRawRows] = useState([]);
  const [status, setStatus] = useState({ text: '', kind: '' });

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const { headers: hs, rows } = parseCSV(String(evt.target.result));
        const { data: normalized, error } = normalizeDrinks(hs, rows);
        if (error) {
          setStatus({ text: error, kind: 'err' });
          return;
        }
        setHeaders(hs);
        setRawRows(rows);
        setData(normalized);
        saveToSupabase(file.name, normalized);
      } catch (err) {
        setStatus({ text: 'Erro ao ler o CSV: ' + err.message, kind: 'err' });
      }
    };
    reader.readAsText(file, 'utf-8');
    e.target.value = ''; // permite reenviar o mesmo arquivo
  }

  async function saveToSupabase(fileName, rows) {
    setStatus({ text: 'Salvando no Supabase...', kind: '' });
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName, rows })
      });
      const result = await res.json().catch(() => ({}));
      if (res.ok) {
        setStatus({ text: `${result.count} registros salvos no Supabase`, kind: 'ok' });
      } else {
        setStatus({ text: result.error || 'Erro ao salvar.', kind: 'err' });
      }
    } catch {
      setStatus({ text: 'Erro de rede ao salvar no Supabase.', kind: 'err' });
    }
  }

  async function handleLogout() {
    await fetch('/api/logout', { method: 'POST' });
    router.replace('/login');
    router.refresh();
  }

  const stats = data ? computeStats(data) : null;

  return (
    <div>
      <header className="topbar">
        <h1>
          <GradientText>Consumo Global de Álcool</GradientText>
        </h1>
        <div className="topbar-actions">
          {status.text && (
            <span className={'save-status ' + status.kind}>{status.text}</span>
          )}
          <button
            className="btn btn-upload"
            onClick={() => fileInputRef.current?.click()}
          >
            Enviar drinks.csv
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            hidden
            onChange={handleFile}
          />
          <button className="btn btn-secondary" onClick={handleLogout}>
            Sair
          </button>
          <ThemeToggle />
        </div>
      </header>

      <main className="dashboard-content">
        {!data && (
          <p className="empty-state">
            Envie o arquivo <strong>drinks.csv</strong> para visualizar os dados de
            consumo de álcool.
          </p>
        )}

        {data && stats && (
          <>
            <div className="stats-grid">
              <AnimatedContent delay={0}>
                <SpotlightCard className="stat-card">
                  <span className="stat-label">Países</span>
                  <span className="stat-value">
                    <CountUp to={stats.total} duration={1.4} />
                  </span>
                </SpotlightCard>
              </AnimatedContent>
              <AnimatedContent delay={0.1}>
                <SpotlightCard className="stat-card">
                  <span className="stat-label">Média de litros puros/país</span>
                  <span className="stat-value">
                    <CountUp
                      to={stats.avgLitresNum}
                      decimals={2}
                      suffix=" L"
                      duration={1.6}
                    />
                  </span>
                </SpotlightCard>
              </AnimatedContent>
              <AnimatedContent delay={0.2}>
                <SpotlightCard className="stat-card">
                  <span className="stat-label">País com maior consumo</span>
                  <span className="stat-value">{stats.topCountry}</span>
                </SpotlightCard>
              </AnimatedContent>
              <AnimatedContent delay={0.3}>
                <SpotlightCard className="stat-card">
                  <span className="stat-label">Bebida predominante</span>
                  <span className="stat-value">{stats.topDrink}</span>
                </SpotlightCard>
              </AnimatedContent>
            </div>

            <AnimatedContent delay={0.15} distance={50}>
              <Charts data={data} />
            </AnimatedContent>

            <AnimatedContent delay={0.1} distance={50}>
              <div className="table-section">
                <h2>Dados completos</h2>
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        {headers.map((h) => (
                          <th key={h}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rawRows.map((r, i) => (
                        <tr key={i}>
                          {headers.map((h) => (
                            <td key={h}>{r[h] ?? ''}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </AnimatedContent>
          </>
        )}
      </main>
    </div>
  );
}

function computeStats(data) {
  const total = data.length;
  const avgLitresNum = total
    ? data.reduce((s, d) => s + d.total, 0) / total
    : 0;
  const topCountry = data.reduce(
    (max, d) => (d.total > (max ? max.total : -1) ? d : max),
    null
  );
  const beerSum = data.reduce((s, d) => s + d.beer, 0);
  const spiritSum = data.reduce((s, d) => s + d.spirit, 0);
  const wineSum = data.reduce((s, d) => s + d.wine, 0);
  const drinkTotals = { Cerveja: beerSum, Destilados: spiritSum, Vinho: wineSum };
  const topDrink = Object.entries(drinkTotals).sort((a, b) => b[1] - a[1])[0];

  return {
    total,
    avgLitresNum,
    topCountry: topCountry
      ? `${topCountry.country} (${topCountry.total.toFixed(1)}L)`
      : '-',
    topDrink: topDrink ? topDrink[0] : '-'
  };
}
