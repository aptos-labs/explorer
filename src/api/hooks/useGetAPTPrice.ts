const COINGECKO_API_ENDPOINT = "https://api.coingecko.com/api/v3/simple/price";

export async function getAPTPrice(): Promise<number> {
  const query = {
    ids: "aptos", // CoinGecko ID for Aptos
    vs_currencies: "usd", // Target currency
  };

  const queryString = new URLSearchParams(query);
  const url = `${COINGECKO_API_ENDPOINT}?${queryString}`;

  try {
    const response = await fetch(url, {
      method: "GET",
    });

    // Ensure the response is successful
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    // Extract and return the USD price
    return Number(data.aptos.usd);
  } catch (error) {
    console.error("Error fetching APT price from CoinGecko:", error);
    return 0; // Default fallback price
  }
}
