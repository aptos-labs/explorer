import React, {useState} from "react";
import {Button, CircularProgress} from "@mui/material";
import useVerificationRequester from "../../../api/hooks/useVerificationRequester";
import {VerificationStatus} from "../../../constants";
import {genCodeDescription} from "./codeDescription";

interface VerificationButtonProps {
  network: string;
  account?: string;
  moduleName?: string;
  verificationStatus?: VerificationStatus;
  setVerificationStatus: React.Dispatch<
    React.SetStateAction<VerificationStatus>
  >;
  setVerificationServerErr: React.Dispatch<React.SetStateAction<string>>;
  setCodeDescription: React.Dispatch<React.SetStateAction<string>>;
}

export default function VerificationButton({
  network,
  account,
  moduleName,
  verificationStatus,
  setVerificationStatus,
  setVerificationServerErr,
  setCodeDescription,
}: VerificationButtonProps) {
  const [isInProgress, setIsInProgress] = useState(false);
  const verificationRequester = useVerificationRequester();

  const verifyClick = () => {
    if (!(account && moduleName)) {
      return;
    }
    setIsInProgress(true);
    verificationRequester({
      network: network,
      account: account,
      moduleName: moduleName,
    })
      .then((dto) => {
        setIsInProgress(false);
        if (dto.errMsg) {
          setVerificationStatus("NOT_VERIFIED");
          setVerificationServerErr(`${dto.errMsg}`);
        }

        if (!dto.status) {
          setVerificationStatus("NOT_VERIFIED");
          return;
        }

        setVerificationStatus(dto.status);
        setCodeDescription(genCodeDescription(dto.status));
        setVerificationServerErr("");
      })
      .catch((reason: Error) => {
        console.error(reason);
        setVerificationStatus("NOT_VERIFIED");
        setCodeDescription(genCodeDescription("NOT_VERIFIED"));
        setVerificationServerErr("Verification service is not working.");
      })
      .finally(() => {
        setIsInProgress(false);
      });
  };

  if (verificationStatus === "VERIFIED_DIFFERENT") {
    return (
      <Button
        type="submit"
        disabled={true}
        variant="contained"
        sx={{width: "10rem", height: "3rem"}}
      >
        <span style={{color: "red"}}>No Match</span>
      </Button>
    );
  }

  if (verificationStatus === "VERIFIED_SAME") {
    return (
      <Button
        type="submit"
        disabled={true}
        variant="contained"
        sx={{width: "10rem", height: "3rem"}}
      >
        <span style={{color: "green"}}>Match</span>
      </Button>
    );
  }

  return (
    <Button
      type="submit"
      disabled={isInProgress}
      variant="contained"
      sx={{width: "10rem", height: "3rem"}}
      onClick={verifyClick}
    >
      {verificationStatus === undefined || isInProgress ? (
        <CircularProgress size={30}></CircularProgress>
      ) : (
        "Verify"
      )}
    </Button>
  );
}
