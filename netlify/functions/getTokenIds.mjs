const ALLOWED_NETWORKS = ["https://mainnet.movementnetwork.xyz/v1"];

export default async (req) => {
  // Only allow POST requests
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", {status: 405});
  }

  try {
    const body = await req.json();
    const {owner, network} = body;

    if (!owner || !network) {
      return new Response(JSON.stringify({error: "Missing owner or network"}), {
        status: 400,
      });
    }

    // Validate network
    if (!ALLOWED_NETWORKS.includes(network)) {
      return new Response(
        JSON.stringify({
          error: "Invalid network. Only mainnet is currently supported.",
        }),
        {status: 400},
      );
    }

    // First get token IDs from Sentio
    const API_KEY = Netlify.env.get("SENTIO_API_KEY");
    const url =
      "https://endpoint.sentio.xyz/sentio/movement-nft-drop/get-token-ids-n-object-id-by-owner";

    const tokenResponse = await fetch(url, {
      method: "POST",
      headers: {
        "api-key": API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({owner: owner}),
    });

    const tokenData = await tokenResponse.json();
    const tokens = tokenData.syncSqlResponse.result.rows || [];

    // Then fetch NFT info for each token
    const nftPromises = tokens.map(async (token) => {
      const response = await fetch(
        `${network}/accounts/${token.object}/resources`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch NFT info");
      }

      const data = await response.json();
      const tokenResource = data.find(
        (resource) => resource.type === "0x4::token::Token",
      );

      if (!tokenResource) {
        throw new Error("Token resource not found");
      }

      const metadata = tokenResource.data;
      return {
        tokenAddress: token.object,
        tokenData: {
          name: metadata.name || "",
          uri: metadata.uri || "",
          description: metadata.description || "",
          collection: metadata.collection?.inner || "",
        },
      };
    });

    const nfts = await Promise.all(nftPromises);

    return new Response(JSON.stringify(nfts), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({error: "Failed to fetch token IDs"}), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
};
