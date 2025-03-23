import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { format } from 'date-fns';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function TransactionsSummary({ summaryData }) {
  if (!summaryData || !summaryData.summary || !summaryData.summary.length) {
    return <p className="text-secondary">No transaction data available.</p>;
  }

  // Format data for the chart
  const chartData = {
    labels: summaryData.summary.map(item => {
      // Format the period label based on the period type
      if (summaryData.period === 'monthly') {
        const [year, month] = item.period.split('-');
        return format(new Date(parseInt(year), parseInt(month) - 1), 'MMM yyyy');
      }
      return item.period;
    }),
    datasets: [
      {
        label: 'Total Amount',
        data: summaryData.summary.map(item => item.total_amount),
        borderColor: 'rgb(29, 155, 240)',
        backgroundColor: 'rgba(29, 155, 240, 0.2)',
        tension: 0.3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => `Amount: $${context.parsed.y.toFixed(2)}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          callback: (value) => `$${value}`,
          color: 'rgba(255, 255, 255, 0.7)',
        },
      },
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
        },
      },
    },
  };

  // Create summary stats
  const totalAmount = summaryData.summary.reduce((acc, item) => {
    const amount = parseFloat(item.total_amount) || 0;
    return acc + amount;
  }, 0);
  const avgAmount = summaryData.summary.length > 0 ? totalAmount / summaryData.summary.length : 0;
  const maxMonth = summaryData.summary.reduce((max, item) => {
    const amount = parseFloat(item.total_amount) || 0;
    return amount > max.amount ? { period: item.period, amount } : max;
  }, { period: '', amount: -Infinity });

  return (
    <div className="transactions-summary">
      <div className="chart-container">
        <Line data={chartData} options={chartOptions} />
      </div>

      <div className="summary-stats">
        <div className="stat-item">
          <span className="stat-label">Total</span>
          <span className="stat-value">${totalAmount.toFixed(2)}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Monthly Avg</span>
          <span className="stat-value">${avgAmount.toFixed(2)}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Highest Month</span>
          <span className="stat-value">
            {maxMonth.period ? format(new Date(maxMonth.period), 'MMM yyyy') : 'N/A'}
          </span>
        </div>
      </div>
    </div>
  );
}

export default TransactionsSummary;