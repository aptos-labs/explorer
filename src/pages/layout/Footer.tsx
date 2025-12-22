import React from "react";
import {Box, Container, Typography, Grid2} from "@mui/material";
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
        <Grid2
          container
          gap={4}
          alignContent="center"
          alignItems="center"
          direction={{xs: "column", md: "row"}}
        >
          <Grid2
            size={{xs: "auto"}}
            gap={1}
            container
            alignItems={{xs: "center", md: "start"}}
            direction="column"
          >
            <Link
              to="https://movementnetwork.xyz/"
              target="_blank"
              title="Movement Network"
              sx={{mr: {md: 2}}}
            >
              {/* <MovementLogoBlack width={50} height={50} />{" "} */}
            </Link>
            <Grid2 container direction="row" padding="0" spacing={2}>
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
                  Movement Network Foundation
                </Box>
              </Typography>
            </Grid2>
          </Grid2>
          {/* 
          <Grid
            xs="auto"
            sx={{marginLeft: {xs: "0", md: "auto"}}}
            container
            justifyContent="end"
          >
            <Grid2
              container
              justifyContent={{xs: "center", md: "end"}}
              spacing={3}
              direction="row"
            >
              {socialLinks.map((link) => (
                <Grid2 key={link.title}>
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
                </Grid2>
              ))}
            </Grid>
          </Grid> */}
        </Grid2>
      </Container>
    </Box>
  );
}
