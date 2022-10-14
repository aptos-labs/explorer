import {useParams} from "react-router-dom";
import {gql, useQuery} from "@apollo/client";
import {Box, Link, Stack} from "@mui/material";
import React, {useState} from "react";
import HashButton, {HashType} from "../../../components/HashButton";
import ContentBox from "../../../components/IndividualPageContent/ContentBox";
import ContentRow from "../../../components/IndividualPageContent/ContentRow";
import JsonCard from "../../../components/IndividualPageContent/JsonCard";

const OWNER_QUERY = gql`
  query OwnersData($token_id: String, $property_version: numeric) {
    current_token_ownerships(
      where: {
        token_data_id_hash: {_eq: $token_id}
        property_version: {_eq: $property_version}
      }
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
      property_version: parseInt(propertyVersion ?? ""),
    },
  });

  const owners = ownersData?.current_token_ownerships ?? [];

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

function getRoyalty(
  data: any, // TODO: add graphql data typing
): string | null {
  if (!data?.royalty_points_numerator || !data?.royalty_points_denominator) {
    return null;
  }

  const numerator = parseInt(data.royalty_points_numerator);
  const denominator = parseInt(data.royalty_points_denominator);

  if (denominator === 0) {
    return null;
  }

  return `${((numerator * 100) / denominator).toFixed(0)}%`;
}

type OverviewTabProps = {
  // TODO: add graphql data typing
  data: any;
};

// TODO: add more contents
export default function OverviewTab({data}: OverviewTabProps) {
  const [metadataIsImage, setMetadataIsImage] = useState<boolean>(true);

  return (
    <Box marginBottom={3}>
      <ContentBox>
        <ContentRow title={"Token Name:"} value={data?.name} />
        <OwnersRow />
        <ContentRow title={"Collection Name:"} value={data?.collection_name} />
        <ContentRow
          title={"Creator:"}
          value={
            <HashButton hash={data?.creator_address} type={HashType.ACCOUNT} />
          }
        />
        <ContentRow title={"Royalty:"} value={getRoyalty(data)} />
        <ContentRow
          title={"Royalty Payee:"}
          value={
            <HashButton hash={data?.payee_address} type={HashType.ACCOUNT} />
          }
        />
        <ContentRow
          title={"Metadata:"}
          value={
            metadataIsImage ? (
              <a href={data?.metadata_uri}>
                <img
                  src={data?.metadata_uri}
                  width={150}
                  onError={() => {
                    setMetadataIsImage(false);
                  }}
                  loading="lazy"
                />
              </a>
            ) : (
              <Link href={data?.metadata_uri}>Link</Link>
            )
          }
        />
      </ContentBox>
      <ContentBox>
        <ContentRow
          title={"Largest Property Version:"}
          value={data?.largest_property_version}
        />
        <ContentRow title={"Supply:"} value={data?.supply} />
        <ContentRow title={"Maximum:"} value={data?.maximum} />
        <ContentRow
          title={"Default Properties:"}
          value={<JsonCard data={data?.default_properties} />}
        />
      </ContentBox>
    </Box>
  );
}
