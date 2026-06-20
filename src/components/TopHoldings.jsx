export default function TopHoldings({
  holdings
}) {

  const totalValue =
    holdings.reduce(
      (sum, item) =>
        sum +
        item.currentValue,
      0
    );

  const topHoldings =
    [...holdings]
      .sort(
        (a, b) =>
          b.currentValue -
          a.currentValue
      )
      .slice(0, 5);

  return (
    <div className="bg-slate-900 rounded-xl p-6">

      <h2 className="text-2xl font-bold mb-6">
        Top Holdings
      </h2>

      <div className="space-y-5">

        {topHoldings.map(
          (fund) => {

            const percent =
              totalValue > 0
                ? (
                    fund.currentValue /
                    totalValue
                  ) * 100
                : 0;

            return (

              <div
                key={
                  fund.schemeCode
                }
              >

                <div className="flex justify-between mb-2">

                  <div>

                    <p className="font-semibold">
                      {
                        fund.fundName
                      }
                    </p>

                    <p className="text-sm text-gray-400">
                      ₹
                      {fund.currentValue.toFixed(
                        0
                      )}
                    </p>

                  </div>

                  <p className="font-bold">
                    {percent.toFixed(
                      1
                    )}
                    %
                  </p>

                </div>

                <div className="w-full bg-slate-700 rounded-full h-3">

                  <div
                    className="bg-blue-500 h-3 rounded-full"
                    style={{
                      width:
                        `${percent}%`
                    }}
                  />

                </div>

              </div>

            );
          }
        )}

      </div>

    </div>
  );
}