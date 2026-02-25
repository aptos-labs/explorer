import {
  type SxProps,
  TableBody,
  type TableBodyProps,
  type Theme,
} from "@mui/material";
import type React from "react";

interface GeneralTableBodyProps extends TableBodyProps {
  children?: React.ReactNode;
  sx?: SxProps<Theme>;
}

export default function GeneralTableBody({
  children,
  sx,
}: GeneralTableBodyProps) {
  return (
    <TableBody
      sx={[
        {
          "&.MuiTableBody-root::before": {
            height: "0px",
          },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {children}
    </TableBody>
  );
}
