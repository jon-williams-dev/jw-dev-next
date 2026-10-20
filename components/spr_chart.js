// Weekly totals chart for /spr. Client-only (Chart.js needs a canvas).
import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, LinearScale, CategoryScale, BarElement, Tooltip } from 'chart.js'

ChartJS.register(LinearScale, CategoryScale, BarElement, Tooltip)

const TICKS = { color: '#9a9aab', font: { family: 'Montserrat, sans-serif', weight: 700, size: 11 } }

// Bars fade between two colours, bottom to top.
const gradient = (from, to) => (ctx) => {
    const { chartArea, ctx: canvas } = ctx.chart
    if (!chartArea) return to
    const fill = canvas.createLinearGradient(0, chartArea.bottom, 0, chartArea.top)
    fill.addColorStop(0, from)
    fill.addColorStop(1, to)
    return fill
}

export default function SprChart({ labels, values, unit, colors = ['#566dd0', '#df2793'] }) {
    const data = {
        labels,
        datasets: [{ data: values, backgroundColor: gradient(...colors), borderRadius: 8, maxBarThickness: 36 }],
    }
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            tooltip: { callbacks: { label: (ctx) => `${+ctx.parsed.y.toFixed(2)} ${unit}` } },
        },
        scales: {
            x: { grid: { display: false }, border: { display: false }, ticks: TICKS },
            y: { beginAtZero: true, grid: { color: 'rgba(255, 255, 255, 0.06)' }, border: { display: false }, ticks: { ...TICKS, precision: 0 } },
        },
    }
    return <div style={{ height: 200 }}><Bar data={data} options={options} /></div>
}
