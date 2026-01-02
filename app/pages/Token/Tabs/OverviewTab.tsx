import {useParams} from "@tanstack/react-router";
import {Box, Stack, Typography} from "@mui/material";
import React, {Fragment, useState} from "react";
import HashButton, {HashType} from "../../../components/HashButton";
import ContentBox from "../../../components/IndividualPageContent/ContentBox";
import ContentRow from "../../../components/IndividualPageContent/ContentRow";
import JsonViewCard from "../../../components/IndividualPageContent/JsonViewCard";
import {Link} from "../../../routing";
import {useGetTokenOwners} from "../../../api/hooks/useGetAccountTokens";
import {Current_Token_Datas_V2} from "aptos";
import {isValidIpfsUrl, isValidUrl, toIpfsUrl} from "../../utils";

function OwnersRow() {
  const params = useParams({strict: false}) as {tokenId?: string};
  const tokenId = params?.tokenId ?? "";
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

  let parsedUrl = data?.token_uri ?? "";
  if (isValidIpfsUrl(parsedUrl)) {
    parsedUrl = toIpfsUrl(parsedUrl);
  }

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
              <a href={parsedUrl}>
                <img
                  src={parsedUrl}
                  alt={data?.token_name}
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
        {data.token_standard == "v2" ? (
          <Fragment>
            <ContentRow
              title={"Collection id:"}
              value={
                <HashButton
                  hash={data?.current_collection?.collection_id ?? ""}
                  type={HashType.OBJECT}
                />
              }
            />

            <ContentRow
              title={"Token id:"}
              value={
                <HashButton
                  hash={data?.token_data_id ?? ""}
                  type={HashType.OBJECT}
                />
              }
            />
          </Fragment>
        ) : (
          <Fragment></Fragment>
        )}
        {data?.largest_property_version_v1 && (
          <ContentRow
            title={"Largest Property Version:"}
            value={data?.largest_property_version_v1}
          />
        )}
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
        {data?.last_transaction_version && (
          <ContentRow
            title={"Last transaction:"}
            value={
              <HashButton
                hash={data?.last_transaction_version.toString()}
                type={HashType.TRANSACTION}
              />
            }
          />
        )}
      </ContentBox>
    </Box>
  );
}
