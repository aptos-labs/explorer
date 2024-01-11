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
          setVerificationStatus(VerificationStatus.NOT_VERIFIED);
          setVerificationServerErr(`${dto.errMsg}`);
        }

        if (!dto.status) {
          setVerificationStatus(VerificationStatus.NOT_VERIFIED);
          return;
        }

        setVerificationStatus(dto.status);
        setCodeDescription(genCodeDescription(dto.status));
        setVerificationServerErr("");
      })
      .catch((reason: Error) => {
        console.error(reason);
        setVerificationStatus(VerificationStatus.NOT_VERIFIED);
        setCodeDescription(genCodeDescription(VerificationStatus.NOT_VERIFIED));
        setVerificationServerErr("Verification service is not working.");
      })
      .finally(() => {
        setIsInProgress(false);
      });
  };

  if (verificationStatus === VerificationStatus.VERIFIED_DIFFERENT) {
    return (
      <Button
        type="submit"
        disabled={true}
        variant="contained"
        sx={{width: "16rem", height: "3rem"}}
        style={{textTransform: "none"}}
      >
        <span style={{color: "red"}}>Doesn't Match</span>
      </Button>
    );
  }

  if (verificationStatus === VerificationStatus.VERIFIED_SAME) {
    return (
      <Button
        type="submit"
        disabled={true}
        variant="contained"
        sx={{width: "16rem", height: "3rem"}}
        style={{textTransform: "none"}}
      >
        <span style={{color: "green"}}>Matches</span>
      </Button>
    );
  }

  return (
    <Button
      type="submit"
      disabled={isInProgress}
      variant="contained"
      sx={{width: "16rem", height: "3rem"}}
      onClick={verifyClick}
      style={{textTransform: "none"}}
    >
      {verificationStatus === undefined || isInProgress ? (
        <CircularProgress size={30}></CircularProgress>
      ) : (
        "Verify Source Code"
      )}
    </Button>
  );
}
