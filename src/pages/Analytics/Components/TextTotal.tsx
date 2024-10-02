import {Box, Typography} from "@mui/material";

type TextTotalProps = {
  value: string;
};

export default function TextTotal({value}: TextTotalProps) {
  return (
    <Box>
      <Typography fontSize={26}>{value}</Typography>
    </Box>
  );
}
