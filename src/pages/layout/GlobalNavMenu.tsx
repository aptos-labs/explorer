import React, {useState} from "react";
import {
  Box,
  IconButton,
  Modal,
  Skeleton,
  Slide,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import HeadingBigSvg from "../../assets/svg/heading-big.svg?react";
import {
  BridgeIcon,
  DelegatedStakingIcon,
  ParthenonIcon,
  ExplorerIcon,
  MoveDocsIcon,
} from "../../assets/icons";

// Grid icon for trigger button
const GridIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="22"
    height="22"
    viewBox="0 0 22 22"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M1.26609 0H4.59424C5.29017 0 5.86033 0.570158 5.86033 1.26609V4.59424C5.86033 5.29017 5.29017 5.86033 4.59424 5.86033H1.26609C0.570158 5.86033 0 5.29017 0 4.59424V1.26609C0 0.571075 0.571075 0 1.26609 0ZM9.33639 0H12.6645C13.3605 0 13.9306 0.570158 13.9306 1.26609V4.59424C13.9306 5.29017 13.3605 5.86033 12.6645 5.86033H9.33639C8.64047 5.86033 8.07031 5.29017 8.07031 4.59424V1.26609C8.07031 0.568301 8.63772 0 9.33639 0ZM1.26609 8.07031H4.59424C5.29017 8.07031 5.86033 8.64047 5.86033 9.33639V12.6645C5.86033 13.3605 5.28925 13.9306 4.59424 13.9306L1.26609 13.9297C0.570158 13.9297 0 13.3596 0 12.6636V9.33642C0 8.64049 0.571075 8.07031 1.26609 8.07031ZM9.33639 8.07031H12.6645C13.3605 8.07031 13.9306 8.64047 13.9306 9.33639V12.6645C13.9306 13.3605 13.3596 13.9306 12.6645 13.9306L9.33639 13.9297C8.63861 13.9297 8.07031 13.3614 8.07031 12.6636V9.33642C8.07031 8.63771 8.63772 8.07031 9.33639 8.07031ZM17.4058 0H20.7339C21.4298 0 22 0.570158 22 1.26609V4.59424C22 5.29017 21.4298 5.86033 20.7339 5.86033H17.4058C16.7107 5.86033 16.1397 5.29017 16.1397 4.59424V1.26609C16.1397 0.568301 16.708 0 17.4058 0ZM17.4058 8.07031H20.7339C21.4298 8.07031 22 8.64047 22 9.33639V12.6645C22 13.3605 21.4298 13.9306 20.7339 13.9306H17.4058C16.708 13.9306 16.1397 13.3623 16.1397 12.6645V9.33639C16.1397 8.63769 16.708 8.07031 17.4058 8.07031ZM1.26609 16.1397H4.59424C5.29017 16.1397 5.86033 16.7098 5.86033 17.4058V20.7339C5.86033 21.4298 5.28925 22 4.59424 22H1.26609C0.570158 22 0 21.4298 0 20.7339V17.4058C0 16.708 0.568325 16.1397 1.26609 16.1397ZM9.33639 16.1397H12.6645C13.3605 16.1397 13.9306 16.7098 13.9306 17.4058V20.7339C13.9306 21.4298 13.3596 22 12.6645 22H9.33639C8.63861 22 8.07031 21.4317 8.07031 20.7339V17.4058C8.07031 16.7107 8.64047 16.1397 9.33639 16.1397ZM17.4058 16.1397H20.7339C21.4298 16.1397 22 16.7098 22 17.4058V20.7339C22 21.4298 21.4298 22 20.7339 22H17.4058C16.708 22 16.1397 21.4317 16.1397 20.7339V17.4058C16.1397 16.7107 16.7107 16.1397 17.4058 16.1397Z"
    />
  </svg>
);

// Product icons mapping
const productIcons: Record<string, React.FC> = {
  bridge: BridgeIcon,
  "delegated-staking": DelegatedStakingIcon,
  parthenon: ParthenonIcon,
  explorer: ExplorerIcon,
  "move-docs": MoveDocsIcon,
};

// Gradient backgrounds for product icons
const iconGradients: Record<string, string> = {
  bridge:
    "linear-gradient(130deg, rgba(255, 234, 144, 1) 24%, rgba(255, 217, 53, 1) 79%)",
  "delegated-staking":
    "linear-gradient(130deg, rgba(0, 255, 249, 1) 34%, rgba(129, 255, 186, 1) 79%)",
  parthenon:
    "linear-gradient(135deg, rgba(175, 133, 73, 1) 15%, rgba(251, 230, 123, 1) 38%, rgba(252, 251, 231, 1) 53%, rgba(247, 209, 78, 1) 70%, rgba(212, 160, 65, 1) 86%)",
  explorer:
    "linear-gradient(131deg, rgba(255, 102, 66, 1) 4%, rgba(200, 62, 30, 1) 96%)",
  "move-docs":
    "linear-gradient(129deg, rgba(51, 92, 255, 1) 28%, rgba(3, 55, 255, 1) 96%)",
};

// Navigation item type
export interface NavMenuItem {
  id: string;
  title: string;
  description: string;
  href?: string;
}

// Default navigation items
const defaultNavItems: NavMenuItem[] = [
  {
    id: "bridge",
    title: "BRIDGE",
    description:
      "Move assets seamlessly across chains with secure, high-performance cross-chain transfers.",
    href: "https://bridge.movementnetwork.xyz/",
  },
  {
    id: "delegated-staking",
    title: "DELEGATED STAKING",
    description:
      "Earn rewards by delegating your stake to validators securing the Movement network.",
    href: "https://staking.movementnetwork.xyz/",
  },
  {
    id: "parthenon",
    title: "PARTHENON",
    description:
      "Register and manage human-readable names for wallets, apps, and on-chain identities.",
    href: "https://parthenon.movementlabs.xyz/",
  },
  {
    id: "explorer",
    title: "EXPLORER",
    description:
      "Inspect blocks, transactions, and on-chain activity in real time across the Movement network.",
    href: "https://explorer.movementnetwork.xyz/?network=mainnet",
  },
  {
    id: "move-docs",
    title: "MOVE DOCS",
    description:
      "Explore official documentation, guides, and references for building on Movement.",
    href: "https://docs.movementnetwork.xyz/general",
  },
];

interface ProductBlockProps {
  item: NavMenuItem;
}

function ProductBlock({item}: ProductBlockProps) {
  const IconComponent = productIcons[item.id] || BridgeIcon;
  const gradient = iconGradients[item.id] || iconGradients.bridge;

  const handleClick = () => {
    if (item.href) {
      window.open(item.href, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <Box
      onClick={handleClick}
      sx={{
        display: "flex",
        gap: 2.5,
        alignItems: "flex-start",
        p: 2,
        borderRadius: "4px",
        width: "100%",
        cursor: "pointer",
        transition: "background-color 0.2s",
        "&:hover": {
          backgroundColor: "rgba(255, 255, 255, 0.08)",
        },
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {/* Icon container with gradient background */}
      <Box
        sx={{
          flexShrink: 0,
          width: 64,
          height: 64,
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: gradient,
        }}
      >
        <IconComponent />
      </Box>

      {/* Text content */}
      <Box sx={{display: "flex", flexDirection: "column", gap: 0.5, flex: 1}}>
        <Typography
          sx={{
            fontFamily: "'TWKEverett', sans-serif",
            fontWeight: 700,
            fontSize: "1rem",
            color: "#fff",
            letterSpacing: "0.05em",
            lineHeight: 1.4,
          }}
        >
          {item.title}
        </Typography>
        <Typography
          sx={{
            fontSize: "0.875rem",
            color: "rgba(255, 255, 255, 0.6)",
            lineHeight: 1.6,
          }}
        >
          {item.description}
        </Typography>
      </Box>
    </Box>
  );
}

interface GlobalNavMenuProps {
  items?: NavMenuItem[];
}

export default function GlobalNavMenu({
  items = defaultNavItems,
}: GlobalNavMenuProps) {
  const [open, setOpen] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const leftItems = items.slice(0, 3);
  const rightItems = items.slice(3, 6);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
      {/* Trigger button */}
      <IconButton
        onClick={handleOpen}
        sx={{
          width: 40,
          height: 40,
          color: "#fff",
          ml: 1,
          "&:hover": {
            color: "#81ffba",
          },
        }}
        aria-label="Open navigation menu"
      >
        <GridIcon />
      </IconButton>

      {/* Modal with Slide animation */}
      <Modal
        open={open}
        onClose={handleClose}
        closeAfterTransition
        slotProps={{
          backdrop: {
            sx: {
              backgroundColor: "rgba(0, 0, 0, 0.8)",
            },
          },
        }}
      >
        <Slide direction="down" in={open} mountOnEnter unmountOnExit>
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              backgroundColor: "#000",
              color: "#fff",
              maxHeight: isMobile ? "100vh" : "auto",
              height: isMobile ? "100vh" : "auto",
              overflowY: "auto",
              outline: "none",
            }}
          >
            {/* Close button */}
            <IconButton
              onClick={handleClose}
              sx={{
                position: "absolute",
                top: 24,
                right: 24,
                color: "#fff",
                zIndex: 10,
                border: 0,
                "&:hover": {
                  opacity: 1,
                },
                opacity: 0.7,
              }}
              aria-label="Close menu"
            >
              <CloseIcon sx={{fontSize: 24}} />
            </IconButton>

            {isMobile ? (
              // Mobile layout
              <Box
                sx={{
                  minHeight: "100vh",
                  bgcolor: "#000",
                }}
              >
                {/* Header with branding */}
                <Box
                  sx={{
                    pt: 3,
                    pb: 2,
                    px: 3,
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <HeadingBigSvg style={{height: 40, width: "auto"}} />
                </Box>

                {/* Apps section */}
                <Box sx={{px: 3, pb: 3}}>
                  <Typography
                    sx={{
                      fontFamily: "'TWKEverett', sans-serif",
                      fontWeight: 900,
                      fontSize: "1.125rem",
                      color: "#fff",
                      letterSpacing: "0.05em",
                      mb: 2,
                    }}
                  >
                    APPS
                  </Typography>
                  <Box sx={{display: "flex", flexDirection: "column"}}>
                    {items.map((item) => (
                      <ProductBlock key={item.id} item={item} />
                    ))}
                  </Box>
                </Box>
              </Box>
            ) : (
              // Desktop layout
              <Box sx={{minHeight: 600, bgcolor: "#000"}}>
                {/* Header with branding */}
                <Box
                  sx={{
                    height: 104,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <HeadingBigSvg style={{height: 64, width: "auto"}} />
                </Box>

                {/* Main content */}
                <Box sx={{px: 5, pb: 3}}>
                  <Box sx={{display: "flex", gap: 5}}>
                    {/* Apps columns */}
                    <Box
                      sx={{
                        display: "flex",
                        gap: 2,
                        flex: {md: 1, xl: "none"},
                        justifyContent: {md: "center", xl: "flex-start"},
                      }}
                    >
                      {/* Left apps column */}
                      <Box sx={{flex: {md: 1, xl: "none"}, maxWidth: 356}}>
                        <Typography
                          sx={{
                            fontFamily: "'TWKEverett', sans-serif",
                            fontWeight: 900,
                            fontSize: "1.125rem",
                            color: "#fff",
                            letterSpacing: "0.05em",
                            mb: 2,
                          }}
                        >
                          APPS
                        </Typography>
                        <Box sx={{display: "flex", flexDirection: "column"}}>
                          {leftItems.map((item) => (
                            <ProductBlock key={item.id} item={item} />
                          ))}
                        </Box>
                      </Box>

                      {/* Right apps column */}
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          flex: {md: 1, xl: "none"},
                          maxWidth: 345,
                        }}
                      >
                        <Box sx={{height: 47}} /> {/* Spacer */}
                        {rightItems.map((item) => (
                          <ProductBlock key={item.id} item={item} />
                        ))}
                      </Box>
                    </Box>

                    {/* Right section - Video and KAST */}
                    <Box
                      sx={{
                        display: {xs: "none", xl: "flex"},
                        flex: 1,
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 4,
                      }}
                    >
                      {/* Video section - Vimeo embed */}
                      <Box
                        sx={{
                          width: 384,
                          height: 224,
                          borderRadius: "8px",
                          overflow: "hidden",
                          position: "relative",
                        }}
                      >
                        {!isVideoLoaded && (
                          <Skeleton
                            variant="rectangular"
                            sx={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              width: "100%",
                              height: "100%",
                              bgcolor: "rgba(255, 255, 255, 0.1)",
                            }}
                          />
                        )}
                        <iframe
                          src="https://player.vimeo.com/video/1157746076?badge=0&autopause=0&player_id=0&app_id=58479"
                          width="384"
                          height="224"
                          frameBorder="0"
                          allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
                          referrerPolicy="strict-origin-when-cross-origin"
                          title="Movement x KAST"
                          onLoad={() => setIsVideoLoaded(true)}
                          style={{
                            width: "100%",
                            height: "100%",
                            border: "none",
                            visibility: isVideoLoaded ? "visible" : "hidden",
                          }}
                        />
                      </Box>

                      {/* Movement x KAST section */}
                      <Box sx={{width: 400}}>
                        <Typography
                          sx={{
                            fontFamily: "'TWKEverett', sans-serif",
                            fontWeight: 900,
                            fontSize: "1.125rem",
                            color: "#fff",
                            letterSpacing: "0.05em",
                            mb: 1,
                          }}
                        >
                          MOVEMENT x KAST
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: "0.875rem",
                            color: "rgba(255, 255, 255, 0.6)",
                            lineHeight: 1.6,
                          }}
                        >
                          Earn 4% cashback in{" "}
                          <Box
                            component="a"
                            href="https://x.com/search?q=%24MOVE&src=cashtag_click"
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{
                              color: "inherit",
                              textDecoration: "underline",
                            }}
                          >
                            $MOVE
                          </Box>{" "}
                          tokens on every purchase at 150+ million merchants
                          worldwide. The first dual-rewards cashback program in
                          Move history.{" "}
                          <Box
                            component="a"
                            href="https://www.movementnetwork.xyz/article/movement-kast-faq"
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{
                              color: "#81ffba",
                              textDecoration: "underline dotted",
                              cursor: "pointer",
                            }}
                          >
                            more
                          </Box>
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>
            )}
          </Box>
        </Slide>
      </Modal>
    </>
  );
}
