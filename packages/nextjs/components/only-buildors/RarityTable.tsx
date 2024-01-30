import { useScaffoldContractRead } from "~~/hooks/scaffold-eth/useScaffoldContractRead";

/**
 * enum RarityTier {Uncommon, Rare, Epic, Legendary}
 *
 * 0 - Uncommon
 * 1 - Rare
 * 2 - Epic
 * 3 - Legendary
 */
export const RarityTable = () => {
  const { data: uncommonDetails } = useScaffoldContractRead({
    contractName: "OnlyBuidlorsNft",
    functionName: "getRarityDetails",
    args: [0],
  });

  const { data: rareDetails } = useScaffoldContractRead({
    contractName: "OnlyBuidlorsNft",
    functionName: "getRarityDetails",
    args: [1],
  });

  const { data: epicDetails } = useScaffoldContractRead({
    contractName: "OnlyBuidlorsNft",
    functionName: "getRarityDetails",
    args: [2],
  });

  const { data: legendaryDetails } = useScaffoldContractRead({
    contractName: "OnlyBuidlorsNft",
    functionName: "getRarityDetails",
    args: [3],
  });

  return (
    <div className="bg-primary rounded-xl sm:p-4 w-full max-w-[800px]">
      <div className="overflow-x-auto">
        <table className="table text-primary-content">
          <thead>
            <tr className="text-xl text-primary-content">
              <th>Build Count</th>
              <th>Rarity</th>
              <th>Color</th>
            </tr>
          </thead>
          <tbody className="text-xl">
            <tr>
              <td className="border-b border-primary pt-5">1 to 4</td>
              <td className="border-b border-primary pt-5">Uncommon</td>
              <td className="border-b border-primary pt-5">
                <div
                  style={{ backgroundColor: uncommonDetails ? uncommonDetails[1] : "gray" }}
                  className="text-green-600 rounded-lg"
                >
                  green
                </div>
              </td>
            </tr>
            <tr>
              <td className="border-b border-primary">5 to 9</td>
              <td className="border-b border-primary">Rare</td>
              <td className="border-b border-primary">
                <div
                  style={{ backgroundColor: rareDetails ? rareDetails[1] : "gray" }}
                  className="text-blue-600 rounded-lg"
                >
                  blue
                </div>
              </td>
            </tr>
            <tr>
              <td className="border-b border-primary">10 to 14</td>
              <td className="border-b border-primary">Epic</td>
              <td className="border-b border-primary">
                <div
                  style={{ backgroundColor: epicDetails ? epicDetails[1] : "gray" }}
                  className="text-purple-600 rounded-lg"
                >
                  purple
                </div>
              </td>
            </tr>
            <tr>
              <td>15 or more</td>
              <td>Legendary</td>
              <td>
                <div
                  style={{ backgroundColor: legendaryDetails ? legendaryDetails[1] : "gray" }}
                  className="text-orange-600 rounded-lg"
                >
                  orange
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
