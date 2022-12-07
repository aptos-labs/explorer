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
import {BACKGROUND_COLOR, COLOR} from "../constants";

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
};

export default function LineChart({
  labels,
  dataset,
  fill,
  tooltipsLabelFunc,
}: LineChartProps) {
  const options = {
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
          callback: (value: any) => numberFormatter(value, 0),
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
        radius: 0.1,
        borderWidth: 7,
        hoverRadius: 0.1,
        hoverBorderWidth: 9,
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
