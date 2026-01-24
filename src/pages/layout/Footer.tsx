import React from "react";
import {Box, Typography, useMediaQuery, useTheme} from "@mui/material";
import {Link} from "../../routing";
import FooterBigSvg from "../../assets/svg/footer-big.svg?react";
import FooterSmallSvg from "../../assets/svg/footer-small.svg?react";

// Social media icons
const XIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const DiscordIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="14"
    viewBox="0 0 24 20"
    fill="currentColor"
  >
    <path d="M20.317 1.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 0 0-.079.036c-.21.369-.444.85-.608 1.23a18.566 18.566 0 0 0-5.487 0 12.36 12.36 0 0 0-.617-1.23A.077.077 0 0 0 8.562.002c-1.714.29-3.354.8-4.885 1.491a.07.07 0 0 0-.032.027C.533 6.093-.32 10.555.099 14.961a.08.08 0 0 0 .031.055 20.03 20.03 0 0 0 5.993 2.98.078.078 0 0 0 .084-.026 13.83 13.83 0 0 0 1.226-1.963.074.074 0 0 0-.041-.104 13.201 13.201 0 0 1-1.872-.878.075.075 0 0 1-.008-.125c.126-.093.252-.19.372-.287a.075.075 0 0 1 .078-.01c3.927 1.764 8.18 1.764 12.061 0a.075.075 0 0 1 .079.009c.12.098.245.195.372.288a.075.075 0 0 1-.006.125c-.598.344-1.22.635-1.873.877a.075.075 0 0 0-.041.105c.36.687.772 1.341 1.225 1.962a.077.077 0 0 0 .084.028 19.963 19.963 0 0 0 6.002-2.981.076.076 0 0 0 .032-.054c.5-5.094-.838-9.52-3.549-13.442a.06.06 0 0 0-.031-.028zM8.02 12.278c-1.183 0-2.157-1.068-2.157-2.38 0-1.312.956-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.956 2.38-2.157 2.38zm7.975 0c-1.183 0-2.157-1.068-2.157-2.38 0-1.312.956-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.947 2.38-2.157 2.38z" />
  </svg>
);

const GitHubIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
  </svg>
);

const LinkedInIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const RedditIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
  </svg>
);

// Types
interface FooterLink {
  label: string;
  href: string;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

interface SocialLink {
  platform: "x" | "discord" | "github" | "linkedin" | "reddit";
  href: string;
  icon: React.FC;
}

// Default values
const defaultColumns: FooterColumn[] = [
  {
    title: "Company",
    links: [
      {label: "Learn", href: "https://www.movementnetwork.xyz/learn"},
      {label: "Blog", href: "https://www.movementnetwork.xyz/blog"},
      {label: "Careers", href: "https://jobs.ashbyhq.com/moveindustries"},
      {
        label: "Privacy Policy",
        href: "https://www.movementnetwork.xyz/privacy-policy",
      },
    ],
  },
  {
    title: "Resources",
    links: [
      {label: "Ecosystem", href: "https://movementnetwork.xyz/ecosystem"},
      {label: "Move Docs", href: "https://docs.movementnetwork.xyz/general"},
      {label: "Developer Portal", href: "https://developer.movementnetwork.xyz/"},
    ],
  },
  // {
  //   title: "Contact",
  //   links: [
  //     {label: "Contact Us", href: "#"},
  //     {label: "FAQs", href: "#"},
  //     {
  //       label: "Support",
  //       href: "https://discord.com/channels/1101576619493167217/1362083188104626516",
  //     },
  //   ],
  // },
];

const defaultSocialLinks: SocialLink[] = [
  {platform: "x", href: "https://x.com/moveindustries", icon: XIcon},
  {platform: "discord", href: "https://discord.gg/G6SaA7Eq", icon: DiscordIcon},
  {
    platform: "github",
    href: "https://github.com/movementlabsxyz/movement",
    icon: GitHubIcon,
  },
  {
    platform: "reddit",
    href: "https://www.reddit.com/r/MovementXYZ/",
    icon: RedditIcon,
  },
  {
    platform: "linkedin",
    href: "https://www.linkedin.com/company/move-industries-blockchain",
    icon: LinkedInIcon,
  },
];

// Footer Column Component
interface FooterColumnComponentProps {
  column: FooterColumn;
  showBorder?: boolean;
}

function FooterColumnComponent({
  column,
  showBorder = true,
}: FooterColumnComponentProps) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        ...(showBorder && {
          borderLeft: "1px solid #FFDA34",
          pl: 4,
        }),
      }}
    >
      <Typography
        sx={{
          fontSize: "1rem",
          fontFamily: "'TWKEverett', sans-serif",
          fontWeight: 900,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          color: "rgba(255, 255, 255, 0.5)",
        }}
      >
        {column.title}
      </Typography>
      <Box component="nav" sx={{display: "flex", flexDirection: "column", gap: 2}}>
        {column.links.map((link) => (
          <Link
            key={link.label}
            to={link.href}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              fontSize: "1rem",
              color: "#fff",
              textDecoration: "none",
              transition: "color 0.2s",
              "&:hover": {
                color: "#FFDA34",
              },
            }}
          >
            {link.label}
          </Link>
        ))}
      </Box>
    </Box>
  );
}

// Social Icons Grid Component
interface SocialIconsGridProps {
  socialLinks: SocialLink[];
}

function SocialIconsGrid({socialLinks}: SocialIconsGridProps) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: 2,
      }}
    >
      {socialLinks.map((social) => {
        const IconComponent = social.icon;
        return (
          <Box
            key={social.platform}
            component="a"
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "50%",
              width: 32,
              height: 32,
              backgroundColor: "#fff",
              color: "#000",
              transition: "all 0.2s",
              "&:hover": {
                backgroundColor: "#FFDA34",
                color: "#000",
              },
            }}
            aria-label={`Follow us on ${social.platform}`}
          >
            <IconComponent />
          </Box>
        );
      })}
    </Box>
  );
}

// Desktop Footer
interface DesktopFooterProps {
  showHeading: boolean;
  heading: string;
  columns: FooterColumn[];
  socialLinks: SocialLink[];
  copyright: string;
}

function DesktopFooter({
  showHeading,
  heading,
  columns,
  socialLinks,
  copyright,
}: DesktopFooterProps) {
  return (
    <Box
      sx={{
        width: "100%",
        backgroundColor: "#000",
        px: 6,
        py: 6,
      }}
    >
      {/* Heading at top */}
      {showHeading && (
        <Typography
          sx={{
            mb: 5,
            fontFamily: "'TWKEverett', sans-serif",
            fontSize: "2rem",
            fontWeight: 900,
            textTransform: "uppercase",
            lineHeight: 1.5,
            color: "#fff",
          }}
        >
          {heading}
        </Typography>
      )}

      {/* Main content area */}
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
        {/* Logo section - left side */}
        <Box sx={{display: "flex", alignItems: "center", flexShrink: 0}}>
          <FooterBigSvg style={{height: 96, width: "auto"}} />
        </Box>

        {/* Navigation columns - right side */}
        <Box sx={{display: "flex", gap: 10}}>
          {columns.map((column) => (
            <FooterColumnComponent key={column.title} column={column} />
          ))}

          {/* Connect column with social icons */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              borderLeft: "1px solid #FFDA34",
              pl: 4,
            }}
          >
            <Typography
              sx={{
                fontSize: "1rem",
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                color: "rgba(255, 255, 255, 0.5)",
              }}
            >
              Connect
            </Typography>
            <SocialIconsGrid socialLinks={socialLinks} />
          </Box>
        </Box>
      </Box>

      {/* Copyright at bottom center */}
      <Typography
        sx={{
          mt: 5,
          textAlign: "center",
          fontSize: "1rem",
          color: "rgba(255, 255, 255, 0.6)",
        }}
      >
        {copyright}
      </Typography>
    </Box>
  );
}

// Mobile Footer
interface MobileFooterProps {
  showHeading: boolean;
  heading: string;
  columns: FooterColumn[];
  socialLinks: SocialLink[];
  copyright: string;
}

function MobileFooter({
  showHeading,
  heading,
  columns,
  socialLinks,
  copyright,
}: MobileFooterProps) {
  return (
    <Box
      sx={{
        width: "100%",
        backgroundColor: "#000",
        px: 3,
        py: 5,
      }}
    >
      {/* Logo centered at top */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
        }}
      >
        <FooterSmallSvg style={{height: 64, width: "auto"}} />
      </Box>

      {/* Heading centered below logo */}
      {showHeading && (
        <Typography
          sx={{
            mt: 4,
            textAlign: "center",
            fontFamily: "'TWKEverett', sans-serif",
            fontSize: "1.5rem",
            fontWeight: 700,
            textTransform: "uppercase",
            lineHeight: 1.4,
            color: "rgba(255, 255, 255, 0.6)",
          }}
        >
          <Box component="span" sx={{display: "block"}}>
            Serving the
          </Box>
          <Box component="span" sx={{display: "block"}}>
            People's Chain. powered by Move.
          </Box>
        </Typography>
      )}

      {/* Navigation columns in 2x2 grid */}
      <Box
        sx={{
          mt: 5,
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 3,
          rowGap: 5,
        }}
      >
        {columns.map((column) => (
          <FooterColumnComponent
            key={column.title}
            column={column}
            showBorder={false}
          />
        ))}

        {/* Connect column with social icons */}
        <Box sx={{display: "flex", flexDirection: "column", gap: 2}}>
          <Typography
            sx={{
              fontFamily: "'TWKEverett', sans-serif",
              fontSize: "1rem",
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "rgba(255, 255, 255, 0.5)",
            }}
          >
            Connect
          </Typography>
          <SocialIconsGrid socialLinks={socialLinks} />
        </Box>
      </Box>

      {/* Copyright at bottom center */}
      <Typography
        sx={{
          mt: 6,
          textAlign: "center",
          fontSize: "1rem",
          color: "rgba(255, 255, 255, 0.6)",
        }}
      >
        {copyright}
      </Typography>
    </Box>
  );
}

// Main Footer Component
interface FooterProps {
  showHeading?: boolean;
  heading?: string;
  columns?: FooterColumn[];
  socialLinks?: SocialLink[];
  copyright?: string;
}

export default function Footer({
  showHeading = true,
  heading = "Serving the People's Chain. powered by Move.",
  columns = defaultColumns,
  socialLinks = defaultSocialLinks,
  copyright = `\u00A9 ${new Date().getFullYear()} Move Industries. All rights reserved.`,
}: FooterProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));

  const sharedProps = {
    showHeading,
    heading,
    columns,
    socialLinks,
    copyright,
  };

  return (
    <Box component="footer" sx={{width: "100%", mt: 8}}>
      {isMobile ? (
        <MobileFooter {...sharedProps} />
      ) : (
        <DesktopFooter {...sharedProps} />
      )}
    </Box>
  );
}
