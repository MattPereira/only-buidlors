// pages/api/querySubgraph.ts
import type { NextApiRequest, NextApiResponse } from "next";

// Define a type for your expected response data structure
type ApiResponseData = {
  // Replace with the actual structure of the data you expect
  transfers: Array<{
    id: string;
    from: string;
    to: string;
    tokenId: string;
    blockNumber: number;
    blockTimestamp: string;
    transactionHash: string;
  }>;
};

// Function to construct the GraphQL query
const buildGraphQLQuery = () => {
  return `
    query {
        minteds(first:100) {
          id
          mintee
          tokenId
          tokenUri
          blockNumber
        }
      }
  `;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponseData | { message: string }>,
) {
  const graphqlEndpoint = "https://subgraph.satsuma-prod.com/a4f5cc0f86e9/matts-team--3503850/only-buidlors-nft/api";

  const graphqlQuery = {
    query: buildGraphQLQuery(),
  };

  try {
    const response = await fetch(graphqlEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(graphqlQuery),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ApiResponseData = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
}
