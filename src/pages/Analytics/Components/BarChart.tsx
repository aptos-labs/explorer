import {Box} from "@mui/material";
import * as React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import {Bar} from "react-chartjs-2";
import {numberFormatter} from "../utils";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

type BarChartProps = {
  labels: string[];
  dataset: number[];
};

export default function BarChart({labels, dataset}: BarChartProps) {
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
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        ticks: {
          callback: (value: any) => numberFormatter(value, 0),
          count: 4,
        },
        grid: {
          display: false,
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
        backgroundColor: "rgba(53, 162, 235, 0.5)",
      },
    ],
  };

  return (
    <Box>
      <Bar options={options} data={data} />
    </Box>
  );
}
