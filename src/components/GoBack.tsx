import * as React from 'react'; 
import { useNavigate } from 'react-router-dom';
import Button from "@mui/material/Button";
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';

export default function GoBack() {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(-1);
    };

    if (window.history.state && window.history.state.idx > 0) {
        return (
            <>
                <Button color="primary" variant="text" onClick={handleClick} sx={{ mb: 4 }} startIcon={<ArrowBackRoundedIcon />}>
                    Back
                </Button>
            </>
        );
    } else {
        return (null);
    }


}