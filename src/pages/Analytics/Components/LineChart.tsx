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
  Filler,
  Legend,
} from "chart.js";
import {Line} from "react-chartjs-2";
import {numberFormatter} from "../utils";
import {BACKGROUND_COLOR, COLOR, HIGHLIGHT_COLOR} from "../constants";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
);

type LineChartProps = {
  labels: string[];
  dataset: number[];
  fill?: boolean;
  tooltipsLabelFunc?: (context: any) => string;
  decimals?: number;
};

export default function LineChart({
  labels,
  dataset,
  fill,
  tooltipsLabelFunc,
  decimals,
}: LineChartProps) {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
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
        callbacks: {
          label: tooltipsLabelFunc,
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
          callback: (value: any) => numberFormatter(value, decimals ?? 0),
          autoSkip: true,
          maxTicksLimit: 3,
        },
        grid: {
          display: false,
        },
      },
    },
    elements: {
      point: {
        pointStyle: "circle",
        pointBackgroundColor: HIGHLIGHT_COLOR,
        borderWidth: 0,
        radius: 3,
        hoverRadius: 4,
      },
    },
  };

  const data = {
    labels,
    datasets: [
      {
        label: "",
        fill: fill,
        data: dataset,
        borderColor: COLOR,
        backgroundColor: BACKGROUND_COLOR,
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
