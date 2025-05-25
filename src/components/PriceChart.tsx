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
  ChartData,
  ChartOptions
} from 'chart.js';
import { format, parseISO } from 'date-fns';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface PriceChartProps {
  dates: string[];
  prices: Record<string, number[]>;
}

function PriceChart({ dates, prices }: PriceChartProps) {
  const formatDate = (dateString: string) => {
    return format(parseISO(dateString), 'MMM d');
  };

  // Colors for different suppliers
  const colors = [
    { backgroundColor: 'rgba(37, 99, 235, 0.1)', borderColor: 'rgba(37, 99, 235, 1)' },
    { backgroundColor: 'rgba(249, 115, 22, 0.1)', borderColor: 'rgba(249, 115, 22, 1)' },
    { backgroundColor: 'rgba(13, 148, 136, 0.1)', borderColor: 'rgba(13, 148, 136, 1)' },
    { backgroundColor: 'rgba(234, 179, 8, 0.1)', borderColor: 'rgba(234, 179, 8, 1)' },
    { backgroundColor: 'rgba(236, 72, 153, 0.1)', borderColor: 'rgba(236, 72, 153, 1)' },
    { backgroundColor: 'rgba(168, 85, 247, 0.1)', borderColor: 'rgba(168, 85, 247, 1)' },
  ];

  // Create datasets for each supplier
  const datasets = Object.entries(prices).map(([supplierName, priceData], index) => {
    const colorIndex = index % colors.length;
    return {
      label: supplierName,
      data: priceData,
      fill: true,
      backgroundColor: colors[colorIndex].backgroundColor,
      borderColor: colors[colorIndex].borderColor,
      borderWidth: 2,
      pointBackgroundColor: colors[colorIndex].borderColor,
      pointBorderColor: '#fff',
      pointBorderWidth: 1,
      pointRadius: 4,
      pointHoverRadius: 6,
      tension: 0.1,
    };
  });

  const chartData: ChartData<'line'> = {
    labels: dates.map(formatDate),
    datasets,
  };

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: false,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          callback: function(value) {
            return '$' + value;
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          boxWidth: 6,
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#1f2937',
        bodyColor: '#4b5563',
        borderColor: 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1,
        displayColors: true,
        boxWidth: 8,
        boxHeight: 8,
        usePointStyle: true,
        padding: 12,
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: $${context.parsed.y.toFixed(2)}`;
          },
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
    elements: {
      line: {
        borderWidth: 2,
      },
      point: {
        hoverRadius: 8,
      },
    },
  };

  return <Line data={chartData} options={chartOptions} />;
}

export default PriceChart;