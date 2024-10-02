import MetricCard from "../NetworkInfo/MetricCard";

type TotalNewAccountsCreatedProps = {
  data: number;
};

export default function TotalNewAccountsCreated({
  data,
}: TotalNewAccountsCreatedProps) {
  return (
    <MetricCard
      data={data.toLocaleString("en-US")}
      label="Total Accounts Created"
      tooltip="Total count of distinct addresses getting coin balance for the first time."
    />
  );
}
