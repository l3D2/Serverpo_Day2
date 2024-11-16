import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import zoomPlugin from "chartjs-plugin-zoom";
import "chart.js/auto";

// Register components
ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
  zoomPlugin // Register the zoom plugin
);

function Chart({ title, data, yAxisDomain, dataKey, lines, labels, dots }) {
  const chartData = {
    labels: data.map((entry) => entry[dataKey]),
    datasets: lines.map((line) => ({
      label: line.label || line.dataKey,
      data: data.map((entry) => entry[line.dataKey]),
      borderColor: line.stroke,
      fill: false,
      tension: 0.1,
      hidden: line.hidden || false,
      pointRadius: dots, // Set pointRadius to 0 to hide dots
    })),
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        onClick: (event, legendItem, legend) => {
          const index = legend.chart.data.datasets.findIndex(
            (dataset) => dataset.label === legendItem.text
          );
          const meta = legend.chart.getDatasetMeta(index);
          meta.hidden = !meta.hidden;
          legend.chart.update();
        },
      },
      title: {
        display: true,
        text: title,
      },
      zoom: {
        pan: {
          enabled: true,
          mode: "x",
        },
        zoom: {
          wheel: {
            enabled: true,
          },
          pinch: {
            enabled: true,
          },
          mode: "y",
        },
      },
    },
    scales: {
      y: {
        title: {
          display: true,
          text: labels.y,
        },
        min: yAxisDomain[0],
        max: yAxisDomain[1],
      },
      x: {
        title: {
          display: true,
          text: labels.x,
        },
      },
    },
  };

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <Line data={chartData} options={options} />
    </div>
  );
}

export default Chart;
