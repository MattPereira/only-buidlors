import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

const ensContractAddress = "0xD4416b13d2b3a9aBae7AcD5D6C2BbDBE25686401";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    console.log("hello");
    const { eoaAddress } = req.query;
    // Base URL
    const response = await axios.get(
      `https://eth-mainnet.g.alchemy.com/nft/v3/${process.env.ALCHEMY_API_KEY}/getNFTsForOwner`,
      {
        params: {
          owner: eoaAddress,
          "contractAddresses[]": ensContractAddress,
          withMetadata: true,
        },
      },
    );
    console.log("response", response);

    const data = response.data;
    let tokenUri;
    let ensName;
    if (data.ownedNfts.length > 0) {
      tokenUri = data.ownedNfts[0].tokenUri;
      const response2 = await axios.get(tokenUri);
      ensName = response2.data.name;
    }

    if (ensName) {
      res.status(200).json({ name: ensName });
    } else {
      res.status(200).json({ message: "No ENS name found for the provided EOA address." });
    }
  } catch (error) {
    // Log the error for server-side debugging
    console.error("Failed to fetch NFT data for owner:", error);

    // Send a generic error response to the client
    res.status(500).json({ error: "Failed to fetch NFT data for owner" });
  }
}
