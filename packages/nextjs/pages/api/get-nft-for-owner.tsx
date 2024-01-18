import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { eoaAddress, nftContract } = req.query;
    // Base URL
    const response = await axios.get(
      `https://arb-sepolia.g.alchemy.com/nft/v3/${process.env.ALCHEMY_API_KEY}/getNFTsForOwner`,
      {
        params: {
          owner: eoaAddress,
          "contractAddresses[]": nftContract,
          withMetadata: true,
          pageSize: 100,
        },
      },
    );

    const data = await response.data;
    const nft = data.ownedNfts[0];

    res.status(200).json(nft);
  } catch (error) {
    // Log the error for server-side debugging
    console.error("Failed to fetch NFT data for owner:", error);

    // Send a generic error response to the client
    res.status(500).json({ error: "Failed to fetch NFT data for owner" });
  }
}
