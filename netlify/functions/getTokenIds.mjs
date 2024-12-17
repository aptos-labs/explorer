export default async (req) => {
  // Only allow POST requests
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", {status: 405});
  }

  const API_KEY = Netlify.env.get("SENTIO_API_KEY");
  const url =
    "https://endpoint.sentio.xyz/sentio/movement-nft-drop/get-token-ids-n-object-id-by-owner";

  try {
    const body = await req.json();
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "api-key": API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({owner: body.owner}),
    });

    const data = await response.json();

    return new Response(JSON.stringify(data), {
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
