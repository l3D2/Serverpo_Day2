// components/SoundChart.js

import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import zoomPlugin from "chartjs-plugin-zoom";
import "chart.js/auto";
ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  zoomPlugin // Register the zoom plugin
);

const SoundChart = ({ data }) => {
  // Flatten the sound arrays and calculate total duration based on timestamps
  const flattenedSoundData = data.flatMap((entry) => entry.sound);
  const timestamps = data.map((entry) => entry.ts);
  const totalDuration = timestamps[timestamps.length - 1] - timestamps[0]; // in seconds

  // Generate labels based on cumulative time
  const labels = [];
  let currentTime = 0;
  const interval = totalDuration / flattenedSoundData.length;
  for (let i = 0; i < flattenedSoundData.length; i++) {
    labels.push(currentTime.toFixed(2));
    currentTime += interval;
  }

  const chartData = {
    labels: labels,
    datasets: [
      {
        label: "Sound Data Over Time",
        data: flattenedSoundData,
        borderColor: "rgba(75,192,192,1)",
        fill: false,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Sound Data Over Time" },
      zoom: {
        pan: {
          enabled: true,
          mode: "xy", // Allow panning on both X and Y axes
        },
        zoom: {
          wheel: {
            enabled: true, // Enable zooming with the mouse wheel
          },
          pinch: {
            enabled: true, // Enable zooming on pinch gestures
          },
          mode: "xy", // Allow zooming on both X and Y axes
        },
      },
    },
    scales: {
      x: { title: { display: true, text: "Time (seconds)" } },
      y: { title: { display: true, text: "Sound Value" } },
    },
  };

  return <Line data={chartData} options={options} />;
};

export default SoundChart;
