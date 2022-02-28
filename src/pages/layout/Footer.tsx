import React from "react";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";


export default function Footer() {
  return (
    <Container maxWidth="lg">
      <Container maxWidth="lg">
        <Grid container spacing={3} sx={{height: "10vh",}}>
          <Typography variant="body2" color="text.secondary" align="left" pt={4}>
            <Link color="inherit" href="https://aptoslabs.com/" target="blank">
              Aptos Labs
            </Link>
            {" "} © {new Date().getFullYear()}
          </Typography>
        </Grid>
      </Container>
    </Container>
  );
}
