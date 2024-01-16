export const RarityTable = () => {
  return (
    <div className="bg-base-200 rounded-xl sm:px-8 sm:py-4">
      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr className="text-xl">
              <th className="border-b border-primary"># of Buidls</th>
              <th className="border-b border-primary">Rarity</th>
              <th className="border-b border-primary">Color</th>
            </tr>
          </thead>
          <tbody className="text-xl">
            <tr>
              <td className="border-b border-primary">1 to 4</td>
              <td className="border-b border-primary">Uncommon</td>
              <td className="border-b border-primary">
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
