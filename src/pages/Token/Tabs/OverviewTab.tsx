import {useParams} from "react-router-dom";
import {gql, useQuery} from "@apollo/client";
import {Box, Stack} from "@mui/material";
import React, {useState} from "react";
import HashButton, {HashType} from "../../../components/HashButton";
import ContentBox from "../../../components/IndividualPageContent/ContentBox";
import ContentRow from "../../../components/IndividualPageContent/ContentRow";
import JsonViewCard from "../../../components/IndividualPageContent/JsonViewCard";
import {Link} from "../../../routing";

const OWNER_QUERY = gql`
  query OwnersData($token_id: String) {
    current_token_ownerships_v2(
      where: {amount: {_gt: 0}, token_data_id: {_eq: $token_id}}
    ) {
      owner_address
    }
  }
`;

function OwnersRow() {
  const {tokenId, propertyVersion} = useParams();

  const {data: ownersData} = useQuery(OWNER_QUERY, {
    variables: {
      token_id: tokenId,
    },
  });

  const owners = ownersData?.current_token_ownerships_v2 ?? [];

  return (
    <ContentRow
      title={"Owner(s):"}
      value={
        <Stack direction="row" spacing={1}>
          {owners.map((owner: {owner_address: string}) => (
            <HashButton hash={owner?.owner_address} type={HashType.ACCOUNT} />
          ))}
        </Stack>
      }
    />
  );
}

type OverviewTabProps = {
  // TODO: add graphql data typing
  data: any;
};

// TODO: add more contents
export default function OverviewTab({data}: OverviewTabProps) {
  const [metadataIsImage, setMetadataIsImage] = useState<boolean>(true);
  console.log(data);

  return (
    <Box marginBottom={3}>
      <ContentBox>
        <ContentRow title={"Token Name:"} value={data?.token_name} />
        <OwnersRow />
        <ContentRow
          title={"Collection Name:"}
          value={data?.current_collection?.collection_name}
        />
        <ContentRow
          title={"Creator:"}
          value={
            <HashButton
              hash={data?.current_collection?.creator_address}
              type={HashType.ACCOUNT}
            />
          }
        />
        <ContentRow
          title={"Metadata:"}
          value={
            metadataIsImage ? (
              <a href={data?.token_uri}>
                <img
                  src={data?.token_uri}
                  width={150}
                  onError={() => {
                    setMetadataIsImage(false);
                  }}
                  loading="lazy"
                />
              </a>
            ) : (
              <Link to={data?.token_uri} target="_blank">
                {data?.token_uri}
              </Link>
            )
          }
        />
      </ContentBox>
      <ContentBox>
        <ContentRow
          title={"Largest Property Version:"}
          value={data?.largest_property_version_v1}
        />
        <ContentRow title={"Supply:"} value={data?.supply} />
        <ContentRow title={"Maximum:"} value={data?.maximum} />
        <ContentRow
          title={"Token Properties:"}
          value={
            <JsonViewCard data={data?.token_properties} collapsedByDefault />
          }
        />
      </ContentBox>
    </Box>
  );
}
