import {Types} from "aptos";
import ContentBox from "../../../../components/IndividualPageContent/ContentBox";
import ContentRow from "../../../../components/IndividualPageContent/ContentRow";
import {truncateAddress} from "../../../utils";
import {Link} from "../../../../routing";
import {AccountAddress} from "@aptos-labs/ts-sdk";

const AddressLink: React.FC<{
  address: string;
  type: "address" | "object" | "token";
}> = ({address, type}) => (
  <Link
    to={`/${type === "address" ? "account" : type}/${AccountAddress.from(address).toString()}`}
  >
    {truncateAddress(address)}
  </Link>
);

const mapEventToTransactionAction = (event: Types.Event) => {
  if (
    event.type === "0x4::collection::MintEvent" ||
    event.type === "0x4::collection::Mint"
  ) {
    const {token} = event.data;
    return (
      <li>
        Mint Token <AddressLink address={token} type="token" />
      </li>
    );
  } else if (
    event.type === "0x4::collection::BurnEvent" ||
    event.type === "0x4::collection::Burn"
  ) {
    const {token} = event.data;
    return (
      <li>
        Burn Token <AddressLink address={token} type="token" />
      </li>
    );
  } else if (event.type === "0x1::object::TransferEvent") {
    const {from, object, to} = event.data;
    return (
      <li>
        Transfer Object <AddressLink address={object} type="object" /> from{" "}
        <AddressLink address={from} type="address" /> to{" "}
        <AddressLink address={to} type="address" />
      </li>
    );
  }
  return null;
};

export const TransactionActions: React.FC<{transaction: Types.Transaction}> = ({
  transaction,
}) => {
  const events: Types.Event[] =
    "events" in transaction ? transaction.events : [];
  const listItems = events
    .map((event) => mapEventToTransactionAction(event))
    .filter((li) => li !== null);

  if (listItems.length === 0) {
    return null;
  }

  return (
    <ContentBox>
      <ContentRow title="Transaction Actions" value={<ol>{listItems}</ol>} />
    </ContentBox>
  );
};
