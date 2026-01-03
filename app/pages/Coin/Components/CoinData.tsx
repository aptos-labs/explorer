export interface CoinData {
  type: string;
  data: {
    decimals: number;
    name: string;
    supply: {
      vec: [
        {
          aggregator: {
            vec: [
              {
                handle: string;
                key: string;
                limit: string;
              },
            ];
          };
          integer: {vec: [{limit: string; value: string}]};
        },
      ];
    };
    symbol: string;
  };
}
