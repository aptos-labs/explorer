import React from "react";
import {SxProps, TableBody, TableBodyProps, Theme} from "@mui/material";

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
