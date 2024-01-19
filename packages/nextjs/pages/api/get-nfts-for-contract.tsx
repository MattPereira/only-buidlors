import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { contractAddress } = req.query;

    // Check if contractAddress is provided
    if (!contractAddress) {
      return res.status(400).json({ error: "Contract address is required" });
    }

    // Fetch data using axios
    const response = await axios.get(
      `https://arb-sepolia.g.alchemy.com/nft/v3/${process.env.ALCHEMY_API_KEY}/getNFTsForContract`,
      {
        params: {
          contractAddress,
          withMetadata: true,
        },
      },
    );

    console.log("response", response.data);

    // Extract data from response
    const nftsArray = response.data.nfts;

    res.status(200).json(nftsArray);
  } catch (error) {
    console.error("Failed to fetch NFT data for contract", error);

    // Send a response with the error message
    res.status(500).json({ error: "Failed to fetch NFT data for contract" });
  }
}
