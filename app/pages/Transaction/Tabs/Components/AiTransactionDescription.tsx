import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import {useCallback, useState} from "react";
import type {Types} from "~/types/aptos";
import {useAptosClient} from "../../../../global-config";
import {requestAiChatCompletion} from "../../../../lib/ai/chatClient";
import {gatherTransactionSources} from "../../../../lib/ai/gatherTransactionSources";
import {
  buildTransactionDescriptionPrompt,
  extractTransactionAiInputs,
  extractTransactionAiOutputs,
  type TransactionSourceSnippet,
} from "../../../../lib/ai/transactionContext";
import {Link} from "../../../../routing";
import {
  isAiTransactionDescriptionConfigured,
  useExplorerSettings,
} from "../../../../settings";
import ContentBox from "../../../../components/IndividualPageContent/ContentBox";
import {getAiProviderOption} from "../../../../lib/ai/providers";

type AiTransactionDescriptionProps = {
  transaction: Types.Transaction;
};

type GenerationState =
  | {status: "idle"}
  | {status: "loading"}
  | {status: "success"; text: string; sources: TransactionSourceSnippet[]}
  | {status: "error"; message: string};

function sourceSummary(sources: TransactionSourceSnippet[]): string {
  if (sources.length === 0) {
    return "No contract source was available; the model only saw transaction inputs and outputs.";
  }
  return sources
    .map((source) => {
      if (source.origin === "published") {
        return `published source for ${source.identifier}`;
      }
      if (source.origin === "decompiled") {
        return `decompiled ${source.kind} ${source.identifier}`;
      }
      return `no source for ${source.identifier}`;
    })
    .join("; ");
}

export default function AiTransactionDescription({
  transaction,
}: AiTransactionDescriptionProps) {
  const {settings} = useExplorerSettings();
  const aptosClient = useAptosClient();
  const [state, setState] = useState<GenerationState>({status: "idle"});

  const configured = isAiTransactionDescriptionConfigured(settings);

  const generate = useCallback(async () => {
    if (!configured) {
      return;
    }
    setState({status: "loading"});
    let sources: TransactionSourceSnippet[] = [];
    try {
      try {
        sources = await gatherTransactionSources(transaction, aptosClient);
      } catch (error) {
        sources = [
          {
            kind: "module",
            identifier: "contract",
            origin: "unavailable",
            code: "",
            note:
              error instanceof Error
                ? `Failed to load contract source: ${error.message}`
                : "Failed to load contract source",
          },
        ];
      }

      const prompt = buildTransactionDescriptionPrompt({
        inputs: extractTransactionAiInputs(transaction),
        outputs: extractTransactionAiOutputs(transaction),
        sources,
      });

      const text = await requestAiChatCompletion({
        provider: settings.aiProvider,
        model: settings.aiModel,
        apiKey: settings.aiApiKey,
        baseUrl: settings.aiBaseUrl,
        system: prompt.system,
        user: prompt.user,
      });
      setState({status: "success", text, sources});
    } catch (error) {
      setState({
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "Failed to generate a description",
      });
    }
  }, [aptosClient, configured, settings, transaction]);

  if (!settings.enableAiTransactionDescriptions) {
    return null;
  }

  const providerLabel = getAiProviderOption(settings.aiProvider).label;

  return (
    <ContentBox>
      <Stack spacing={2}>
        <Stack
          direction="row"
          spacing={1}
          sx={{alignItems: "center", flexWrap: "wrap", rowGap: 1}}
        >
          <AutoAwesomeOutlinedIcon fontSize="small" color="primary" />
          <Typography variant="h6" component="h2" sx={{fontWeight: 600}}>
            AI description
          </Typography>
          <Chip label="Experimental" size="small" variant="outlined" />
        </Stack>
        <Typography variant="body2" sx={{color: "text.secondary"}}>
          Generates a plain-language summary from this transaction&apos;s
          inputs, outputs, and Move source (published package source, or
          in-browser decompilation of script/module bytecode). The request is
          sent from your browser to the provider you configured — the explorer
          server never receives your API key.
        </Typography>

        {!configured ? (
          <Alert severity="info">
            Add a provider, model, and API key in{" "}
            <Button
              component={Link}
              to="/settings"
              size="small"
              variant="text"
              sx={{textTransform: "none", minWidth: "unset", px: 0.5}}
            >
              Settings
            </Button>{" "}
            to generate a description.
          </Alert>
        ) : (
          <Stack direction="row" spacing={1} sx={{alignItems: "center"}}>
            <Button
              variant="contained"
              onClick={() => void generate()}
              disabled={state.status === "loading"}
              startIcon={
                state.status === "loading" ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <AutoAwesomeOutlinedIcon />
                )
              }
            >
              {state.status === "success"
                ? "Regenerate description"
                : "Describe this transaction"}
            </Button>
            <Typography variant="caption" sx={{color: "text.secondary"}}>
              {providerLabel}
              {settings.aiModel ? ` · ${settings.aiModel}` : ""}
            </Typography>
          </Stack>
        )}

        {state.status === "error" ? (
          <Alert severity="error">{state.message}</Alert>
        ) : null}

        {state.status === "success" ? (
          <Box>
            <Typography
              component="div"
              variant="body2"
              sx={{
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {state.text}
            </Typography>
            <Typography
              variant="caption"
              sx={{color: "text.secondary", display: "block", mt: 1.5}}
            >
              Used {sourceSummary(state.sources)}. Generated in your browser
              with {providerLabel}.
            </Typography>
          </Box>
        ) : null}
      </Stack>
    </ContentBox>
  );
}
