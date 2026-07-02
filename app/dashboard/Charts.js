'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { useTheme } from '@/components/ThemeProvider';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const PALETTE = ['#6c8dff', '#35d0ba', '#ffb84c', '#ff6b6b', '#a78bfa'];

// Cores dos textos/grades dos gráficos por tema (Chart.js não lê variáveis
// CSS diretamente, então espelhamos aqui os tons de --text-dim / --border).
const CHART_COLORS = {
  dark: { text: '#e7ecf5', tick: '#9aa7bd', grid: '#2c374d' },
  light: { text: '#1a2233', tick: '#5b6b85', grid: '#dde3ef' }
};

function baseOptions(indexAxis, colors) {
  return {
    indexAxis,
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { labels: { color: colors.text } } },
    scales: {
      x: { ticks: { color: colors.tick }, grid: { color: colors.grid } },
      y: { ticks: { color: colors.tick }, grid: { color: colors.grid } }
    }
  };
}

export default function Charts({ data }) {
  const { theme } = useTheme();
  const colors = CHART_COLORS[theme] || CHART_COLORS.dark;

  const sortedByTotal = [...data].sort((a, b) => b.total - a.total);
  const top10 = sortedByTotal.slice(0, 10);

  // 1. Top 10 paises por litros puros
  const topCountriesData = {
    labels: top10.map((d) => d.country),
    datasets: [
      {
        label: 'Litros puros de álcool',
        data: top10.map((d) => d.total),
        backgroundColor: PALETTE[0]
      }
    ]
  };

  // 2. Distribuicao por faixa de consumo
  const bins = [
    { label: '0–2 L', min: 0, max: 2 },
    { label: '2–4 L', min: 2, max: 4 },
    { label: '4–6 L', min: 4, max: 6 },
    { label: '6–8 L', min: 6, max: 8 },
    { label: '8–10 L', min: 8, max: 10 },
    { label: '10+ L', min: 10, max: Infinity }
  ];
  const distributionData = {
    labels: bins.map((b) => b.label),
    datasets: [
      {
        label: 'Nº de países',
        data: bins.map(
          (b) => data.filter((d) => d.total >= b.min && d.total < b.max).length
        ),
        backgroundColor: PALETTE[1]
      }
    ]
  };

  // 3. Consumo global por tipo de bebida
  const beerSum = data.reduce((s, d) => s + d.beer, 0);
  const spiritSum = data.reduce((s, d) => s + d.spirit, 0);
  const wineSum = data.reduce((s, d) => s + d.wine, 0);
  const drinkTypeData = {
    labels: ['Cerveja', 'Destilados', 'Vinho'],
    datasets: [
      {
        data: [beerSum, spiritSum, wineSum],
        backgroundColor: [PALETTE[0], PALETTE[2], PALETTE[3]]
      }
    ]
  };

  // 4. Cerveja x Destilados x Vinho (Top 10)
  const breakdownData = {
    labels: top10.map((d) => d.country),
    datasets: [
      { label: 'Cerveja', data: top10.map((d) => d.beer), backgroundColor: PALETTE[0] },
      { label: 'Destilados', data: top10.map((d) => d.spirit), backgroundColor: PALETTE[2] },
      { label: 'Vinho', data: top10.map((d) => d.wine), backgroundColor: PALETTE[3] }
    ]
  };

  const stackedOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { labels: { color: colors.text } } },
    scales: {
      x: { stacked: true, ticks: { color: colors.tick }, grid: { color: colors.grid } },
      y: { stacked: true, ticks: { color: colors.tick }, grid: { color: colors.grid } }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { labels: { color: colors.text } } }
  };

  return (
    <div className="charts-grid">
      <div className="chart-card">
        <h2>Top 10 países — litros puros de álcool</h2>
        <div className="chart-canvas-wrap">
          <Bar data={topCountriesData} options={baseOptions('y', colors)} />
        </div>
      </div>

      <div className="chart-card">
        <h2>Distribuição de países por faixa de consumo (litros puros)</h2>
        <div className="chart-canvas-wrap">
          <Bar data={distributionData} options={baseOptions('x', colors)} />
        </div>
      </div>

      <div className="chart-card">
        <h2>Consumo global por tipo de bebida</h2>
        <div className="chart-canvas-wrap">
          <Doughnut data={drinkTypeData} options={doughnutOptions} />
        </div>
      </div>

      <div className="chart-card">
        <h2>Cerveja x Destilados x Vinho (Top 10 países)</h2>
        <div className="chart-canvas-wrap">
          <Bar data={breakdownData} options={stackedOptions} />
        </div>
      </div>
    </div>
  );
}
