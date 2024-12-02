import React from "react";
import {Box, Container, Typography} from "@mui/material";

import Grid from "@mui/material/Unstable_Grid2";
import {Link} from "../../routing";

export default function Footer() {
  return (
    <Box
      sx={{
        background: "#FFD337",
        color: "#000000",
        mt: 8,
      }}
    >
      <Container maxWidth="xl" sx={{paddingTop: "2rem", paddingBottom: "2rem"}}>
        <Grid
          container
          gap={4}
          alignContent="center"
          alignItems="center"
          direction={{xs: "column", md: "row"}}
        >
          <Grid
            xs="auto"
            gap={1}
            container
            alignItems={{xs: "center", md: "start"}}
            direction="column"
          >
            <Link
              to="https://movementlabs.xyz/"
              target="_blank"
              title="Movement Labs"
              sx={{mr: {md: 2}}}
            >
              {/* <MovementLogoBlack width={50} height={50} />{" "} */}
            </Link>
            <Grid direction="row" padding="0">
              <Typography
                sx={{
                  textAlign: {
                    xs: "center",
                    md: "left",
                    fontFamily:
                      "space-grotesk-variable, Geneva, Tahoma, Verdana, sans-serif",
                  },
                  color: "#000000",
                }}
                fontSize="0.8rem"
              >
                © {new Date().getFullYear()}{" "}
                <Box component="span" sx={{whiteSpace: "nowrap"}}>
                  Movement All Rights Reserved
                </Box>
              </Typography>
            </Grid>
          </Grid>
          {/* 
          <Grid
            xs="auto"
            sx={{marginLeft: {xs: "0", md: "auto"}}}
            container
            justifyContent="end"
          >
            <Grid
              container
              justifyContent={{xs: "center", md: "end"}}
              spacing={3}
              direction="row"
            >
              {socialLinks.map((link) => (
                <Grid key={link.title}>
                  <Link
                    color="#000000" 
                    to={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={link.title}
                    width="26px"
                    sx={{display: "block"}}
                  >
                    <SvgIcon component={link.icon} inheritViewBox />
                  </Link>
                </Grid>
              ))}
            </Grid>
          </Grid> */}
        </Grid>
      </Container>
    </Box>
  );
}
