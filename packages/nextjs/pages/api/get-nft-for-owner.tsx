import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Base URL
    const url = `https://eth-sepolia.g.alchemy.com/nft/v3/${process.env.ALCHEMY_API_KEY}/getNFTsForOwner?owner=0x41f727fA294E50400aC27317832A9F78659476B9&contractAddresses[]=0x6a7415A8d287b343417150E7a74069D6D121372d&withMetadata=true&pageSize=100`;

    // Fetch data
    const response = await fetch(url);

    // Check if the response was successful
    if (!response.ok) {
      throw new Error(`API responded with status code ${response.status}`);
    }

    const data = await response.json();
    console.log("data", data.ownedNfts[0]);
    const nft = data.ownedNfts[0];

    res.status(200).json(nft);
  } catch (error) {
    // Log the error for server-side debugging
    console.error("Failed to fetch NFT data for owner:", error);

    // Send a generic error response to the client
    res.status(500).json({ error: "Failed to fetch NFT data for owner" });
  }
}
