// @vitest-environment jsdom
// Covers FEAT-ANALYTICS-002 — Daily Block Gap chart keeps decimal axis labels
import {render} from "@testing-library/react";
import {afterEach, describe, expect, it, vi} from "vitest";
import type {DailyBlockGapData} from "../../../api/hooks/useGetAnalyticsData";
import {ChartRangeDays} from "../Components/ChartRangeDaysSelect";
import DailyBlockGapChart from "./DailyBlockGapChart";

const lineChartSpy = vi.fn();
const getLabelsMock = vi.fn(
  (_data: DailyBlockGapData[], _days: ChartRangeDays) => [
    "06-29",
    "06-30",
    "07-01",
  ],
);
let capturedProps: {
  dataset: number[];
  decimals?: number;
  labels: string[];
  tooltipsLabelFunc?: (context: {
    parsed: {y: number | null | undefined};
  }) => string;
} | null = null;

vi.mock("../../../components/Card", () => ({
  CardOutline: ({children}: {children: React.ReactNode}) => children,
}));

vi.mock("../Components/ChartTitle", () => ({
  default: () => null,
}));

vi.mock("../utils", () => ({
  getLabels: (data: DailyBlockGapData[], days: ChartRangeDays) =>
    getLabelsMock(data, days),
}));

vi.mock("../Components/LineChart", () => ({
  default: (props: {
    dataset: number[];
    decimals?: number;
    labels: string[];
    tooltipsLabelFunc?: (context: {
      parsed: {y: number | null | undefined};
    }) => string;
  }) => {
    capturedProps = props;
    lineChartSpy();
    return null;
  },
}));

describe("FEAT-ANALYTICS-002 — Daily Block Gap chart", () => {
  afterEach(() => {
    capturedProps = null;
    getLabelsMock.mockClear();
    lineChartSpy.mockClear();
  });

  it("passes one decimal place to the shared line chart axis formatter", () => {
    const data: DailyBlockGapData[] = [
      {date: "2026-06-29", block_time_diff_nanos: "24300000"},
      {date: "2026-06-30", block_time_diff_nanos: "24500000"},
      {date: "2026-07-01", block_time_diff_nanos: "24900000"},
    ];

    render(
      <DailyBlockGapChart data={data} days={ChartRangeDays.DEFAULT_RANGE} />,
    );

    expect(lineChartSpy).toHaveBeenCalledTimes(1);
    expect(getLabelsMock).toHaveBeenCalledWith(
      data,
      ChartRangeDays.DEFAULT_RANGE,
    );
    expect(capturedProps).not.toBeNull();
    expect(capturedProps?.decimals).toBe(1);
    expect(capturedProps?.dataset).toEqual([24.3, 24.5, 24.9]);
    expect(capturedProps?.labels).toEqual(["06-29", "06-30", "07-01"]);
    expect(capturedProps?.tooltipsLabelFunc?.({parsed: {y: 24.3}})).toBe(
      "24.3 ms",
    );
  });
});
