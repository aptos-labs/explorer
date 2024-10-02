import MetricCard from "../NetworkInfo/MetricCard";

type TotalContractDeployersProps = {
  data: number;
};

export default function TotalContractDeployers({
  data,
}: TotalContractDeployersProps) {
  return (
    <MetricCard
      data={data.toLocaleString("en-US")}
      label="Total Contract Deployers"
      tooltip="Total count of addresses with move modules."
    />
  );
}
