import {Button, Stack, Typography} from "@mui/material";
import {useTranslation} from "../../i18n";
import type {BlockHeightRange} from "./blockRange";

type BlockRangeControlsProps = {
  range: BlockHeightRange | undefined;
  olderDisabled: boolean;
  newerDisabled: boolean;
  onOlder: () => void;
  onNewer: () => void;
};

export default function BlockRangeControls({
  range,
  olderDisabled,
  newerDisabled,
  onOlder,
  onNewer,
}: BlockRangeControlsProps) {
  const {t, formatIntegerString} = useTranslation();

  return (
    <Stack
      component="nav"
      aria-label={t("pages.blocks.rangeNav")}
      direction="row"
      spacing={2}
      sx={{
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        my: 2,
        rowGap: 1,
      }}
    >
      <Typography variant="body2" sx={{color: "text.secondary"}}>
        {range
          ? t("pages.blocks.heightRange", {
              start: formatIntegerString(String(range.start)),
              end: formatIntegerString(String(range.end)),
            })
          : ""}
      </Typography>
      <Stack direction="row" spacing={1}>
        <Button
          variant="outlined"
          onClick={onOlder}
          disabled={olderDisabled}
          aria-label={t("pages.blocks.olderBlocks")}
        >
          {t("common.previous")}
        </Button>
        <Button
          variant="outlined"
          onClick={onNewer}
          disabled={newerDisabled}
          aria-label={t("pages.blocks.newerBlocks")}
        >
          {t("common.next")}
        </Button>
      </Stack>
    </Stack>
  );
}
