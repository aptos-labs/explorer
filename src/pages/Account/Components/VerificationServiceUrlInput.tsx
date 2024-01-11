import React from "react";
import {Input, Stack, Typography} from "@mui/material";
import {useGlobalState} from "../../../global-config/GlobalConfig";
import {defaultVerificationServiceUrl} from "../../../constants";

interface VerificationServiceUrlInputProps {
  verificationServerErr: string;
}

export default function VerificationServiceUrlInput({
  verificationServerErr,
}: VerificationServiceUrlInputProps) {
  const [, , endpoint, setEndpoint] = useGlobalState();
  return (
    <Stack
      direction="column"
      spacing={1}
      alignItems={"flex-start"}
      justifyContent="center"
      width={"100%"}
    >
      <Typography fontSize={12} width={"40em"}>
        <Stack direction={"column"} spacing={1}>
          <div
            style={{
              fontSize: "14px",
              fontWeight: "bold",
              minWidth: "15em",
            }}
          >
            Verification Service URL
          </div>

          <Input
            value={endpoint}
            onChange={(e) => {
              setEndpoint(e.target.value);
            }}
            placeholder={defaultVerificationServiceUrl}
            style={{height: "1.5em"}}
          />
          {verificationServerErr ? (
            <div
              style={{
                color: "red",
                overflow: "scroll",
                overflowWrap: "break-word",
              }}
            >
              {verificationServerErr}
            </div>
          ) : null}
        </Stack>
      </Typography>
    </Stack>
  );
}
