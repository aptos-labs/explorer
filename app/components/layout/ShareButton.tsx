import IosShareIcon from "@mui/icons-material/IosShare";
import {IconButton, Snackbar, Tooltip} from "@mui/material";
import {useCallback, useState} from "react";
import {resolveShareDeps, sharePage} from "./sharePage";

interface ShareButtonProps {
  /**
   * Optional override for the page title shared to the system share sheet.
   * Defaults to `document.title` at click time.
   */
  title?: string;
  /**
   * Optional spacing override (CSS margin-left) applied to the icon button.
   * Mirrors the spacing pattern used by the other Header IconButtons.
   */
  marginLeft?: string;
}

/**
 * Header action that shares the current page URL. Uses the Web Share API
 * when available (system share sheet on mobile + supported desktops) and
 * falls back to copying the URL to the clipboard.
 *
 * Designed to live in the explorer's persistent Header so users running the
 * installed PWA — which doesn't have the browser address bar / share menu —
 * still have a one-tap way to share whatever page they're on.
 */
export default function ShareButton({
  title,
  marginLeft = "1rem",
}: ShareButtonProps) {
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
  }>({open: false, message: ""});

  const handleClick = useCallback(async () => {
    if (typeof window === "undefined") return;
    const deps = resolveShareDeps();
    const outcome = await sharePage(
      {
        url: window.location.href,
        title: title ?? document.title,
      },
      deps,
    );

    if (outcome === "copied") {
      setSnackbar({open: true, message: "Link copied to clipboard"});
    } else if (outcome === "error") {
      setSnackbar({
        open: true,
        message: "Unable to share or copy the link",
      });
    }
    // "shared" and "cancelled" intentionally show no toast — the system UI
    // already gave the user feedback.
  }, [title]);

  const handleClose = useCallback(() => {
    setSnackbar((prev) => ({...prev, open: false}));
  }, []);

  return (
    <>
      <Tooltip title="Share this page">
        <IconButton
          aria-label="Share this page"
          onClick={handleClick}
          sx={{
            marginLeft,
            color: "inherit",
          }}
        >
          <IosShareIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Snackbar
        open={snackbar.open}
        onClose={handleClose}
        autoHideDuration={2500}
        message={snackbar.message}
        anchorOrigin={{vertical: "bottom", horizontal: "center"}}
      />
    </>
  );
}
