export const RarityTable = () => {
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
                <div className="bg-green-600 text-green-600 rounded-lg">green</div>
              </td>
            </tr>
            <tr>
              <td className="border-b border-primary">5 to 9</td>
              <td className="border-b border-primary">Rare</td>
              <td className="border-b border-primary">
                <div className="bg-blue-600 text-blue-600 rounded-lg">blue</div>
              </td>
            </tr>
            <tr>
              <td className="border-b border-primary">10 to 14</td>
              <td className="border-b border-primary">Epic</td>
              <td className="border-b border-primary">
                <div className="bg-purple-600 text-purple-600 rounded-lg">purple</div>
              </td>
            </tr>
            <tr>
              <td>15 or more</td>
              <td>Legendary</td>
              <td>
                <div className="bg-orange-600 text-orange-600 rounded-lg">orange</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
