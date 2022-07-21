import * as React from 'react';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { ReactComponent as HamburgerIcon } from "../assets/svg/icon_hamburger.svg";
import { ReactComponent as CloseIcon } from "../assets/svg/icon_close.svg";
import { grey } from "@mui/material/colors";
import Link from '@mui/material/Link';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material';

export default function NavMobile() {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };
    const theme = useTheme();

    return (
        <Box 
            sx={{ display: { xs: 'block', md: 'none' } }}
        >
            <Button
                id="nav-mobile-button"
                aria-controls={open ? 'nav-mobile-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                onClick={handleClick}
                sx={{ minWidth: "0", width: "1.5rem", padding: "0", ml: 2, color: "inherit", "&:hover": { background: 'transparent', color: `${theme.palette.mode === 'dark' ? grey[100] : grey[400]}` }, "&[aria-expanded=true]":{opacity:"0.7"}}}
            >
                {open ? <CloseIcon /> : <HamburgerIcon />}
            </Button>
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                    'aria-labelledby': 'nav-mobile-button',
                        sx: {
                            minWidth: 240,
                            padding: '1rem'
                        }
                }}
                sx={{ marginTop: '1rem', boxShadow: 0, minWidth:'400px', maxWidth: 'none'}}
                
            >
                <li><MenuItem onClick={handleClose} component={Link} href="/transactions">Transactions</MenuItem></li>
                <li><MenuItem onClick={handleClose} component={Link} href="/proposals">Governance</MenuItem></li>
            </Menu>
        </Box>
    );
}
