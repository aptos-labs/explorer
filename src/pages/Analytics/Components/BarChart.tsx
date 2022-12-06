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
import {BACKGROUND_COLOR} from "../constants";

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
        ticks: {
          autoSkip: true,
          maxTicksLimit: 4,
          maxRotation: 0,
        },
      },
      y: {
        ticks: {
          callback: (value: any) => numberFormatter(value, 0),
          autoSkip: true,
          maxTicksLimit: 3,
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
        backgroundColor: BACKGROUND_COLOR,
      },
    ],
  };

  return (
    <Box>
      <Bar options={options} data={data} />
    </Box>
  );
}
