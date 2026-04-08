import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlined";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import {Box, Chip, Stack, Tooltip} from "@mui/material";
import type {FaProperties} from "../api/hooks/useGetFaProperties";

type PropertyDef = {
  key: keyof FaProperties;
  label: string;
  tooltip: string;
};

const PROPERTY_DEFS: PropertyDef[] = [
  {
    key: "mintable",
    label: "Mintable",
    tooltip: "A MintRef exists, allowing the creator to mint new tokens",
  },
  {
    key: "burnable",
    label: "Burnable",
    tooltip: "A BurnRef exists, allowing the creator to burn tokens",
  },
  {
    key: "freezable",
    label: "Freezable",
    tooltip:
      "A TransferRef exists, allowing the creator to freeze or unfreeze accounts",
  },
  {
    key: "dispatchable",
    label: "Dispatchable",
    tooltip:
      "Custom dispatch functions are registered for transfers (withdraw/deposit/balance)",
  },
];

type Props = {
  properties: FaProperties;
};

export default function FaPropertiesDisplay({properties}: Props) {
  return (
    <Box>
      <Stack direction="row" spacing={1} sx={{flexWrap: "wrap"}}>
        {PROPERTY_DEFS.map(({key, label, tooltip}) => {
          const enabled = properties[key];
          return (
            <Tooltip key={key} title={tooltip} arrow>
              <Chip
                size="small"
                icon={
                  enabled ? (
                    <CheckCircleOutlineIcon fontSize="small" />
                  ) : (
                    <HighlightOffIcon fontSize="small" />
                  )
                }
                label={label}
                variant="outlined"
                color={enabled ? "success" : "default"}
                sx={{
                  opacity: enabled ? 1 : 0.6,
                }}
              />
            </Tooltip>
          );
        })}
      </Stack>
    </Box>
  );
}
