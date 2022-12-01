import {Box} from "@mui/material";
import * as React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import {Line} from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

type LineChartProps = {
  labels: string[];
  dataset: number[];
  tooltipsLabelFunc?: (context: any) => string;
  yAxisLabelFunc?: (context: any) => string;
};

export default function LineChart({
  labels,
  dataset,
  tooltipsLabelFunc,
  yAxisLabelFunc,
}: LineChartProps) {
  const options = {
    fill: false,
    responsive: true,
    interaction: {
      intersect: false,
    },
    plugins: {
      title: {
        display: false,
      },
      legend: {
        display: false,
      },
      tooltip: {
        usePointStyle: true,
        labelPointStyle: {
          pointStyle: "circle",
          rotation: 0,
        },
        callbacks: {
          label: tooltipsLabelFunc,
        },
      },
    },
    scales: {
      y: {
        ticks: {
          callback: yAxisLabelFunc,
        },
      },
    },
  };

  const data = {
    labels,
    datasets: [
      {
        label: "",
        data: dataset,
        borderColor: "rgb(53, 162, 235)",
        backgroundColor: "rgba(53, 162, 235, 0.5)",
        tension: 0.4,
      },
    ],
  };

  return (
    <Box>
      <Line options={options} data={data} />
    </Box>
  );
}
