import {VerificationStatus} from "../../../constants";

export const CODE_DESCRIPTION_NOT_VERIFIED =
  "The source code is plain text uploaded by the deployer, which can be different from the actual bytecode.";

export const CODE_DESCRIPTION_VERIFIED_DIFFERENT =
  "❗️Warning: This code is different from the actual bytecode.";

export const CODE_DESCRIPTION_VERIFIED_SAME =
  "The source code is same to the actual bytecode.";

export function genCodeDescription(status: VerificationStatus) {
  if (status === VerificationStatus.VERIFIED_DIFFERENT) {
    return CODE_DESCRIPTION_VERIFIED_DIFFERENT;
  }

  if (status === VerificationStatus.VERIFIED_SAME) {
    return CODE_DESCRIPTION_VERIFIED_SAME;
  }

  return CODE_DESCRIPTION_NOT_VERIFIED;
}
