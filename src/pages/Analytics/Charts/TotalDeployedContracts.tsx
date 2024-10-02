import MetricCard from "../NetworkInfo/MetricCard";

type TotalDeployedContractsProps = {
  data: number;
};

export default function TotalDeployedContracts({
  data,
}: TotalDeployedContractsProps) {
  return (
    <MetricCard
      data={data.toLocaleString("en-US")}
      label="Total Deployed Contracts"
      tooltip="Total count of move modules."
    />
  );
}
