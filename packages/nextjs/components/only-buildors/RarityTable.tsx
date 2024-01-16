export const RarityTable = () => {
  return (
    <div className="bg-primary text-black rounded-xl sm:p-5">
      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr className="text-xl text-primary-content">
              <th># of Buidls</th>
              <th>Rarity</th>
              <th>Color</th>
            </tr>
          </thead>
          <tbody className="text-xl text-primary-content">
            <tr>
              <td>1 to 4</td>
              <td>Uncommon</td>
              <td className="bg-green-600"></td>
            </tr>
            <tr>
              <td>5 to 9</td>
              <td>Rare</td>
              <td className="bg-blue-600"></td>
            </tr>
            <tr>
              <td>10 to 14</td>
              <td>Epic</td>
              <td className="bg-purple-600"></td>
            </tr>
            <tr>
              <td>15 or more</td>
              <td>Legendary</td>
              <td className="bg-orange-600"></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
