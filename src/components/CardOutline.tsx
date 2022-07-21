import * as React from 'react'; 
import { Box} from "@mui/material"
import { useTheme } from '@mui/material';

interface ChildrenProps {
    children?: React.ReactNode;
}

export default function CardOutline(props: ChildrenProps) {

    const theme = useTheme();

    return (
    
    <Box sx={{ position: "relative", zIndex: "0", height: 1, paddingLeft: "0.5rem", paddingBottom: "0.5rem", mixBlendMode: theme.palette.mode === 'dark' ? "lighten" : "darken" }}>
        <Box sx={{ width: 1, height: 1, paddingRight: "0.5rem", paddingBottom: "0.5rem", transform: "translate(-0.5rem, 0.5rem)", zIndex: "-10", position: "absolute" }}>
            <Box sx={{ width: 1, height: 1, borderRadius: 1, border: `1px solid ${theme.palette.lineShade.main}` }}></Box>
        </Box>
            <Box sx={{ height: 1, p: 3, backgroundColor: theme.palette.mode === 'dark' ? "black" : "white", borderRadius: 1, border: `1px solid ${theme.palette.lineShade.main}` }}>
            {props.children}
        </Box>
    </Box>

    );
}