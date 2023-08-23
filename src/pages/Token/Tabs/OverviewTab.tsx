import {useParams} from "react-router-dom";
import {Box, Stack, Typography} from "@mui/material";
import React, {useState} from "react";
import HashButton, {HashType} from "../../../components/HashButton";
import ContentBox from "../../../components/IndividualPageContent/ContentBox";
import ContentRow from "../../../components/IndividualPageContent/ContentRow";
import JsonViewCard from "../../../components/IndividualPageContent/JsonViewCard";
import {Link} from "../../../routing";
import {useGetTokenOwners} from "../../../api/hooks/useGetAccountTokens";
import {Current_Token_Datas_V2} from "aptos";
import {isValidUrl} from "../../utils";

function OwnersRow() {
  const {tokenId} = useParams();
  const {data: owners} = useGetTokenOwners(tokenId);

  return (
    <ContentRow
      title={"Owner(s):"}
      value={
        <Stack direction="row" spacing={1}>
          {(owners ?? []).map((owner: {owner_address: string}) => (
            <HashButton hash={owner?.owner_address} type={HashType.ACCOUNT} />
          ))}
        </Stack>
      }
    />
  );
}

type OverviewTabProps = {
  data: Current_Token_Datas_V2;
};

// TODO: add more contents
export default function OverviewTab({data}: OverviewTabProps) {
  const [metadataIsImage, setMetadataIsImage] = useState<boolean>(true);

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
              hash={data?.current_collection?.creator_address ?? ""}
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
            ) : isValidUrl(data?.token_uri) ? (
              <Link to={data?.token_uri} target="_blank">
                {data?.token_uri}
              </Link>
            ) : (
              <Typography fontSize="0.8rem">{data?.token_uri}</Typography>
            )
          }
        />
      </ContentBox>
      <ContentBox>
        <ContentRow
          title={"Largest Property Version:"}
          value={data?.largest_property_version_v1}
        />
        <ContentRow
          title={"Supply:"}
          value={data?.current_collection?.current_supply}
        />
        <ContentRow
          title={"Maximum:"}
          value={data?.current_collection?.max_supply}
        />
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
