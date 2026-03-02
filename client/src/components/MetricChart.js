import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const normalizeDayKey = (dateLike) => {
  const d = new Date(dateLike);
  d.setHours(0, 0, 0, 0);
  return d.toDateString();
};

const buildLastNDays = (n) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push(d);
  }
  return days;
};

const MetricChart = ({ metrics, goals, type }) => {
  if (!metrics || metrics.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#999' }}>
        <p>No {type} data available yet. Log some entries to see your progress!</p>
      </div>
    );
  }

  // Show only the last 10 days on the x-axis (fill gaps with nulls)
  const days = buildLastNDays(10);
  const byDay = new Map();
  metrics.forEach((m) => {
    byDay.set(normalizeDayKey(m.date), m.value);
  });

  const labels = days.map((d) =>
    d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  );
  const values = days.map((d) => {
    const v = byDay.get(d.toDateString());
    return typeof v === 'number' ? v : null;
  });

  const target =
    goals && type === 'steps'
      ? Number(goals.stepsGoal || 0)
      : goals && type === 'sleep'
      ? Number(goals.sleepGoal || 0)
      : 0;
  const targetArray = days.map(() => (target > 0 ? target : null));

  const palette =
    type === 'steps'
      ? {
          primary: '#00b894',
          fill: 'rgba(0,184,148,0.18)',
          target: 'rgba(108,92,231,0.85)',
        }
      : {
          primary: '#6c5ce7',
          fill: 'rgba(108,92,231,0.16)',
          target: 'rgba(0,184,148,0.85)',
        };

  const data = {
    labels,
    datasets: [
      {
        label: `${type.charAt(0).toUpperCase() + type.slice(1)}`,
        data: values,
        borderColor: palette.primary,
        backgroundColor: palette.fill,
        pointBackgroundColor: palette.primary,
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5,
        borderWidth: 3,
        tension: 0.35,
        fill: true,
        spanGaps: true,
      },
      {
        label: 'Target',
        data: targetArray,
        borderDash: [5, 5],
        borderColor: palette.target,
        backgroundColor: 'transparent',
        pointRadius: 0,
        borderWidth: 2,
      }
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#2d3436',
          font: { weight: 'bold' },
          usePointStyle: true,
        },
      },
      title: {
        display: true,
        text: `${type.charAt(0).toUpperCase() + type.slice(1)} (last 10 days)`,
        color: '#636e72',
        font: { weight: 'bold' },
      },
      tooltip: {
        backgroundColor: 'rgba(45,52,54,0.92)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: 'rgba(255,255,255,0.15)',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        ticks: { color: '#636e72' },
        grid: { color: 'rgba(0,0,0,0.05)' },
      },
      y: {
        beginAtZero: true,
        ticks: { color: '#636e72' },
        grid: { color: 'rgba(0,0,0,0.05)' },
      }
    }
  };

  return <Line data={data} options={options} />;
};

export default MetricChart;
