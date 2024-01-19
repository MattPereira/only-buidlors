import { useScaffoldContractRead } from "~~/hooks/scaffold-eth/useScaffoldContractRead";

export const RarityTable = () => {
  const { data: uncommonColor } = useScaffoldContractRead({
    contractName: "OnlyBuidlorsNft",
    functionName: "getUncommonColor",
  });

  const { data: rareColor } = useScaffoldContractRead({
    contractName: "OnlyBuidlorsNft",
    functionName: "getRareColor",
  });

  const { data: epicColor } = useScaffoldContractRead({
    contractName: "OnlyBuidlorsNft",
    functionName: "getEpicColor",
  });

  const { data: legendaryColor } = useScaffoldContractRead({
    contractName: "OnlyBuidlorsNft",
    functionName: "getLegendaryColor",
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
                <div style={{ backgroundColor: uncommonColor }} className="text-green-600 rounded-lg">
                  green
                </div>
              </td>
            </tr>
            <tr>
              <td className="border-b border-primary">5 to 9</td>
              <td className="border-b border-primary">Rare</td>
              <td className="border-b border-primary">
                <div style={{ backgroundColor: rareColor }} className="text-blue-600 rounded-lg">
                  blue
                </div>
              </td>
            </tr>
            <tr>
              <td className="border-b border-primary">10 to 14</td>
              <td className="border-b border-primary">Epic</td>
              <td className="border-b border-primary">
                <div style={{ backgroundColor: epicColor }} className="text-purple-600 rounded-lg">
                  purple
                </div>
              </td>
            </tr>
            <tr>
              <td>15 or more</td>
              <td>Legendary</td>
              <td>
                <div style={{ backgroundColor: legendaryColor }} className="text-orange-600 rounded-lg">
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
