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
