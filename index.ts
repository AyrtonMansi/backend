const { ApolloServer } = require("apollo-server");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
// 1
const typeDefs = `
type Query {
  stocks(filter: String, skip: Int, take: Int,orderBy: StocksOrderBy): Stock!
  price: [Price!]!
  chart_timeframe: Chart_TimeFrame
  tech_timeframe: Tech_TimeFrame
}

type Stock {
  stocks: [Stocks!]!
  count: Int!
}

type Stocks {
  id:Int
  symbol:String
  companyName:String
  day_change:String
  wk_change:String
  market_cap:Int
  day_vol:Int
  supply:Int
  previous_close:String
  day_range:String
  revenue:Float
  EPS:Float
  yr_range:String
  PE_ratio:Float
  ave_volume:Float
  dividend:String
  prices:[Price]
}

type Price {
  open: String
  close: String
  high: String
  low: String
  volume: String
}

input StocksOrderBy {
  PE_ratio: Sort
  dividend: Sort
  companyName: Sort
  symbol: Sort
  day_change: Sort
}

enum Sort {
  asc
  desc
}

enum Chart_TimeFrame{
Day
Wekk
Month
Year
FiveYrs
MAX
}

enum Tech_TimeFrame{
hourly
daily
weekly
monthly
}
`;

// 2
const resolvers = {
  Query: {
    stocks: async (parent: any, args: any, context: any) => {
      const where = args.filter
        ? {
            OR: [
              { companyName: { contains: args.filter, mode: "insensitive" } },
              { symbol: { contains: args.filter, mode: "insensitive" } },
            ],
          }
        : {};
      return {
        stocks: context.prisma.stocks.findMany({
          where,
          skip: args.skip,
          take: args.take,
          orderBy: args.orderBy,
          include: { prices: true },
        }),
        count: context.prisma.stocks.count({ where }),
      };
    },
    // price: async (parent, args, context) => {
    //   console.log("-------> ", parent);

    //   return context.prisma.price.findMany({where: {stocksId: parent.id}})
    // }
  },
};

// 3
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: {
    prisma,
  },
  introspection: true,
  playground: true,
});

server
  .listen(process.env.PORT)
  .then(({ url }: { url: string }) =>
    console.log(`Server is running on ${url}`)
  );

// import { PrismaClient } from '@prisma/client'

// const prisma = new PrismaClient()

// const main = async () => {
//     try {
//         // const data = [
//         //     {
//         //       "symbol": "ATVI",
//         //       "companyName": "Activision Blizzard Inc",
//         //       "prices": {
//         //         "create": [
//         //           {
//         //             "open": "497.08",
//         //             "close": "535.23",
//         //             "high": "383.50",
//         //             "low": "609.99",
//         //             "volume": "821359"
//         //           },
//         //           {
//         //             "open": "729.05",
//         //             "close": "388.35",
//         //             "high": "608.73",
//         //             "low": "930.90",
//         //             "volume": "472566"
//         //           }
//         //         ]
//         //       },
//         //       "day_change": "14.57",
//         //       "wk_change": "10.69",
//         //       "market_cap": 3467978,
//         //       "day_vol": 598746,
//         //       "supply": 46942671839,
//         //       "previous_close": "90.10",
//         //       "day_range": "80.16-842.66",
//         //       "revenue": 536052.02,
//         //       "EPS": 33715.67,
//         //       "yr_range": "435.52-744.23",
//         //       "PE_ratio": 23.1,
//         //       "ave_volume": 665638,
//         //       "dividend": "1.75"
//         //     },
//         //     {
//         //       "symbol": "AMD",
//         //       "companyName": "Advanced Micro Devices Inc",
//         //       "prices": {
//         //         "create": [
//         //           {
//         //             "open": "765.58",
//         //             "close": "457.94",
//         //             "high": "30.75",
//         //             "low": "255.08",
//         //             "volume": "387034"
//         //           },
//         //           {
//         //             "open": "315.56",
//         //             "close": "560.83",
//         //             "high": "20.19",
//         //             "low": "707.75",
//         //             "volume": "334899"
//         //           }
//         //         ]
//         //       },
//         //       "day_change": "11.89",
//         //       "wk_change": "45.07",
//         //       "market_cap": 4000197,
//         //       "day_vol": 392524,
//         //       "supply": 74027237278,
//         //       "previous_close": "859.87",
//         //       "day_range": "881.33-220.00",
//         //       "revenue": 587414.30,
//         //       "EPS": 54555.20,
//         //       "yr_range": "842.57-444.50",
//         //       "PE_ratio": 52.1,
//         //       "ave_volume": 173882,
//         //       "dividend": "21.67"
//         //     },
//         //     {
//         //       "symbol": "ADBE",
//         //       "companyName": "Adobe Inc.",
//         //       "prices": {
//         //         "create": [
//         //           {
//         //             "open": "935.83",
//         //             "close": "428.44",
//         //             "high": "231.06",
//         //             "low": "684.39",
//         //             "volume": "209359"
//         //           },
//         //           {
//         //             "open": "58.05",
//         //             "close": "960.63",
//         //             "high": "536.30",
//         //             "low": "37.80",
//         //             "volume": "64773"
//         //           }
//         //         ]
//         //       },
//         //       "day_change": "12.15",
//         //       "wk_change": "13.51",
//         //       "market_cap": 8272478,
//         //       "day_vol": 237468,
//         //       "supply": 35660108378,
//         //       "previous_close": "190.50",
//         //       "day_range": "421.41-243.35",
//         //       "revenue": 923539.84,
//         //       "EPS": 18932.79,
//         //       "yr_range": "929.63-812.53",
//         //       "PE_ratio": 18.6,
//         //       "ave_volume": 8456,
//         //       "dividend": "22.19"
//         //     },
//         //     {
//         //       "symbol": "ALGN",
//         //       "companyName": "Align Technology Inc",
//         //       "prices": {
//         //         "create": [
//         //           {
//         //             "open": "777.57",
//         //             "close": "265.95",
//         //             "high": "571.97",
//         //             "low": "248.45",
//         //             "volume": "963480"
//         //           },
//         //           {
//         //             "open": "38.62",
//         //             "close": "649.13",
//         //             "high": "452.17",
//         //             "low": "665.95",
//         //             "volume": "850430"
//         //           }
//         //         ]
//         //       },
//         //       "day_change": "9.44",
//         //       "wk_change": "42.84",
//         //       "market_cap": 5753290,
//         //       "day_vol": 272784,
//         //       "supply": 85813809056,
//         //       "previous_close": "554.27",
//         //       "day_range": "257.74-4.53",
//         //       "revenue": 434113.52,
//         //       "EPS": 40554.87,
//         //       "yr_range": "686.57-776.02",
//         //       "PE_ratio": 9.2,
//         //       "ave_volume": 8532,
//         //       "dividend": "10.22"
//         //     },
//         //     {
//         //       "symbol": "ALXN",
//         //       "companyName": "Alexion Pharmaceuticals Inc",
//         //       "prices": {
//         //         "create": [
//         //           {
//         //             "open": "217.51",
//         //             "close": "238.92",
//         //             "high": "996.56",
//         //             "low": "599.34",
//         //             "volume": "490292"
//         //           },
//         //           {
//         //             "open": "330.26",
//         //             "close": "238.72",
//         //             "high": "428.69",
//         //             "low": "442.83",
//         //             "volume": "120128"
//         //           }
//         //         ]
//         //       },
//         //       "day_change": "7.35",
//         //       "wk_change": "44.83",
//         //       "market_cap": 6508761,
//         //       "day_vol": 687597,
//         //       "supply": 50844139824,
//         //       "previous_close": "883.90",
//         //       "day_range": "699.49-803.75",
//         //       "revenue": 801235.04,
//         //       "EPS": 10813.71,
//         //       "yr_range": "343.98-242.57",
//         //       "PE_ratio": 67.9,
//         //       "ave_volume": 480908,
//         //       "dividend": "48.24"
//         //     },
//         //     {
//         //       "symbol": "AMZN",
//         //       "companyName": "Amazon.com Inc",
//         //       "prices": {
//         //         "create": [
//         //           {
//         //             "open": "87.33",
//         //             "close": "147.98",
//         //             "high": "909.05",
//         //             "low": "19.28",
//         //             "volume": "723249"
//         //           },
//         //           {
//         //             "open": "724.66",
//         //             "close": "750.54",
//         //             "high": "725.44",
//         //             "low": "698.62",
//         //             "volume": "836061"
//         //           }
//         //         ]
//         //       },
//         //       "day_change": "14.57",
//         //       "wk_change": "0.52",
//         //       "market_cap": 2903656,
//         //       "day_vol": 907665,
//         //       "supply": 95363799769,
//         //       "previous_close": "256.80",
//         //       "day_range": "959.54-72.76",
//         //       "revenue": 686665.33,
//         //       "EPS": 39053.28,
//         //       "yr_range": "589.37-951.62",
//         //       "PE_ratio": 40.9,
//         //       "ave_volume": 39943,
//         //       "dividend": "32.39"
//         //     },
//         //     {
//         //       "symbol": "AMGN",
//         //       "companyName": "Amgen Inc",
//         //       "prices": {
//         //         "create": [
//         //           {
//         //             "open": "23.81",
//         //             "close": "214.72",
//         //             "high": "728.85",
//         //             "low": "925.09",
//         //             "volume": "849411"
//         //           },
//         //           {
//         //             "open": "935.25",
//         //             "close": "306.72",
//         //             "high": "822.27",
//         //             "low": "701.63",
//         //             "volume": "287625"
//         //           }
//         //         ]
//         //       },
//         //       "day_change": "7.05",
//         //       "wk_change": "3.99",
//         //       "market_cap": 2194888,
//         //       "day_vol": 311442,
//         //       "supply": 20098319881,
//         //       "previous_close": "190.25",
//         //       "day_range": "438.87-568.64",
//         //       "revenue": 972623.24,
//         //       "EPS": 65864.42,
//         //       "yr_range": "61.42-691.82",
//         //       "PE_ratio": 32.2,
//         //       "ave_volume": 500863,
//         //       "dividend": "17.43"
//         //     },
//         //     {
//         //       "symbol": "AEP",
//         //       "companyName": "American Electric Power Company Inc",
//         //       "prices": {
//         //         "create": [
//         //           {
//         //             "open": "144.73",
//         //             "close": "948.49",
//         //             "high": "741.82",
//         //             "low": "193.85",
//         //             "volume": "697327"
//         //           },
//         //           {
//         //             "open": "491.97",
//         //             "close": "683.23",
//         //             "high": "506.73",
//         //             "low": "797.09",
//         //             "volume": "939682"
//         //           }
//         //         ]
//         //       },
//         //       "day_change": "18.13",
//         //       "wk_change": "13.91",
//         //       "market_cap": 9430318,
//         //       "day_vol": 844536,
//         //       "supply": 82795536270,
//         //       "previous_close": "970.13",
//         //       "day_range": "326.93-495.16",
//         //       "revenue": 457157.41,
//         //       "EPS": 68820.95,
//         //       "yr_range": "184.51-81.15",
//         //       "PE_ratio": 46.6,
//         //       "ave_volume": 980671,
//         //       "dividend": "29.33"
//         //     },
//         //     {
//         //       "symbol": "ADI",
//         //       "companyName": "Analog Devices Inc",
//         //       "prices": {
//         //         "create": [
//         //           {
//         //             "open": "613.32",
//         //             "close": "985.40",
//         //             "high": "463.04",
//         //             "low": "523.23",
//         //             "volume": "727626"
//         //           },
//         //           {
//         //             "open": "534.64",
//         //             "close": "585.71",
//         //             "high": "879.17",
//         //             "low": "686.50",
//         //             "volume": "381685"
//         //           }
//         //         ]
//         //       },
//         //       "day_change": "13.95",
//         //       "wk_change": "49.70",
//         //       "market_cap": 1590667,
//         //       "day_vol": 881045,
//         //       "supply": 44011589588,
//         //       "previous_close": "620.84",
//         //       "day_range": "392.79-538.94",
//         //       "revenue": 309701.76,
//         //       "EPS": 6177.66,
//         //       "yr_range": "954.25-941.44",
//         //       "PE_ratio": 52.6,
//         //       "ave_volume": 203539,
//         //       "dividend": "44.95"
//         //     },
//         //     {
//         //       "symbol": "ANSS",
//         //       "companyName": "ANSYS Inc",
//         //       "prices": {
//         //         "create": [
//         //           {
//         //             "open": "834.17",
//         //             "close": "375.22",
//         //             "high": "569.40",
//         //             "low": "96.79",
//         //             "volume": "611510"
//         //           },
//         //           {
//         //             "open": "967.54",
//         //             "close": "41.13",
//         //             "high": "991.93",
//         //             "low": "237.82",
//         //             "volume": "20744"
//         //           }
//         //         ]
//         //       },
//         //       "day_change": "19.31",
//         //       "wk_change": "20.93",
//         //       "market_cap": 1713057,
//         //       "day_vol": 444852,
//         //       "supply": 84916705049,
//         //       "previous_close": "759.30",
//         //       "day_range": "830.75-683.22",
//         //       "revenue": 24190.60,
//         //       "EPS": 50771.45,
//         //       "yr_range": "949.56-902.10",
//         //       "PE_ratio": 70.3,
//         //       "ave_volume": 942088,
//         //       "dividend": "8.58"
//         //     },
//         //     {
//         //       "symbol": "AAPL",
//         //       "companyName": "Apple Inc",
//         //       "prices": {
//         //         "create": [
//         //           {
//         //             "open": "126.03",
//         //             "close": "896.57",
//         //             "high": "688.30",
//         //             "low": "931.52",
//         //             "volume": "174398"
//         //           },
//         //           {
//         //             "open": "19.37",
//         //             "close": "696.09",
//         //             "high": "604.21",
//         //             "low": "755.98",
//         //             "volume": "242631"
//         //           }
//         //         ]
//         //       },
//         //       "day_change": "14.33",
//         //       "wk_change": "25.06",
//         //       "market_cap": 4927569,
//         //       "day_vol": 206953,
//         //       "supply": 8459834730,
//         //       "previous_close": "638.54",
//         //       "day_range": "800.40-746.10",
//         //       "revenue": 4132.68,
//         //       "EPS": 42822.07,
//         //       "yr_range": "981.49-972.25",
//         //       "PE_ratio": 96.7,
//         //       "ave_volume": 901783,
//         //       "dividend": "26.41"
//         //     },
//         //     {
//         //       "symbol": "AMAT",
//         //       "companyName": "Applied Materials Inc",
//         //       "prices": {
//         //         "create": [
//         //           {
//         //             "open": "128.12",
//         //             "close": "173.83",
//         //             "high": "758.12",
//         //             "low": "899.20",
//         //             "volume": "266117"
//         //           },
//         //           {
//         //             "open": "857.60",
//         //             "close": "92.87",
//         //             "high": "475.69",
//         //             "low": "230.14",
//         //             "volume": "523543"
//         //           }
//         //         ]
//         //       },
//         //       "day_change": "6.84",
//         //       "wk_change": "27.20",
//         //       "market_cap": 9441139,
//         //       "day_vol": 420885,
//         //       "supply": 87518328149,
//         //       "previous_close": "838.93",
//         //       "day_range": "954.40-709.23",
//         //       "revenue": 312337.17,
//         //       "EPS": 37111.16,
//         //       "yr_range": "762.23-116.00",
//         //       "PE_ratio": 34.0,
//         //       "ave_volume": 71275,
//         //       "dividend": "48.60"
//         //     },
//         //     {
//         //       "symbol": "ASML",
//         //       "companyName": "ASML Holding NV",
//         //       "prices": {
//         //         "create": [
//         //           {
//         //             "open": "588.64",
//         //             "close": "704.08",
//         //             "high": "27.88",
//         //             "low": "83.52",
//         //             "volume": "536495"
//         //           },
//         //           {
//         //             "open": "673.66",
//         //             "close": "319.97",
//         //             "high": "887.95",
//         //             "low": "87.54",
//         //             "volume": "224102"
//         //           }
//         //         ]
//         //       },
//         //       "day_change": "5.74",
//         //       "wk_change": "24.14",
//         //       "market_cap": 4247990,
//         //       "day_vol": 952646,
//         //       "supply": 93587940223,
//         //       "previous_close": "479.49",
//         //       "day_range": "840.50-114.99",
//         //       "revenue": 439424.91,
//         //       "EPS": 58180.66,
//         //       "yr_range": "289.82-57.40",
//         //       "PE_ratio": 37.4,
//         //       "ave_volume": 588251,
//         //       "dividend": "45.41"
//         //     },
//         //     {
//         //       "symbol": "TEAM",
//         //       "companyName": "Atlassian Corporation PLC",
//         //       "prices": {
//         //         "create": [
//         //           {
//         //             "open": "167.82",
//         //             "close": "579.89",
//         //             "high": "831.30",
//         //             "low": "936.67",
//         //             "volume": "394945"
//         //           },
//         //           {
//         //             "open": "210.99",
//         //             "close": "357.91",
//         //             "high": "883.52",
//         //             "low": "902.53",
//         //             "volume": "59328"
//         //           }
//         //         ]
//         //       },
//         //       "day_change": "17.74",
//         //       "wk_change": "28.61",
//         //       "market_cap": 5609573,
//         //       "day_vol": 145040,
//         //       "supply": 28495060014,
//         //       "previous_close": "71.86",
//         //       "day_range": "179.89-555.04",
//         //       "revenue": 625929.95,
//         //       "EPS": 47664.91,
//         //       "yr_range": "177.88-470.97",
//         //       "PE_ratio": 88.2,
//         //       "ave_volume": 357004,
//         //       "dividend": "1.15"
//         //     },
//         //     {
//         //       "symbol": "ADSK",
//         //       "companyName": "Autodesk Inc",
//         //       "prices": {
//         //         "create": [
//         //           {
//         //             "open": "928.93",
//         //             "close": "716.78",
//         //             "high": "641.74",
//         //             "low": "52.54",
//         //             "volume": "93104"
//         //           },
//         //           {
//         //             "open": "811.43",
//         //             "close": "148.96",
//         //             "high": "669.98",
//         //             "low": "833.74",
//         //             "volume": "362997"
//         //           }
//         //         ]
//         //       },
//         //       "day_change": "7.82",
//         //       "wk_change": "7.05",
//         //       "market_cap": 4942798,
//         //       "day_vol": 633495,
//         //       "supply": 50822560431,
//         //       "previous_close": "559.69",
//         //       "day_range": "24.83-244.32",
//         //       "revenue": 597836.21,
//         //       "EPS": 85036.01,
//         //       "yr_range": "665.86-128.44",
//         //       "PE_ratio": 63.9,
//         //       "ave_volume": 384756,
//         //       "dividend": "45.52"
//         //     },
//         //     {
//         //       "symbol": "ADP",
//         //       "companyName": "Automatic Data Processing Inc",
//         //       "prices": {
//         //         "create": [
//         //           {
//         //             "open": "526.61",
//         //             "close": "884.50",
//         //             "high": "54.83",
//         //             "low": "20.21",
//         //             "volume": "445819"
//         //           },
//         //           {
//         //             "open": "842.73",
//         //             "close": "162.51",
//         //             "high": "567.70",
//         //             "low": "721.73",
//         //             "volume": "592374"
//         //           }
//         //         ]
//         //       },
//         //       "day_change": "18.41",
//         //       "wk_change": "31.88",
//         //       "market_cap": 1125172,
//         //       "day_vol": 651921,
//         //       "supply": 38460217061,
//         //       "previous_close": "528.72",
//         //       "day_range": "758.71-870.84",
//         //       "revenue": 868418.19,
//         //       "EPS": 72879.42,
//         //       "yr_range": "470.82-494.48",
//         //       "PE_ratio": 58.9,
//         //       "ave_volume": 398574,
//         //       "dividend": "24.29"
//         //     },
//         //     {
//         //       "symbol": "AVGO",
//         //       "companyName": "Broadcom Inc",
//         //       "prices": {
//         //         "create": [
//         //           {
//         //             "open": "155.29",
//         //             "close": "839.34",
//         //             "high": "945.19",
//         //             "low": "780.69",
//         //             "volume": "388664"
//         //           },
//         //           {
//         //             "open": "82.44",
//         //             "close": "579.76",
//         //             "high": "297.26",
//         //             "low": "419.28",
//         //             "volume": "558663"
//         //           }
//         //         ]
//         //       },
//         //       "day_change": "12.45",
//         //       "wk_change": "35.70",
//         //       "market_cap": 2766408,
//         //       "day_vol": 317745,
//         //       "supply": 29924253892,
//         //       "previous_close": "215.45",
//         //       "day_range": "350.92-836.19",
//         //       "revenue": 307751.39,
//         //       "EPS": 34594.20,
//         //       "yr_range": "153.07-938.01",
//         //       "PE_ratio": 79.9,
//         //       "ave_volume": 841468,
//         //       "dividend": "4.59"
//         //     },
//         //     {
//         //       "symbol": "BIDU",
//         //       "companyName": "Baidu Inc",
//         //       "prices": {
//         //         "create": [
//         //           {
//         //             "open": "704.54",
//         //             "close": "831.52",
//         //             "high": "204.23",
//         //             "low": "104.29",
//         //             "volume": "193511"
//         //           },
//         //           {
//         //             "open": "349.31",
//         //             "close": "200.10",
//         //             "high": "886.51",
//         //             "low": "990.17",
//         //             "volume": "321495"
//         //           }
//         //         ]
//         //       },
//         //       "day_change": "12.58",
//         //       "wk_change": "8.49",
//         //       "market_cap": 2269344,
//         //       "day_vol": 100705,
//         //       "supply": 54078312669,
//         //       "previous_close": "270.18",
//         //       "day_range": "946.07-552.49",
//         //       "revenue": 213193.57,
//         //       "EPS": 47384.39,
//         //       "yr_range": "326.39-792.73",
//         //       "PE_ratio": 84.0,
//         //       "ave_volume": 623741,
//         //       "dividend": "21.30"
//         //     },
//         //     {
//         //       "symbol": "BIIB",
//         //       "companyName": "Biogen Inc",
//         //       "prices": {
//         //         "create": [
//         //           {
//         //             "open": "367.01",
//         //             "close": "427.53",
//         //             "high": "189.74",
//         //             "low": "360.71",
//         //             "volume": "152000"
//         //           },
//         //           {
//         //             "open": "440.54",
//         //             "close": "749.45",
//         //             "high": "799.98",
//         //             "low": "759.20",
//         //             "volume": "817391"
//         //           }
//         //         ]
//         //       },
//         //       "day_change": "4.59",
//         //       "wk_change": "41.63",
//         //       "market_cap": 3392627,
//         //       "day_vol": 722862,
//         //       "supply": 34829255519,
//         //       "previous_close": "276.45",
//         //       "day_range": "667.68-357.48",
//         //       "revenue": 345591.50,
//         //       "EPS": 52357.12,
//         //       "yr_range": "820.53-481.79",
//         //       "PE_ratio": 33.3,
//         //       "ave_volume": 726692,
//         //       "dividend": "5.60"
//         //     },
//         //     {
//         //       "symbol": "BMRN",
//         //       "companyName": "Biomarin Pharmaceutical Inc",
//         //       "prices": {
//         //         "create": [
//         //           {
//         //             "open": "737.91",
//         //             "close": "64.02",
//         //             "high": "394.83",
//         //             "low": "819.17",
//         //             "volume": "928954"
//         //           },
//         //           {
//         //             "open": "429.60",
//         //             "close": "18.23",
//         //             "high": "825.63",
//         //             "low": "81.12",
//         //             "volume": "509720"
//         //           }
//         //         ]
//         //       },
//         //       "day_change": "3.96",
//         //       "wk_change": "28.25",
//         //       "market_cap": 8401632,
//         //       "day_vol": 854491,
//         //       "supply": 22445073205,
//         //       "previous_close": "582.74",
//         //       "day_range": "73.95-826.50",
//         //       "revenue": 252787.89,
//         //       "EPS": 80016.58,
//         //       "yr_range": "375.71-77.27",
//         //       "PE_ratio": 66.0,
//         //       "ave_volume": 934219,
//         //       "dividend": "41.16"
//         //     },
//         //     {
//         //       "symbol": "BKNG",
//         //       "companyName": "Booking Holdings Inc",
//         //       "prices": {
//         //         "create": [
//         //           {
//         //             "open": "722.38",
//         //             "close": "177.53",
//         //             "high": "609.22",
//         //             "low": "184.74",
//         //             "volume": "410323"
//         //           },
//         //           {
//         //             "open": "185.87",
//         //             "close": "689.48",
//         //             "high": "7.75",
//         //             "low": "706.04",
//         //             "volume": "929358"
//         //           }
//         //         ]
//         //       },
//         //       "day_change": "3.10",
//         //       "wk_change": "36.96",
//         //       "market_cap": 2119089,
//         //       "day_vol": 164818,
//         //       "supply": 72678609472,
//         //       "previous_close": "319.29",
//         //       "day_range": "559.00-628.86",
//         //       "revenue": 534472.19,
//         //       "EPS": 56082.28,
//         //       "yr_range": "920.24-37.64",
//         //       "PE_ratio": 39.4,
//         //       "ave_volume": 584284,
//         //       "dividend": "3.19"
//         //     },
//         //     {
//         //       "symbol": "CDNS",
//         //       "companyName": "Cadence Design Systems Inc",
//         //       "prices": {
//         //         "create": [
//         //           {
//         //             "open": "285.70",
//         //             "close": "284.18",
//         //             "high": "85.44",
//         //             "low": "21.23",
//         //             "volume": "282282"
//         //           },
//         //           {
//         //             "open": "683.92",
//         //             "close": "984.81",
//         //             "high": "943.20",
//         //             "low": "333.53",
//         //             "volume": "332209"
//         //           }
//         //         ]
//         //       },
//         //       "day_change": "14.28",
//         //       "wk_change": "16.35",
//         //       "market_cap": 367614,
//         //       "day_vol": 569395,
//         //       "supply": 2418680424,
//         //       "previous_close": "335.91",
//         //       "day_range": "739.33-755.63",
//         //       "revenue": 17442.52,
//         //       "EPS": 71782.08,
//         //       "yr_range": "494.33-814.52",
//         //       "PE_ratio": 23.9,
//         //       "ave_volume": 427330,
//         //       "dividend": "43.62"
//         //     },
//         //     {
//         //       "symbol": "CDW",
//         //       "companyName": "CDW Corp",
//         //       "prices": {
//         //         "create": [
//         //           {
//         //             "open": "478.94",
//         //             "close": "869.66",
//         //             "high": "491.88",
//         //             "low": "876.40",
//         //             "volume": "547833"
//         //           },
//         //           {
//         //             "open": "3.55",
//         //             "close": "381.12",
//         //             "high": "529.17",
//         //             "low": "84.85",
//         //             "volume": "784302"
//         //           }
//         //         ]
//         //       },
//         //       "day_change": "15.40",
//         //       "wk_change": "1.07",
//         //       "market_cap": 4132433,
//         //       "day_vol": 390715,
//         //       "supply": 40121095417,
//         //       "previous_close": "82.74",
//         //       "day_range": "878.42-952.28",
//         //       "revenue": 637787.66,
//         //       "EPS": 44097.83,
//         //       "yr_range": "432.55-786.91",
//         //       "PE_ratio": 19.7,
//         //       "ave_volume": 829315,
//         //       "dividend": "15.00"
//         //     },
//         //     {
//         //       "symbol": "CERN",
//         //       "companyName": "Cerner Corp",
//         //       "prices": {
//         //         "create": [
//         //           {
//         //             "open": "211.66",
//         //             "close": "890.24",
//         //             "high": "70.30",
//         //             "low": "820.64",
//         //             "volume": "671846"
//         //           },
//         //           {
//         //             "open": "912.49",
//         //             "close": "958.62",
//         //             "high": "446.96",
//         //             "low": "61.24",
//         //             "volume": "26838"
//         //           }
//         //         ]
//         //       },
//         //       "day_change": "6.87",
//         //       "wk_change": "33.63",
//         //       "market_cap": 7912618,
//         //       "day_vol": 549871,
//         //       "supply": 29259336586,
//         //       "previous_close": "825.95",
//         //       "day_range": "231.08-758.15",
//         //       "revenue": 363885.60,
//         //       "EPS": 95418.11,
//         //       "yr_range": "259.41-742.33",
//         //       "PE_ratio": 74.5,
//         //       "ave_volume": 793554,
//         //       "dividend": "26.65"
//         //     },
//         //     {
//         //       "symbol": "CHKP",
//         //       "companyName": "Check Point Software Technologies Ltd",
//         //       "prices": {
//         //         "create": [
//         //           {
//         //             "open": "81.92",
//         //             "close": "246.50",
//         //             "high": "432.06",
//         //             "low": "556.01",
//         //             "volume": "439358"
//         //           },
//         //           {
//         //             "open": "198.22",
//         //             "close": "63.64",
//         //             "high": "71.89",
//         //             "low": "250.33",
//         //             "volume": "890348"
//         //           }
//         //         ]
//         //       },
//         //       "day_change": "15.29",
//         //       "wk_change": "4.72",
//         //       "market_cap": 3298704,
//         //       "day_vol": 63396,
//         //       "supply": 14697639733,
//         //       "previous_close": "208.11",
//         //       "day_range": "613.56-214.62",
//         //       "revenue": 413996.07,
//         //       "EPS": 43639.58,
//         //       "yr_range": "829.35-250.20",
//         //       "PE_ratio": 77.2,
//         //       "ave_volume": 533867,
//         //       "dividend": "28.59"
//         //     },
//         //     {
//         //       "symbol": "CHTR",
//         //       "companyName": "Charter Communications Inc",
//         //       "prices": {
//         //         "create": [
//         //           {
//         //             "open": "893.78",
//         //             "close": "467.05",
//         //             "high": "724.52",
//         //             "low": "218.47",
//         //             "volume": "861695"
//         //           },
//         //           {
//         //             "open": "560.59",
//         //             "close": "223.90",
//         //             "high": "690.16",
//         //             "low": "878.40",
//         //             "volume": "84108"
//         //           }
//         //         ]
//         //       },
//         //       "day_change": "11.74",
//         //       "wk_change": "44.19",
//         //       "market_cap": 7008688,
//         //       "day_vol": 131663,
//         //       "supply": 59424167185,
//         //       "previous_close": "966.86",
//         //       "day_range": "419.35-485.43",
//         //       "revenue": 982551.21,
//         //       "EPS": 64515.85,
//         //       "yr_range": "293.50-670.62",
//         //       "PE_ratio": 69.0,
//         //       "ave_volume": 385300,
//         //       "dividend": "41.62"
//         //     },
//         //     {
//         //       "symbol": "CPRT",
//         //       "companyName": "Copart Inc",
//         //       "prices": {
//         //         "create": [
//         //           {
//         //             "open": "959.28",
//         //             "close": "630.99",
//         //             "high": "457.73",
//         //             "low": "422.85",
//         //             "volume": "483090"
//         //           },
//         //           {
//         //             "open": "321.64",
//         //             "close": "63.57",
//         //             "high": "40.76",
//         //             "low": "792.65",
//         //             "volume": "295461"
//         //           }
//         //         ]
//         //       },
//         //       "day_change": "18.44",
//         //       "wk_change": "20.19",
//         //       "market_cap": 3583360,
//         //       "day_vol": 666885,
//         //       "supply": 6139659821,
//         //       "previous_close": "598.04",
//         //       "day_range": "858.68-520.53",
//         //       "revenue": 699179.52,
//         //       "EPS": 34752.95,
//         //       "yr_range": "149.32-882.04",
//         //       "PE_ratio": 53.2,
//         //       "ave_volume": 713116,
//         //       "dividend": "35.79"
//         //     },
//         //     {
//         //       "symbol": "CTAS",
//         //       "companyName": "Cintas Corp",
//         //       "prices": {
//         //         "create": [
//         //           {
//         //             "open": "569.09",
//         //             "close": "217.66",
//         //             "high": "750.75",
//         //             "low": "305.94",
//         //             "volume": "522220"
//         //           },
//         //           {
//         //             "open": "556.67",
//         //             "close": "449.80",
//         //             "high": "137.80",
//         //             "low": "171.58",
//         //             "volume": "309037"
//         //           }
//         //         ]
//         //       },
//         //       "day_change": "10.00",
//         //       "wk_change": "0.11",
//         //       "market_cap": 8681540,
//         //       "day_vol": 210879,
//         //       "supply": 43325311186,
//         //       "previous_close": "571.12",
//         //       "day_range": "849.34-853.29",
//         //       "revenue": 920466.05,
//         //       "EPS": 61184.49,
//         //       "yr_range": "734.36-341.33",
//         //       "PE_ratio": 76.0,
//         //       "ave_volume": 164077,
//         //       "dividend": "17.25"
//         //     },
//         //     {
//         //       "symbol": "CSCO",
//         //       "companyName": "Cisco Systems Inc",
//         //       "prices": {
//         //         "create": [
//         //           {
//         //             "open": "510.38",
//         //             "close": "386.53",
//         //             "high": "185.45",
//         //             "low": "952.52",
//         //             "volume": "172213"
//         //           },
//         //           {
//         //             "open": "390.51",
//         //             "close": "389.98",
//         //             "high": "169.26",
//         //             "low": "620.16",
//         //             "volume": "95834"
//         //           }
//         //         ]
//         //       },
//         //       "day_change": "7.01",
//         //       "wk_change": "17.90",
//         //       "market_cap": 4437533,
//         //       "day_vol": 938514,
//         //       "supply": 56720043017,
//         //       "previous_close": "548.37",
//         //       "day_range": "990.61-885.57",
//         //       "revenue": 362743.53,
//         //       "EPS": 50945.37,
//         //       "yr_range": "988.14-751.42",
//         //       "PE_ratio": 2.6,
//         //       "ave_volume": 655076,
//         //       "dividend": "23.26"
//         //     },
//         //     {
//         //       "symbol": "CMCSA",
//         //       "companyName": "Comcast Corp",
//         //       "prices": {
//         //         "create": [
//         //           {
//         //             "open": "698.63",
//         //             "close": "63.21",
//         //             "high": "338.00",
//         //             "low": "32.44",
//         //             "volume": "106428"
//         //           },
//         //           {
//         //             "open": "865.62",
//         //             "close": "637.06",
//         //             "high": "72.75",
//         //             "low": "952.39",
//         //             "volume": "694452"
//         //           }
//         //         ]
//         //       },
//         //       "day_change": "10.97",
//         //       "wk_change": "14.89",
//         //       "market_cap": 9513921,
//         //       "day_vol": 680528,
//         //       "supply": 14400952747,
//         //       "previous_close": "523.11",
//         //       "day_range": "460.34-620.57",
//         //       "revenue": 473900.27,
//         //       "EPS": 92262.19,
//         //       "yr_range": "506.66-13.49",
//         //       "PE_ratio": 6.2,
//         //       "ave_volume": 313430,
//         //       "dividend": "41.02"
//         //     },
//         //     {
//         //       "symbol": "COST",
//         //       "companyName": "Costco Wholesale Corp",
//         //       "prices": {
//         //         "create": [
//         //           {
//         //             "open": "605.75",
//         //             "close": "268.24",
//         //             "high": "47.65",
//         //             "low": "580.77",
//         //             "volume": "673837"
//         //           },
//         //           {
//         //             "open": "590.24",
//         //             "close": "553.05",
//         //             "high": "13.08",
//         //             "low": "355.59",
//         //             "volume": "346706"
//         //           }
//         //         ]
//         //       },
//         //       "day_change": "7.43",
//         //       "wk_change": "18.88",
//         //       "market_cap": 9796856,
//         //       "day_vol": 314045,
//         //       "supply": 67240572280,
//         //       "previous_close": "784.50",
//         //       "day_range": "471.24-624.42",
//         //       "revenue": 290122.59,
//         //       "EPS": 24438.52,
//         //       "yr_range": "162.63-341.53",
//         //       "PE_ratio": 81.1,
//         //       "ave_volume": 176896,
//         //       "dividend": "15.93"
//         //     },
//         //     {
//         //       "symbol": "CSX",
//         //       "companyName": "CSX Corp",
//         //       "prices": {
//         //         "create": [
//         //           {
//         //             "open": "555.34",
//         //             "close": "580.37",
//         //             "high": "60.45",
//         //             "low": "690.88",
//         //             "volume": "619471"
//         //           },
//         //           {
//         //             "open": "351.29",
//         //             "close": "635.06",
//         //             "high": "887.00",
//         //             "low": "752.04",
//         //             "volume": "480389"
//         //           }
//         //         ]
//         //       },
//         //       "day_change": "7.03",
//         //       "wk_change": "23.67",
//         //       "market_cap": 9090520,
//         //       "day_vol": 946925,
//         //       "supply": 26436797970,
//         //       "previous_close": "195.46",
//         //       "day_range": "339.74-137.91",
//         //       "revenue": 368772.29,
//         //       "EPS": 9154.79,
//         //       "yr_range": "607.69-95.86",
//         //       "PE_ratio": 99.4,
//         //       "ave_volume": 5526,
//         //       "dividend": "2.70"
//         //     },
//         //     {
//         //       "symbol": "CTSH",
//         //       "companyName": "Cognizant Technology Solutions Corp",
//         //       "prices": {
//         //         "create": [
//         //           {
//         //             "open": "411.46",
//         //             "close": "762.96",
//         //             "high": "999.51",
//         //             "low": "118.60",
//         //             "volume": "203418"
//         //           },
//         //           {
//         //             "open": "216.41",
//         //             "close": "142.76",
//         //             "high": "469.54",
//         //             "low": "680.89",
//         //             "volume": "780352"
//         //           }
//         //         ]
//         //       },
//         //       "day_change": "14.82",
//         //       "wk_change": "4.90",
//         //       "market_cap": 667163,
//         //       "day_vol": 546941,
//         //       "supply": 59475219497,
//         //       "previous_close": "556.57",
//         //       "day_range": "117.72-780.04",
//         //       "revenue": 670903.26,
//         //       "EPS": 94014.83,
//         //       "yr_range": "607.02-974.28",
//         //       "PE_ratio": 25.3,
//         //       "ave_volume": 853721,
//         //       "dividend": "16.36"
//         //     },
//         //     {
//         //       "symbol": "DOCU",
//         //       "companyName": "DocuSign Inc",
//         //       "prices": {
//         //         "create": [
//         //           {
//         //             "open": "242.59",
//         //             "close": "466.81",
//         //             "high": "386.83",
//         //             "low": "805.63",
//         //             "volume": "875363"
//         //           },
//         //           {
//         //             "open": "571.29",
//         //             "close": "218.40",
//         //             "high": "231.58",
//         //             "low": "1.55",
//         //             "volume": "817859"
//         //           }
//         //         ]
//         //       },
//         //       "day_change": "11.35",
//         //       "wk_change": "6.09",
//         //       "market_cap": 6869683,
//         //       "day_vol": 48523,
//         //       "supply": 58884539691,
//         //       "previous_close": "755.24",
//         //       "day_range": "853.15-532.88",
//         //       "revenue": 99631.94,
//         //       "EPS": 54482.68,
//         //       "yr_range": "751.37-128.38",
//         //       "PE_ratio": 87.1,
//         //       "ave_volume": 411515,
//         //       "dividend": "33.28"
//         //     },
//         //     {
//         //       "symbol": "DXCM",
//         //       "companyName": "Dexcom Inc",
//         //       "prices": {
//         //         "create": [
//         //           {
//         //             "open": "574.56",
//         //             "close": "913.53",
//         //             "high": "764.44",
//         //             "low": "884.94",
//         //             "volume": "6346"
//         //           },
//         //           {
//         //             "open": "979.36",
//         //             "close": "105.22",
//         //             "high": "936.57",
//         //             "low": "19.50",
//         //             "volume": "196104"
//         //           }
//         //         ]
//         //       },
//         //       "day_change": "1.62",
//         //       "wk_change": "33.21",
//         //       "market_cap": 3145564,
//         //       "day_vol": 906649,
//         //       "supply": 74857068399,
//         //       "previous_close": "941.42",
//         //       "day_range": "896.20-246.32",
//         //       "revenue": 101537.56,
//         //       "EPS": 65855.80,
//         //       "yr_range": "38.44-45.48",
//         //       "PE_ratio": 23.4,
//         //       "ave_volume": 558126,
//         //       "dividend": "38.88"
//         //     },
//         //     {
//         //       "symbol": "DLTR",
//         //       "companyName": "Dollar Tree Inc",
//         //       "prices": {
//         //         "create": [
//         //           {
//         //             "open": "932.15",
//         //             "close": "984.53",
//         //             "high": "374.36",
//         //             "low": "529.89",
//         //             "volume": "725481"
//         //           },
//         //           {
//         //             "open": "123.25",
//         //             "close": "105.50",
//         //             "high": "247.56",
//         //             "low": "632.94",
//         //             "volume": "423746"
//         //           }
//         //         ]
//         //       },
//         //       "day_change": "19.40",
//         //       "wk_change": "10.75",
//         //       "market_cap": 353561,
//         //       "day_vol": 605606,
//         //       "supply": 74782182903,
//         //       "previous_close": "361.70",
//         //       "day_range": "853.85-954.62",
//         //       "revenue": 735508.39,
//         //       "EPS": 57527.10,
//         //       "yr_range": "374.24-423.83",
//         //       "PE_ratio": 21.6,
//         //       "ave_volume": 93293,
//         //       "dividend": "23.65"
//         //     },
//         //     {
//         //       "symbol": "EA",
//         //       "companyName": "Electronic Arts",
//         //       "prices": {
//         //         "create": [
//         //           {
//         //             "open": "539.92",
//         //             "close": "271.83",
//         //             "high": "709.95",
//         //             "low": "884.06",
//         //             "volume": "840382"
//         //           },
//         //           {
//         //             "open": "894.96",
//         //             "close": "324.99",
//         //             "high": "515.10",
//         //             "low": "203.89",
//         //             "volume": "997767"
//         //           }
//         //         ]
//         //       },
//         //       "day_change": "19.37",
//         //       "wk_change": "7.39",
//         //       "market_cap": 9580189,
//         //       "day_vol": 64007,
//         //       "supply": 48968238778,
//         //       "previous_close": "844.51",
//         //       "day_range": "985.98-262.55",
//         //       "revenue": 543415.45,
//         //       "EPS": 58824.14,
//         //       "yr_range": "747.03-243.65",
//         //       "PE_ratio": 22.2,
//         //       "ave_volume": 435329,
//         //       "dividend": "8.08"
//         //     },
//         //     {
//         //       "symbol": "EBAY",
//         //       "companyName": "eBay Inc",
//         //       "prices": {
//         //         "create": [
//         //           {
//         //             "open": "473.49",
//         //             "close": "902.07",
//         //             "high": "837.35",
//         //             "low": "530.83",
//         //             "volume": "222159"
//         //           },
//         //           {
//         //             "open": "880.37",
//         //             "close": "500.71",
//         //             "high": "381.64",
//         //             "low": "23.11",
//         //             "volume": "43335"
//         //           }
//         //         ]
//         //       },
//         //       "day_change": "12.60",
//         //       "wk_change": "4.73",
//         //       "market_cap": 2249656,
//         //       "day_vol": 975228,
//         //       "supply": 47309347668,
//         //       "previous_close": "19.49",
//         //       "day_range": "577.12-408.94",
//         //       "revenue": 164386.73,
//         //       "EPS": 87278.54,
//         //       "yr_range": "284.53-332.97",
//         //       "PE_ratio": 29.3,
//         //       "ave_volume": 334652,
//         //       "dividend": "3.74"
//         //     },
//         //     {
//         //       "symbol": "EXC",
//         //       "companyName": "Exelon Corp",
//         //       "prices": {
//         //         "create": [
//         //           {
//         //             "open": "11.22",
//         //             "close": "523.93",
//         //             "high": "379.94",
//         //             "low": "643.80",
//         //             "volume": "846157"
//         //           },
//         //           {
//         //             "open": "701.40",
//         //             "close": "483.79",
//         //             "high": "925.46",
//         //             "low": "268.42",
//         //             "volume": "540936"
//         //           }
//         //         ]
//         //       },
//         //       "day_change": "19.04",
//         //       "wk_change": "39.03",
//         //       "market_cap": 3638821,
//         //       "day_vol": 927869,
//         //       "supply": 46205410683,
//         //       "previous_close": "234.08",
//         //       "day_range": "154.72-404.92",
//         //       "revenue": 130944.42,
//         //       "EPS": 38344.36,
//         //       "yr_range": "342.08-159.56",
//         //       "PE_ratio": 58.9,
//         //       "ave_volume": 908905,
//         //       "dividend": "10.40"
//         //     },
//         //     {
//         //       "symbol": "FAST",
//         //       "companyName": "Fastenal Co",
//         //       "prices": {
//         //         "create": [
//         //           {
//         //             "open": "95.97",
//         //             "close": "800.33",
//         //             "high": "968.52",
//         //             "low": "672.17",
//         //             "volume": "523376"
//         //           },
//         //           {
//         //             "open": "371.03",
//         //             "close": "941.65",
//         //             "high": "106.86",
//         //             "low": "85.03",
//         //             "volume": "95806"
//         //           }
//         //         ]
//         //       },
//         //       "day_change": "19.60",
//         //       "wk_change": "3.29",
//         //       "market_cap": 4427763,
//         //       "day_vol": 285072,
//         //       "supply": 65776581399,
//         //       "previous_close": "553.06",
//         //       "day_range": "139.05-171.29",
//         //       "revenue": 966089.84,
//         //       "EPS": 53341.73,
//         //       "yr_range": "731.32-13.61",
//         //       "PE_ratio": 40.0,
//         //       "ave_volume": 549091,
//         //       "dividend": "18.62"
//         //     },
//         //     {
//         //       "symbol": "FB",
//         //       "companyName": "Facebook",
//         //       "prices": {
//         //         "create": [
//         //           {
//         //             "open": "846.04",
//         //             "close": "300.23",
//         //             "high": "593.71",
//         //             "low": "327.91",
//         //             "volume": "482571"
//         //           },
//         //           {
//         //             "open": "823.13",
//         //             "close": "953.45",
//         //             "high": "40.87",
//         //             "low": "981.26",
//         //             "volume": "379197"
//         //           }
//         //         ]
//         //       },
//         //       "day_change": "10.13",
//         //       "wk_change": "17.83",
//         //       "market_cap": 2690191,
//         //       "day_vol": 457274,
//         //       "supply": 1711192247,
//         //       "previous_close": "283.52",
//         //       "day_range": "236.01-111.48",
//         //       "revenue": 701636.86,
//         //       "EPS": 63563.01,
//         //       "yr_range": "41.39-577.85",
//         //       "PE_ratio": 75.4,
//         //       "ave_volume": 307534,
//         //       "dividend": "27.03"
//         //     },
//         //     {
//         //       "symbol": "FISV",
//         //       "companyName": "Fiserv Inc",
//         //       "prices": {
//         //         "create": [
//         //           {
//         //             "open": "774.29",
//         //             "close": "541.29",
//         //             "high": "108.66",
//         //             "low": "610.08",
//         //             "volume": "653525"
//         //           },
//         //           {
//         //             "open": "471.26",
//         //             "close": "578.16",
//         //             "high": "270.08",
//         //             "low": "375.61",
//         //             "volume": "319927"
//         //           }
//         //         ]
//         //       },
//         //       "day_change": "0.94",
//         //       "wk_change": "32.07",
//         //       "market_cap": 4542354,
//         //       "day_vol": 925567,
//         //       "supply": 16291006703,
//         //       "previous_close": "576.94",
//         //       "day_range": "876.65-812.37",
//         //       "revenue": 576199.38,
//         //       "EPS": 51336.37,
//         //       "yr_range": "551.99-60.90",
//         //       "PE_ratio": 23.0,
//         //       "ave_volume": 218556,
//         //       "dividend": "43.05"
//         //     },
//         //     {
//         //       "symbol": "FOX",
//         //       "companyName": "Fox Corp. Class B",
//         //       "prices": {
//         //         "create": [
//         //           {
//         //             "open": "841.54",
//         //             "close": "475.92",
//         //             "high": "58.63",
//         //             "low": "828.66",
//         //             "volume": "803121"
//         //           },
//         //           {
//         //             "open": "864.97",
//         //             "close": "961.36",
//         //             "high": "824.88",
//         //             "low": "835.75",
//         //             "volume": "51878"
//         //           }
//         //         ]
//         //       },
//         //       "day_change": "17.21",
//         //       "wk_change": "9.17",
//         //       "market_cap": 107038,
//         //       "day_vol": 225256,
//         //       "supply": 94655582741,
//         //       "previous_close": "641.05",
//         //       "day_range": "137.19-715.18",
//         //       "revenue": 623295.31,
//         //       "EPS": 41680.55,
//         //       "yr_range": "629.13-303.91",
//         //       "PE_ratio": 21.7,
//         //       "ave_volume": 877341,
//         //       "dividend": "32.49"
//         //     },
//         //     {
//         //       "symbol": "FOXA",
//         //       "companyName": "Fox Corp. Class A",
//         //       "prices": {
//         //         "create": [
//         //           {
//         //             "open": "737.21",
//         //             "close": "83.35",
//         //             "high": "755.54",
//         //             "low": "693.70",
//         //             "volume": "332330"
//         //           },
//         //           {
//         //             "open": "444.76",
//         //             "close": "514.32",
//         //             "high": "648.87",
//         //             "low": "818.07",
//         //             "volume": "935213"
//         //           }
//         //         ]
//         //       },
//         //       "day_change": "0.21",
//         //       "wk_change": "25.81",
//         //       "market_cap": 3579225,
//         //       "day_vol": 656186,
//         //       "supply": 95198977736,
//         //       "previous_close": "762.43",
//         //       "day_range": "513.24-198.61",
//         //       "revenue": 229189.22,
//         //       "EPS": 24453.77,
//         //       "yr_range": "789.55-616.73",
//         //       "PE_ratio": 65.6,
//         //       "ave_volume": 340053,
//         //       "dividend": "1.12"
//         //     },
//         //     {
//         //       "symbol": "GILD",
//         //       "companyName": "Gilead Sciences Inc",
//         //       "prices": {
//         //         "create": [
//         //           {
//         //             "open": "631.59",
//         //             "close": "40.38",
//         //             "high": "40.68",
//         //             "low": "738.46",
//         //             "volume": "458095"
//         //           },
//         //           {
//         //             "open": "547.28",
//         //             "close": "676.31",
//         //             "high": "322.29",
//         //             "low": "683.95",
//         //             "volume": "327457"
//         //           }
//         //         ]
//         //       },
//         //       "day_change": "6.94",
//         //       "wk_change": "40.94",
//         //       "market_cap": 7593041,
//         //       "day_vol": 867087,
//         //       "supply": 45859091496,
//         //       "previous_close": "530.92",
//         //       "day_range": "634.54-794.48",
//         //       "revenue": 163982.90,
//         //       "EPS": 44676.88,
//         //       "yr_range": "500.11-946.16",
//         //       "PE_ratio": 50.9,
//         //       "ave_volume": 932073,
//         //       "dividend": "5.67"
//         //     },
//         //     {
//         //       "symbol": "GOOG",
//         //       "companyName": "Alphabet Class C",
//         //       "prices": {
//         //         "create": [
//         //           {
//         //             "open": "813.52",
//         //             "close": "828.61",
//         //             "high": "78.12",
//         //             "low": "877.86",
//         //             "volume": "785924"
//         //           },
//         //           {
//         //             "open": "381.80",
//         //             "close": "360.60",
//         //             "high": "131.37",
//         //             "low": "877.59",
//         //             "volume": "216294"
//         //           }
//         //         ]
//         //       },
//         //       "day_change": "15.91",
//         //       "wk_change": "2.55",
//         //       "market_cap": 4357674,
//         //       "day_vol": 416110,
//         //       "supply": 63122244395,
//         //       "previous_close": "525.13",
//         //       "day_range": "705.55-188.42",
//         //       "revenue": 896922.16,
//         //       "EPS": 72924.33,
//         //       "yr_range": "292.60-40.64",
//         //       "PE_ratio": 79.9,
//         //       "ave_volume": 677749,
//         //       "dividend": "22.22"
//         //     },
//         //     {
//         //       "symbol": "GOOGL",
//         //       "companyName": "Alphabet Class A",
//         //       "prices": {
//         //         "create": [
//         //           {
//         //             "open": "345.83",
//         //             "close": "622.23",
//         //             "high": "525.44",
//         //             "low": "444.43",
//         //             "volume": "431077"
//         //           },
//         //           {
//         //             "open": "830.08",
//         //             "close": "212.13",
//         //             "high": "319.06",
//         //             "low": "742.92",
//         //             "volume": "614463"
//         //           }
//         //         ]
//         //       },
//         //       "day_change": "19.22",
//         //       "wk_change": "20.48",
//         //       "market_cap": 1428739,
//         //       "day_vol": 628147,
//         //       "supply": 86278955290,
//         //       "previous_close": "40.99",
//         //       "day_range": "206.74-261.18",
//         //       "revenue": 242988.14,
//         //       "EPS": 55817.29,
//         //       "yr_range": "785.63-194.43",
//         //       "PE_ratio": 19.6,
//         //       "ave_volume": 183723,
//         //       "dividend": "37.58"
//         //     },
//         //     {
//         //       "symbol": "ILMN",
//         //       "companyName": "Illumina Inc",
//         //       "prices": {
//         //         "create": [
//         //           {
//         //             "open": "126.35",
//         //             "close": "407.58",
//         //             "high": "234.33",
//         //             "low": "645.44",
//         //             "volume": "354527"
//         //           },
//         //           {
//         //             "open": "925.75",
//         //             "close": "529.37",
//         //             "high": "487.72",
//         //             "low": "833.39",
//         //             "volume": "265898"
//         //           }
//         //         ]
//         //       },
//         //       "day_change": "2.94",
//         //       "wk_change": "6.92",
//         //       "market_cap": 5368666,
//         //       "day_vol": 426095,
//         //       "supply": 59661286924,
//         //       "previous_close": "635.63",
//         //       "day_range": "667.84-828.30",
//         //       "revenue": 317374.73,
//         //       "EPS": 25627.06,
//         //       "yr_range": "857.39-564.84",
//         //       "PE_ratio": 61.0,
//         //       "ave_volume": 565145,
//         //       "dividend": "19.65"
//         //     },
//         //     {
//         //       "symbol": "INCY",
//         //       "companyName": "Incyte Corp",
//         //       "prices": {
//         //         "create": [
//         //           {
//         //             "open": "881.88",
//         //             "close": "583.12",
//         //             "high": "835.51",
//         //             "low": "119.89",
//         //             "volume": "597482"
//         //           },
//         //           {
//         //             "open": "173.90",
//         //             "close": "877.41",
//         //             "high": "39.67",
//         //             "low": "995.47",
//         //             "volume": "653151"
//         //           }
//         //         ]
//         //       },
//         //       "day_change": "11.98",
//         //       "wk_change": "15.52",
//         //       "market_cap": 9654322,
//         //       "day_vol": 274730,
//         //       "supply": 68573341509,
//         //       "previous_close": "1.70",
//         //       "day_range": "331.43-51.68",
//         //       "revenue": 111719.76,
//         //       "EPS": 38499.42,
//         //       "yr_range": "11.13-512.48",
//         //       "PE_ratio": 41.1,
//         //       "ave_volume": 336017,
//         //       "dividend": "35.25"
//         //     },
//         //     {
//         //       "symbol": "INTC",
//         //       "companyName": "Intel Corp",
//         //       "prices": {
//         //         "create": [
//         //           {
//         //             "open": "939.50",
//         //             "close": "32.85",
//         //             "high": "161.81",
//         //             "low": "424.50",
//         //             "volume": "33360"
//         //           },
//         //           {
//         //             "open": "404.87",
//         //             "close": "578.86",
//         //             "high": "402.85",
//         //             "low": "660.76",
//         //             "volume": "314835"
//         //           }
//         //         ]
//         //       },
//         //       "day_change": "7.41",
//         //       "wk_change": "2.34",
//         //       "market_cap": 5393606,
//         //       "day_vol": 502371,
//         //       "supply": 59628195417,
//         //       "previous_close": "818.45",
//         //       "day_range": "717.39-513.31",
//         //       "revenue": 804550.76,
//         //       "EPS": 50261.26,
//         //       "yr_range": "930.44-828.98",
//         //       "PE_ratio": 45.0,
//         //       "ave_volume": 987778,
//         //       "dividend": "7.68"
//         //     },
//         //     {
//         //       "symbol": "INTU",
//         //       "companyName": "Intuit Inc",
//         //       "prices": {
//         //         "create": [
//         //           {
//         //             "open": "107.12",
//         //             "close": "560.84",
//         //             "high": "139.70",
//         //             "low": "419.33",
//         //             "volume": "30526"
//         //           },
//         //           {
//         //             "open": "483.64",
//         //             "close": "790.31",
//         //             "high": "939.73",
//         //             "low": "618.55",
//         //             "volume": "347386"
//         //           }
//         //         ]
//         //       },
//         //       "day_change": "7.82",
//         //       "wk_change": "48.39",
//         //       "market_cap": 8967453,
//         //       "day_vol": 127343,
//         //       "supply": 73336034953,
//         //       "previous_close": "979.49",
//         //       "day_range": "777.64-682.91",
//         //       "revenue": 283742.92,
//         //       "EPS": 34020.93,
//         //       "yr_range": "37.77-957.72",
//         //       "PE_ratio": 66.7,
//         //       "ave_volume": 60917,
//         //       "dividend": "17.09"
//         //     },
//         //     {
//         //       "symbol": "ISRG",
//         //       "companyName": "Intuitive Surgical Inc",
//         //       "prices": {
//         //         "create": [
//         //           {
//         //             "open": "743.50",
//         //             "close": "355.70",
//         //             "high": "520.15",
//         //             "low": "338.03",
//         //             "volume": "431290"
//         //           },
//         //           {
//         //             "open": "641.02",
//         //             "close": "175.71",
//         //             "high": "241.28",
//         //             "low": "104.48",
//         //             "volume": "54020"
//         //           }
//         //         ]
//         //       },
//         //       "day_change": "10.53",
//         //       "wk_change": "2.80",
//         //       "market_cap": 1824458,
//         //       "day_vol": 334761,
//         //       "supply": 38856793591,
//         //       "previous_close": "383.55",
//         //       "day_range": "490.82-86.32",
//         //       "revenue": 91178.95,
//         //       "EPS": 6547.12,
//         //       "yr_range": "321.16-442.28",
//         //       "PE_ratio": 38.9,
//         //       "ave_volume": 666797,
//         //       "dividend": "21.69"
//         //     },
//         //     {
//         //       "symbol": "MRVL",
//         //       "companyName": "Marvell Technology Group Ltd",
//         //       "prices": {
//         //         "create": [
//         //           {
//         //             "open": "635.55",
//         //             "close": "936.46",
//         //             "high": "753.00",
//         //             "low": "984.24",
//         //             "volume": "321737"
//         //           },
//         //           {
//         //             "open": "311.58",
//         //             "close": "402.23",
//         //             "high": "567.41",
//         //             "low": "976.64",
//         //             "volume": "323526"
//         //           }
//         //         ]
//         //       },
//         //       "day_change": "18.28",
//         //       "wk_change": "31.96",
//         //       "market_cap": 1227342,
//         //       "day_vol": 149515,
//         //       "supply": 92552683771,
//         //       "previous_close": "588.00",
//         //       "day_range": "922.93-149.81",
//         //       "revenue": 906961.10,
//         //       "EPS": 35524.71,
//         //       "yr_range": "667.91-869.58",
//         //       "PE_ratio": 21.0,
//         //       "ave_volume": 703362,
//         //       "dividend": "44.88"
//         //     },
//         //     {
//         //       "symbol": "IDXX",
//         //       "companyName": "IDEXX Laboratories Inc",
//         //       "prices": {
//         //         "create": [
//         //           {
//         //             "open": "1.57",
//         //             "close": "737.93",
//         //             "high": "92.05",
//         //             "low": "34.93",
//         //             "volume": "495247"
//         //           },
//         //           {
//         //             "open": "380.18",
//         //             "close": "22.05",
//         //             "high": "723.97",
//         //             "low": "878.47",
//         //             "volume": "687866"
//         //           }
//         //         ]
//         //       },
//         //       "day_change": "13.82",
//         //       "wk_change": "47.96",
//         //       "market_cap": 2174596,
//         //       "day_vol": 45900,
//         //       "supply": 2717473853,
//         //       "previous_close": "538.19",
//         //       "day_range": "912.15-27.65",
//         //       "revenue": 622715.05,
//         //       "EPS": 87811.82,
//         //       "yr_range": "382.58-287.48",
//         //       "PE_ratio": 77.2,
//         //       "ave_volume": 558382,
//         //       "dividend": "47.86"
//         //     },
//         //     {
//         //       "symbol": "JD",
//         //       "companyName": "JD.Com Inc",
//         //       "prices": {
//         //         "create": [
//         //           {
//         //             "open": "695.72",
//         //             "close": "377.61",
//         //             "high": "867.00",
//         //             "low": "107.07",
//         //             "volume": "562499"
//         //           },
//         //           {
//         //             "open": "734.63",
//         //             "close": "153.22",
//         //             "high": "593.69",
//         //             "low": "971.19",
//         //             "volume": "918230"
//         //           }
//         //         ]
//         //       },
//         //       "day_change": "7.23",
//         //       "wk_change": "30.21",
//         //       "market_cap": 1027418,
//         //       "day_vol": 838428,
//         //       "supply": 4490873570,
//         //       "previous_close": "103.82",
//         //       "day_range": "433.92-553.16",
//         //       "revenue": 876406.19,
//         //       "EPS": 81560.27,
//         //       "yr_range": "861.58-812.56",
//         //       "PE_ratio": 9.3,
//         //       "ave_volume": 814122,
//         //       "dividend": "31.40"
//         //     },
//         //     {
//         //       "symbol": "KDP",
//         //       "companyName": "Keurig Dr Pepper Inc",
//         //       "prices": {
//         //         "create": [
//         //           {
//         //             "open": "565.16",
//         //             "close": "137.46",
//         //             "high": "951.50",
//         //             "low": "774.19",
//         //             "volume": "397105"
//         //           },
//         //           {
//         //             "open": "841.30",
//         //             "close": "677.91",
//         //             "high": "229.67",
//         //             "low": "638.38",
//         //             "volume": "378088"
//         //           }
//         //         ]
//         //       },
//         //       "day_change": "10.16",
//         //       "wk_change": "6.69",
//         //       "market_cap": 4909383,
//         //       "day_vol": 871423,
//         //       "supply": 97139815711,
//         //       "previous_close": "886.18",
//         //       "day_range": "119.34-159.52",
//         //       "revenue": 787286.88,
//         //       "EPS": 40897.94,
//         //       "yr_range": "427.51-797.43",
//         //       "PE_ratio": 63.0,
//         //       "ave_volume": 331948,
//         //       "dividend": "32.65"
//         //     },
//         //     {
//         //       "symbol": "KLAC",
//         //       "companyName": "KLA Corp",
//         //       "prices": {
//         //         "create": [
//         //           {
//         //             "open": "780.57",
//         //             "close": "519.60",
//         //             "high": "233.70",
//         //             "low": "35.73",
//         //             "volume": "363249"
//         //           },
//         //           {
//         //             "open": "42.63",
//         //             "close": "139.20",
//         //             "high": "999.41",
//         //             "low": "90.54",
//         //             "volume": "350030"
//         //           }
//         //         ]
//         //       },
//         //       "day_change": "9.83",
//         //       "wk_change": "26.44",
//         //       "market_cap": 5775977,
//         //       "day_vol": 953961,
//         //       "supply": 14179065994,
//         //       "previous_close": "364.96",
//         //       "day_range": "151.28-452.38",
//         //       "revenue": 534086.57,
//         //       "EPS": 9049.53,
//         //       "yr_range": "707.41-924.56",
//         //       "PE_ratio": 85.2,
//         //       "ave_volume": 830425,
//         //       "dividend": "0.27"
//         //     },
//         //     {
//         //       "symbol": "KHC",
//         //       "companyName": "Kraft Heinz Co",
//         //       "prices": {
//         //         "create": [
//         //           {
//         //             "open": "228.68",
//         //             "close": "440.28",
//         //             "high": "710.54",
//         //             "low": "301.44",
//         //             "volume": "716369"
//         //           },
//         //           {
//         //             "open": "292.98",
//         //             "close": "668.82",
//         //             "high": "732.33",
//         //             "low": "786.69",
//         //             "volume": "224399"
//         //           }
//         //         ]
//         //       },
//         //       "day_change": "9.52",
//         //       "wk_change": "48.56",
//         //       "market_cap": 9377497,
//         //       "day_vol": 599183,
//         //       "supply": 23938814748,
//         //       "previous_close": "43.29",
//         //       "day_range": "442.50-253.97",
//         //       "revenue": 534038.99,
//         //       "EPS": 18623.78,
//         //       "yr_range": "971.65-743.12",
//         //       "PE_ratio": 25.9,
//         //       "ave_volume": 1794,
//         //       "dividend": "10.39"
//         //     },
//         //     {
//         //       "symbol": "LRCX",
//         //       "companyName": "Lam Research Corp",
//         //       "prices": {
//         //         "create": [
//         //           {
//         //             "open": "444.14",
//         //             "close": "660.01",
//         //             "high": "357.02",
//         //             "low": "255.97",
//         //             "volume": "848462"
//         //           },
//         //           {
//         //             "open": "193.47",
//         //             "close": "106.12",
//         //             "high": "209.02",
//         //             "low": "347.59",
//         //             "volume": "502787"
//         //           }
//         //         ]
//         //       },
//         //       "day_change": "15.68",
//         //       "wk_change": "23.13",
//         //       "market_cap": 6029188,
//         //       "day_vol": 819358,
//         //       "supply": 79388266831,
//         //       "previous_close": "658.46",
//         //       "day_range": "702.42-238.79",
//         //       "revenue": 496997.35,
//         //       "EPS": 90982.24,
//         //       "yr_range": "494.04-209.95",
//         //       "PE_ratio": 3.2,
//         //       "ave_volume": 851569,
//         //       "dividend": "39.37"
//         //     },
//         //     {
//         //       "symbol": "LULU",
//         //       "companyName": "Lululemon Athletica Inc",
//         //       "prices": {
//         //         "create": [
//         //           {
//         //             "open": "848.63",
//         //             "close": "251.40",
//         //             "high": "418.27",
//         //             "low": "247.24",
//         //             "volume": "358213"
//         //           },
//         //           {
//         //             "open": "70.22",
//         //             "close": "720.50",
//         //             "high": "230.35",
//         //             "low": "346.71",
//         //             "volume": "10993"
//         //           }
//         //         ]
//         //       },
//         //       "day_change": "7.28",
//         //       "wk_change": "3.08",
//         //       "market_cap": 4788802,
//         //       "day_vol": 789411,
//         //       "supply": 22004455739,
//         //       "previous_close": "600.05",
//         //       "day_range": "463.91-202.20",
//         //       "revenue": 831583.09,
//         //       "EPS": 88318.31,
//         //       "yr_range": "436.77-421.76",
//         //       "PE_ratio": 21.1,
//         //       "ave_volume": 767275,
//         //       "dividend": "46.74"
//         //     },
//         //     {
//         //       "symbol": "MELI",
//         //       "companyName": "Mercadolibre Inc",
//         //       "prices": {
//         //         "create": [
//         //           {
//         //             "open": "268.25",
//         //             "close": "658.93",
//         //             "high": "264.23",
//         //             "low": "962.45",
//         //             "volume": "212864"
//         //           },
//         //           {
//         //             "open": "354.11",
//         //             "close": "854.38",
//         //             "high": "443.84",
//         //             "low": "795.44",
//         //             "volume": "384705"
//         //           }
//         //         ]
//         //       },
//         //       "day_change": "11.77",
//         //       "wk_change": "13.23",
//         //       "market_cap": 4259108,
//         //       "day_vol": 997862,
//         //       "supply": 56260383245,
//         //       "previous_close": "233.34",
//         //       "day_range": "279.84-101.36",
//         //       "revenue": 442942.05,
//         //       "EPS": 79575.18,
//         //       "yr_range": "179.20-190.22",
//         //       "PE_ratio": 83.9,
//         //       "ave_volume": 269061,
//         //       "dividend": "16.00"
//         //     },
//         //     {
//         //       "symbol": "MAR",
//         //       "companyName": "Marriott International Inc",
//         //       "prices": {
//         //         "create": [
//         //           {
//         //             "open": "234.30",
//         //             "close": "282.95",
//         //             "high": "225.87",
//         //             "low": "503.71",
//         //             "volume": "654926"
//         //           },
//         //           {
//         //             "open": "788.31",
//         //             "close": "757.21",
//         //             "high": "474.68",
//         //             "low": "931.17",
//         //             "volume": "827960"
//         //           }
//         //         ]
//         //       },
//         //       "day_change": "19.78",
//         //       "wk_change": "6.02",
//         //       "market_cap": 3067407,
//         //       "day_vol": 344160,
//         //       "supply": 66300627550,
//         //       "previous_close": "884.54",
//         //       "day_range": "206.85-629.07",
//         //       "revenue": 183788.03,
//         //       "EPS": 33597.04,
//         //       "yr_range": "526.74-660.86",
//         //       "PE_ratio": 38.5,
//         //       "ave_volume": 286274,
//         //       "dividend": "4.27"
//         //     },
//         //     {
//         //       "symbol": "MTCH",
//         //       "companyName": "Match Group Inc",
//         //       "prices": {
//         //         "create": [
//         //           {
//         //             "open": "188.88",
//         //             "close": "732.26",
//         //             "high": "293.11",
//         //             "low": "675.90",
//         //             "volume": "564147"
//         //           },
//         //           {
//         //             "open": "260.96",
//         //             "close": "160.51",
//         //             "high": "698.64",
//         //             "low": "204.34",
//         //             "volume": "618353"
//         //           }
//         //         ]
//         //       },
//         //       "day_change": "1.67",
//         //       "wk_change": "3.84",
//         //       "market_cap": 6685810,
//         //       "day_vol": 209648,
//         //       "supply": 70293237895,
//         //       "previous_close": "538.96",
//         //       "day_range": "234.09-903.69",
//         //       "revenue": 812765.84,
//         //       "EPS": 69573.37,
//         //       "yr_range": "953.04-111.54",
//         //       "PE_ratio": 1.5,
//         //       "ave_volume": 346206,
//         //       "dividend": "16.41"
//         //     },
//         //     {
//         //       "symbol": "MCHP",
//         //       "companyName": "Microchip Technology Inc",
//         //       "prices": {
//         //         "create": [
//         //           {
//         //             "open": "960.43",
//         //             "close": "551.68",
//         //             "high": "908.76",
//         //             "low": "280.19",
//         //             "volume": "748215"
//         //           },
//         //           {
//         //             "open": "342.16",
//         //             "close": "496.52",
//         //             "high": "893.75",
//         //             "low": "85.08",
//         //             "volume": "416186"
//         //           }
//         //         ]
//         //       },
//         //       "day_change": "9.81",
//         //       "wk_change": "3.14",
//         //       "market_cap": 4959201,
//         //       "day_vol": 865086,
//         //       "supply": 31739520410,
//         //       "previous_close": "242.51",
//         //       "day_range": "619.04-932.81",
//         //       "revenue": 335075.04,
//         //       "EPS": 99536.33,
//         //       "yr_range": "973.32-205.66",
//         //       "PE_ratio": 67.4,
//         //       "ave_volume": 63743,
//         //       "dividend": "28.31"
//         //     },
//         //     {
//         //       "symbol": "MDLZ",
//         //       "companyName": "Mondelez International Inc",
//         //       "prices": {
//         //         "create": [
//         //           {
//         //             "open": "568.11",
//         //             "close": "582.01",
//         //             "high": "18.68",
//         //             "low": "14.61",
//         //             "volume": "868595"
//         //           },
//         //           {
//         //             "open": "499.18",
//         //             "close": "878.47",
//         //             "high": "63.49",
//         //             "low": "519.85",
//         //             "volume": "590249"
//         //           }
//         //         ]
//         //       },
//         //       "day_change": "0.60",
//         //       "wk_change": "10.85",
//         //       "market_cap": 6401370,
//         //       "day_vol": 370710,
//         //       "supply": 77662792608,
//         //       "previous_close": "857.60",
//         //       "day_range": "434.20-168.20",
//         //       "revenue": 868841.36,
//         //       "EPS": 81068.94,
//         //       "yr_range": "712.11-87.82",
//         //       "PE_ratio": 82.3,
//         //       "ave_volume": 921196,
//         //       "dividend": "4.26"
//         //     },
//         //     {
//         //       "symbol": "MRNA",
//         //       "companyName": "Moderna Inc",
//         //       "prices": {
//         //         "create": [
//         //           {
//         //             "open": "851.93",
//         //             "close": "951.56",
//         //             "high": "914.94",
//         //             "low": "94.83",
//         //             "volume": "956871"
//         //           },
//         //           {
//         //             "open": "589.14",
//         //             "close": "744.79",
//         //             "high": "188.37",
//         //             "low": "62.05",
//         //             "volume": "223697"
//         //           }
//         //         ]
//         //       },
//         //       "day_change": "8.43",
//         //       "wk_change": "20.74",
//         //       "market_cap": 7266916,
//         //       "day_vol": 314972,
//         //       "supply": 66284921910,
//         //       "previous_close": "922.50",
//         //       "day_range": "531.74-745.72",
//         //       "revenue": 787239.79,
//         //       "EPS": 64775.17,
//         //       "yr_range": "43.91-832.40",
//         //       "PE_ratio": 34.1,
//         //       "ave_volume": 381808,
//         //       "dividend": "19.06"
//         //     },
//         //     {
//         //       "symbol": "MNST",
//         //       "companyName": "Monster Beverage Corp",
//         //       "prices": {
//         //         "create": [
//         //           {
//         //             "open": "371.22",
//         //             "close": "435.31",
//         //             "high": "896.49",
//         //             "low": "253.20",
//         //             "volume": "350581"
//         //           },
//         //           {
//         //             "open": "158.09",
//         //             "close": "667.04",
//         //             "high": "341.99",
//         //             "low": "496.42",
//         //             "volume": "415895"
//         //           }
//         //         ]
//         //       },
//         //       "day_change": "0.88",
//         //       "wk_change": "30.02",
//         //       "market_cap": 5058431,
//         //       "day_vol": 93886,
//         //       "supply": 44076048287,
//         //       "previous_close": "837.62",
//         //       "day_range": "246.05-388.43",
//         //       "revenue": 989967.78,
//         //       "EPS": 78806.61,
//         //       "yr_range": "388.63-320.48",
//         //       "PE_ratio": 84.0,
//         //       "ave_volume": 291093,
//         //       "dividend": "6.43"
//         //     },
//         //     {
//         //       "symbol": "MSFT",
//         //       "companyName": "Microsoft Corp",
//         //       "prices": {
//         //         "create": [
//         //           {
//         //             "open": "457.65",
//         //             "close": "826.90",
//         //             "high": "328.04",
//         //             "low": "874.61",
//         //             "volume": "993945"
//         //           },
//         //           {
//         //             "open": "450.62",
//         //             "close": "853.41",
//         //             "high": "359.52",
//         //             "low": "811.37",
//         //             "volume": "426024"
//         //           }
//         //         ]
//         //       },
//         //       "day_change": "19.07",
//         //       "wk_change": "31.23",
//         //       "market_cap": 8896040,
//         //       "day_vol": 336698,
//         //       "supply": 57686581003,
//         //       "previous_close": "94.80",
//         //       "day_range": "866.21-701.44",
//         //       "revenue": 446916.47,
//         //       "EPS": 61484.52,
//         //       "yr_range": "372.11-972.40",
//         //       "PE_ratio": 45.1,
//         //       "ave_volume": 991427,
//         //       "dividend": "12.02"
//         //     },
//         //     {
//         //       "symbol": "MU",
//         //       "companyName": "Micron Technology Inc",
//         //       "prices": {
//         //         "create": [
//         //           {
//         //             "open": "723.11",
//         //             "close": "71.33",
//         //             "high": "330.49",
//         //             "low": "431.48",
//         //             "volume": "78441"
//         //           },
//         //           {
//         //             "open": "226.63",
//         //             "close": "51.05",
//         //             "high": "18.11",
//         //             "low": "437.79",
//         //             "volume": "640945"
//         //           }
//         //         ]
//         //       },
//         //       "day_change": "18.49",
//         //       "wk_change": "14.79",
//         //       "market_cap": 3832243,
//         //       "day_vol": 314466,
//         //       "supply": 78261101002,
//         //       "previous_close": "229.81",
//         //       "day_range": "130.91-587.66",
//         //       "revenue": 828019.78,
//         //       "EPS": 78591.23,
//         //       "yr_range": "679.38-430.50",
//         //       "PE_ratio": 41.2,
//         //       "ave_volume": 922746,
//         //       "dividend": "30.42"
//         //     },
//         //     {
//         //       "symbol": "MXIM",
//         //       "companyName": "Maxim Integrated Products Inc",
//         //       "prices": {
//         //         "create": [
//         //           {
//         //             "open": "130.53",
//         //             "close": "264.71",
//         //             "high": "704.51",
//         //             "low": "235.71",
//         //             "volume": "853723"
//         //           },
//         //           {
//         //             "open": "135.07",
//         //             "close": "593.60",
//         //             "high": "986.70",
//         //             "low": "827.00",
//         //             "volume": "372235"
//         //           }
//         //         ]
//         //       },
//         //       "day_change": "15.85",
//         //       "wk_change": "5.81",
//         //       "market_cap": 1166957,
//         //       "day_vol": 104255,
//         //       "supply": 39779035874,
//         //       "previous_close": "993.70",
//         //       "day_range": "826.10-817.94",
//         //       "revenue": 488437.00,
//         //       "EPS": 57132.68,
//         //       "yr_range": "285.89-311.79",
//         //       "PE_ratio": 65.7,
//         //       "ave_volume": 687135,
//         //       "dividend": "25.75"
//         //     },
//         //     {
//         //       "symbol": "NFLX",
//         //       "companyName": "Netflix Inc",
//         //       "prices": {
//         //         "create": [
//         //           {
//         //             "open": "20.27",
//         //             "close": "928.09",
//         //             "high": "68.48",
//         //             "low": "176.43",
//         //             "volume": "307005"
//         //           },
//         //           {
//         //             "open": "357.50",
//         //             "close": "949.90",
//         //             "high": "745.76",
//         //             "low": "16.68",
//         //             "volume": "133171"
//         //           }
//         //         ]
//         //       },
//         //       "day_change": "11.66",
//         //       "wk_change": "3.06",
//         //       "market_cap": 6915312,
//         //       "day_vol": 229656,
//         //       "supply": 66206719109,
//         //       "previous_close": "346.38",
//         //       "day_range": "132.23-442.20",
//         //       "revenue": 463695.42,
//         //       "EPS": 90387.71,
//         //       "yr_range": "578.16-242.10",
//         //       "PE_ratio": 91.6,
//         //       "ave_volume": 767415,
//         //       "dividend": "4.84"
//         //     },
//         //     {
//         //       "symbol": "NTES",
//         //       "companyName": "NetEase Inc",
//         //       "prices": {
//         //         "create": [
//         //           {
//         //             "open": "446.07",
//         //             "close": "825.56",
//         //             "high": "346.74",
//         //             "low": "745.34",
//         //             "volume": "368778"
//         //           },
//         //           {
//         //             "open": "620.06",
//         //             "close": "822.24",
//         //             "high": "312.97",
//         //             "low": "431.64",
//         //             "volume": "842098"
//         //           }
//         //         ]
//         //       },
//         //       "day_change": "9.67",
//         //       "wk_change": "6.58",
//         //       "market_cap": 7317419,
//         //       "day_vol": 54656,
//         //       "supply": 8637924525,
//         //       "previous_close": "308.35",
//         //       "day_range": "442.03-938.36",
//         //       "revenue": 39299.08,
//         //       "EPS": 79585.63,
//         //       "yr_range": "933.59-660.60",
//         //       "PE_ratio": 29.5,
//         //       "ave_volume": 545773,
//         //       "dividend": "24.67"
//         //     },
//         //     {
//         //       "symbol": "NVDA",
//         //       "companyName": "NVIDIA Corp",
//         //       "prices": {
//         //         "create": [
//         //           {
//         //             "open": "28.04",
//         //             "close": "574.16",
//         //             "high": "866.44",
//         //             "low": "620.41",
//         //             "volume": "436837"
//         //           },
//         //           {
//         //             "open": "51.45",
//         //             "close": "473.90",
//         //             "high": "589.06",
//         //             "low": "93.34",
//         //             "volume": "833058"
//         //           }
//         //         ]
//         //       },
//         //       "day_change": "8.56",
//         //       "wk_change": "27.16",
//         //       "market_cap": 8033318,
//         //       "day_vol": 529710,
//         //       "supply": 57200656474,
//         //       "previous_close": "453.84",
//         //       "day_range": "550.89-714.87",
//         //       "revenue": 900128.23,
//         //       "EPS": 47696.70,
//         //       "yr_range": "607.45-663.07",
//         //       "PE_ratio": 66.6,
//         //       "ave_volume": 789955,
//         //       "dividend": "31.74"
//         //     },
//         //     {
//         //       "symbol": "NXPI",
//         //       "companyName": "NXP Semiconductors NV",
//         //       "prices": {
//         //         "create": [
//         //           {
//         //             "open": "685.43",
//         //             "close": "825.51",
//         //             "high": "557.63",
//         //             "low": "586.97",
//         //             "volume": "925115"
//         //           },
//         //           {
//         //             "open": "695.63",
//         //             "close": "403.43",
//         //             "high": "953.42",
//         //             "low": "470.56",
//         //             "volume": "940415"
//         //           }
//         //         ]
//         //       },
//         //       "day_change": "8.51",
//         //       "wk_change": "12.06",
//         //       "market_cap": 2543540,
//         //       "day_vol": 765598,
//         //       "supply": 85578886884,
//         //       "previous_close": "820.68",
//         //       "day_range": "611.07-209.49",
//         //       "revenue": 814284.02,
//         //       "EPS": 18418.58,
//         //       "yr_range": "559.31-799.73",
//         //       "PE_ratio": 45.6,
//         //       "ave_volume": 158624,
//         //       "dividend": "38.93"
//         //     },
//         //     {
//         //       "symbol": "OKTA",
//         //       "companyName": "Okta Inc",
//         //       "prices": {
//         //         "create": [
//         //           {
//         //             "open": "212.01",
//         //             "close": "93.67",
//         //             "high": "556.40",
//         //             "low": "984.91",
//         //             "volume": "226703"
//         //           },
//         //           {
//         //             "open": "780.03",
//         //             "close": "951.14",
//         //             "high": "180.63",
//         //             "low": "155.70",
//         //             "volume": "663051"
//         //           }
//         //         ]
//         //       },
//         //       "day_change": "1.00",
//         //       "wk_change": "38.81",
//         //       "market_cap": 1018165,
//         //       "day_vol": 851026,
//         //       "supply": 49343666323,
//         //       "previous_close": "151.07",
//         //       "day_range": "236.56-433.82",
//         //       "revenue": 304917.83,
//         //       "EPS": 23959.27,
//         //       "yr_range": "426.72-107.71",
//         //       "PE_ratio": 69.2,
//         //       "ave_volume": 907815,
//         //       "dividend": "31.21"
//         //     },
//         //     {
//         //       "symbol": "ORLY",
//         //       "companyName": "O'Reilly Automotive Inc",
//         //       "prices": {
//         //         "create": [
//         //           {
//         //             "open": "722.09",
//         //             "close": "727.92",
//         //             "high": "618.07",
//         //             "low": "98.87",
//         //             "volume": "709909"
//         //           },
//         //           {
//         //             "open": "869.16",
//         //             "close": "664.48",
//         //             "high": "533.70",
//         //             "low": "51.38",
//         //             "volume": "840660"
//         //           }
//         //         ]
//         //       },
//         //       "day_change": "15.89",
//         //       "wk_change": "46.71",
//         //       "market_cap": 401497,
//         //       "day_vol": 825530,
//         //       "supply": 56567696191,
//         //       "previous_close": "124.41",
//         //       "day_range": "261.34-994.09",
//         //       "revenue": 653466.60,
//         //       "EPS": 62916.66,
//         //       "yr_range": "692.39-613.70",
//         //       "PE_ratio": 46.4,
//         //       "ave_volume": 294882,
//         //       "dividend": "27.17"
//         //     },
//         //     {
//         //       "symbol": "PAYX",
//         //       "companyName": "Paychex Inc",
//         //       "prices": {
//         //         "create": [
//         //           {
//         //             "open": "742.38",
//         //             "close": "330.53",
//         //             "high": "42.64",
//         //             "low": "428.43",
//         //             "volume": "4148"
//         //           },
//         //           {
//         //             "open": "78.92",
//         //             "close": "56.65",
//         //             "high": "879.41",
//         //             "low": "207.20",
//         //             "volume": "983407"
//         //           }
//         //         ]
//         //       },
//         //       "day_change": "18.87",
//         //       "wk_change": "39.41",
//         //       "market_cap": 9192514,
//         //       "day_vol": 748081,
//         //       "supply": 27231098031,
//         //       "previous_close": "60.07",
//         //       "day_range": "742.23-170.45",
//         //       "revenue": 831245.14,
//         //       "EPS": 92349.20,
//         //       "yr_range": "58.31-702.58",
//         //       "PE_ratio": 52.0,
//         //       "ave_volume": 117868,
//         //       "dividend": "4.49"
//         //     },
//         //     {
//         //       "symbol": "PCAR",
//         //       "companyName": "Paccar Inc",
//         //       "prices": {
//         //         "create": [
//         //           {
//         //             "open": "40.63",
//         //             "close": "298.65",
//         //             "high": "594.40",
//         //             "low": "678.51",
//         //             "volume": "783139"
//         //           },
//         //           {
//         //             "open": "733.43",
//         //             "close": "560.46",
//         //             "high": "942.04",
//         //             "low": "543.54",
//         //             "volume": "198818"
//         //           }
//         //         ]
//         //       },
//         //       "day_change": "8.68",
//         //       "wk_change": "40.98",
//         //       "market_cap": 7611633,
//         //       "day_vol": 169837,
//         //       "supply": 87738931609,
//         //       "previous_close": "447.57",
//         //       "day_range": "22.87-684.91",
//         //       "revenue": 525382.42,
//         //       "EPS": 56067.44,
//         //       "yr_range": "109.60-168.76",
//         //       "PE_ratio": 80.1,
//         //       "ave_volume": 479415,
//         //       "dividend": "23.16"
//         //     },
//         //     {
//         //       "symbol": "PDD",
//         //       "companyName": "Pinduoduo Inc",
//         //       "prices": {
//         //         "create": [
//         //           {
//         //             "open": "559.55",
//         //             "close": "33.04",
//         //             "high": "127.52",
//         //             "low": "721.23",
//         //             "volume": "915641"
//         //           },
//         //           {
//         //             "open": "66.58",
//         //             "close": "259.69",
//         //             "high": "286.93",
//         //             "low": "518.40",
//         //             "volume": "429230"
//         //           }
//         //         ]
//         //       },
//         //       "day_change": "1.37",
//         //       "wk_change": "8.26",
//         //       "market_cap": 5167377,
//         //       "day_vol": 839128,
//         //       "supply": 86914951173,
//         //       "previous_close": "540.39",
//         //       "day_range": "695.11-156.09",
//         //       "revenue": 742330.45,
//         //       "EPS": 85877.52,
//         //       "yr_range": "421.67-826.51",
//         //       "PE_ratio": 90.7,
//         //       "ave_volume": 356949,
//         //       "dividend": "43.20"
//         //     },
//         //     {
//         //       "symbol": "PTON",
//         //       "companyName": "Peloton Interactive Inc",
//         //       "prices": {
//         //         "create": [
//         //           {
//         //             "open": "537.23",
//         //             "close": "201.64",
//         //             "high": "111.28",
//         //             "low": "885.21",
//         //             "volume": "776534"
//         //           },
//         //           {
//         //             "open": "728.85",
//         //             "close": "151.45",
//         //             "high": "813.40",
//         //             "low": "395.31",
//         //             "volume": "212725"
//         //           }
//         //         ]
//         //       },
//         //       "day_change": "13.99",
//         //       "wk_change": "15.38",
//         //       "market_cap": 1813394,
//         //       "day_vol": 726188,
//         //       "supply": 11409706378,
//         //       "previous_close": "105.80",
//         //       "day_range": "908.71-718.70",
//         //       "revenue": 454616.57,
//         //       "EPS": 29377.23,
//         //       "yr_range": "453.70-758.72",
//         //       "PE_ratio": 67.3,
//         //       "ave_volume": 708928,
//         //       "dividend": "5.94"
//         //     },
//         //     {
//         //       "symbol": "PYPL",
//         //       "companyName": "PayPal Holdings Inc",
//         //       "prices": {
//         //         "create": [
//         //           {
//         //             "open": "403.86",
//         //             "close": "437.57",
//         //             "high": "191.49",
//         //             "low": "446.99",
//         //             "volume": "968399"
//         //           },
//         //           {
//         //             "open": "836.99",
//         //             "close": "364.99",
//         //             "high": "696.16",
//         //             "low": "657.37",
//         //             "volume": "225259"
//         //           }
//         //         ]
//         //       },
//         //       "day_change": "4.72",
//         //       "wk_change": "37.74",
//         //       "market_cap": 5470279,
//         //       "day_vol": 911704,
//         //       "supply": 52903793845,
//         //       "previous_close": "938.81",
//         //       "day_range": "797.09-372.15",
//         //       "revenue": 275452.95,
//         //       "EPS": 51162.83,
//         //       "yr_range": "480.55-654.35",
//         //       "PE_ratio": 55.5,
//         //       "ave_volume": 412450,
//         //       "dividend": "33.54"
//         //     },
//         //     {
//         //       "symbol": "PEP",
//         //       "companyName": "PepsiCo Inc.",
//         //       "prices": {
//         //         "create": [
//         //           {
//         //             "open": "370.58",
//         //             "close": "183.42",
//         //             "high": "828.25",
//         //             "low": "77.56",
//         //             "volume": "532044"
//         //           },
//         //           {
//         //             "open": "493.84",
//         //             "close": "659.75",
//         //             "high": "387.05",
//         //             "low": "641.90",
//         //             "volume": "450174"
//         //           }
//         //         ]
//         //       },
//         //       "day_change": "0.72",
//         //       "wk_change": "16.25",
//         //       "market_cap": 403409,
//         //       "day_vol": 224004,
//         //       "supply": 56100973328,
//         //       "previous_close": "650.45",
//         //       "day_range": "80.75-971.32",
//         //       "revenue": 700510.19,
//         //       "EPS": 39371.91,
//         //       "yr_range": "77.26-308.58",
//         //       "PE_ratio": 59.1,
//         //       "ave_volume": 482057,
//         //       "dividend": "11.94"
//         //     },
//         //     {
//         //       "symbol": "QCOM",
//         //       "companyName": "Qualcomm Inc",
//         //       "prices": {
//         //         "create": [
//         //           {
//         //             "open": "58.21",
//         //             "close": "958.45",
//         //             "high": "899.51",
//         //             "low": "1.38",
//         //             "volume": "815125"
//         //           },
//         //           {
//         //             "open": "273.10",
//         //             "close": "672.50",
//         //             "high": "750.77",
//         //             "low": "195.71",
//         //             "volume": "744482"
//         //           }
//         //         ]
//         //       },
//         //       "day_change": "14.50",
//         //       "wk_change": "46.94",
//         //       "market_cap": 9338266,
//         //       "day_vol": 360511,
//         //       "supply": 33474682595,
//         //       "previous_close": "789.00",
//         //       "day_range": "839.51-959.36",
//         //       "revenue": 800434.58,
//         //       "EPS": 6197.79,
//         //       "yr_range": "836.36-586.64",
//         //       "PE_ratio": 30.7,
//         //       "ave_volume": 872942,
//         //       "dividend": "41.96"
//         //     },
//         //     {
//         //       "symbol": "REGN",
//         //       "companyName": "Regeneron Pharmaceuticals Inc",
//         //       "prices": {
//         //         "create": [
//         //           {
//         //             "open": "315.43",
//         //             "close": "724.32",
//         //             "high": "835.01",
//         //             "low": "269.11",
//         //             "volume": "137155"
//         //           },
//         //           {
//         //             "open": "779.98",
//         //             "close": "338.31",
//         //             "high": "726.78",
//         //             "low": "253.40",
//         //             "volume": "357724"
//         //           }
//         //         ]
//         //       },
//         //       "day_change": "5.71",
//         //       "wk_change": "15.13",
//         //       "market_cap": 7291573,
//         //       "day_vol": 68334,
//         //       "supply": 92327383513,
//         //       "previous_close": "745.91",
//         //       "day_range": "25.98-643.79",
//         //       "revenue": 59459.53,
//         //       "EPS": 21048.95,
//         //       "yr_range": "924.32-697.53",
//         //       "PE_ratio": 91.2,
//         //       "ave_volume": 571781,
//         //       "dividend": "25.31"
//         //     },
//         //     {
//         //       "symbol": "ROST",
//         //       "companyName": "Ross Stores Inc",
//         //       "prices": {
//         //         "create": [
//         //           {
//         //             "open": "537.83",
//         //             "close": "811.65",
//         //             "high": "359.98",
//         //             "low": "820.20",
//         //             "volume": "122849"
//         //           },
//         //           {
//         //             "open": "501.51",
//         //             "close": "190.29",
//         //             "high": "138.46",
//         //             "low": "393.45",
//         //             "volume": "566024"
//         //           }
//         //         ]
//         //       },
//         //       "day_change": "7.43",
//         //       "wk_change": "38.35",
//         //       "market_cap": 7654672,
//         //       "day_vol": 254984,
//         //       "supply": 77007869238,
//         //       "previous_close": "516.49",
//         //       "day_range": "310.52-247.59",
//         //       "revenue": 973002.26,
//         //       "EPS": 30322.08,
//         //       "yr_range": "806.30-56.74",
//         //       "PE_ratio": 20.0,
//         //       "ave_volume": 189330,
//         //       "dividend": "21.71"
//         //     },
//         //     {
//         //       "symbol": "SIRI",
//         //       "companyName": "Sirius XM Holdings Inc",
//         //       "prices": {
//         //         "create": [
//         //           {
//         //             "open": "394.40",
//         //             "close": "357.92",
//         //             "high": "911.63",
//         //             "low": "876.06",
//         //             "volume": "347695"
//         //           },
//         //           {
//         //             "open": "539.50",
//         //             "close": "529.37",
//         //             "high": "315.97",
//         //             "low": "516.70",
//         //             "volume": "5554"
//         //           }
//         //         ]
//         //       },
//         //       "day_change": "19.34",
//         //       "wk_change": "28.64",
//         //       "market_cap": 7321356,
//         //       "day_vol": 64934,
//         //       "supply": 38567182854,
//         //       "previous_close": "345.80",
//         //       "day_range": "214.39-286.11",
//         //       "revenue": 119821.36,
//         //       "EPS": 25903.33,
//         //       "yr_range": "784.43-368.36",
//         //       "PE_ratio": 10.5,
//         //       "ave_volume": 339729,
//         //       "dividend": "14.66"
//         //     },
//         //     {
//         //       "symbol": "SGEN",
//         //       "companyName": "Seagen Inc",
//         //       "prices": {
//         //         "create": [
//         //           {
//         //             "open": "257.19",
//         //             "close": "117.03",
//         //             "high": "874.69",
//         //             "low": "41.70",
//         //             "volume": "264864"
//         //           },
//         //           {
//         //             "open": "518.00",
//         //             "close": "60.07",
//         //             "high": "129.77",
//         //             "low": "448.18",
//         //             "volume": "779153"
//         //           }
//         //         ]
//         //       },
//         //       "day_change": "11.64",
//         //       "wk_change": "17.91",
//         //       "market_cap": 1636015,
//         //       "day_vol": 918578,
//         //       "supply": 47163972002,
//         //       "previous_close": "414.17",
//         //       "day_range": "229.12-6.25",
//         //       "revenue": 311128.91,
//         //       "EPS": 14683.72,
//         //       "yr_range": "917.78-157.09",
//         //       "PE_ratio": 36.9,
//         //       "ave_volume": 264936,
//         //       "dividend": "16.53"
//         //     },
//         //     {
//         //       "symbol": "SPLK",
//         //       "companyName": "Splunk Inc",
//         //       "prices": {
//         //         "create": [
//         //           {
//         //             "open": "714.47",
//         //             "close": "747.81",
//         //             "high": "839.42",
//         //             "low": "345.66",
//         //             "volume": "303346"
//         //           },
//         //           {
//         //             "open": "19.53",
//         //             "close": "926.06",
//         //             "high": "449.68",
//         //             "low": "202.41",
//         //             "volume": "359242"
//         //           }
//         //         ]
//         //       },
//         //       "day_change": "7.04",
//         //       "wk_change": "32.82",
//         //       "market_cap": 1069991,
//         //       "day_vol": 900684,
//         //       "supply": 50984722350,
//         //       "previous_close": "411.79",
//         //       "day_range": "65.41-983.29",
//         //       "revenue": 297425.59,
//         //       "EPS": 79986.01,
//         //       "yr_range": "772.56-512.84",
//         //       "PE_ratio": 88.4,
//         //       "ave_volume": 595449,
//         //       "dividend": "27.89"
//         //     },
//         //     {
//         //       "symbol": "SWKS",
//         //       "companyName": "Skyworks Solutions Inc",
//         //       "prices": {
//         //         "create": [
//         //           {
//         //             "open": "639.05",
//         //             "close": "706.37",
//         //             "high": "382.06",
//         //             "low": "354.06",
//         //             "volume": "582664"
//         //           },
//         //           {
//         //             "open": "372.96",
//         //             "close": "620.27",
//         //             "high": "796.95",
//         //             "low": "378.92",
//         //             "volume": "741156"
//         //           }
//         //         ]
//         //       },
//         //       "day_change": "2.01",
//         //       "wk_change": "29.11",
//         //       "market_cap": 6788513,
//         //       "day_vol": 235672,
//         //       "supply": 6525808627,
//         //       "previous_close": "507.41",
//         //       "day_range": "684.52-298.46",
//         //       "revenue": 953083.88,
//         //       "EPS": 37226.62,
//         //       "yr_range": "143.98-577.26",
//         //       "PE_ratio": 50.6,
//         //       "ave_volume": 808642,
//         //       "dividend": "48.43"
//         //     },
//         //     {
//         //       "symbol": "SBUX",
//         //       "companyName": "Starbucks Corp",
//         //       "prices": {
//         //         "create": [
//         //           {
//         //             "open": "497.24",
//         //             "close": "937.53",
//         //             "high": "21.74",
//         //             "low": "336.27",
//         //             "volume": "222272"
//         //           },
//         //           {
//         //             "open": "762.81",
//         //             "close": "200.66",
//         //             "high": "719.39",
//         //             "low": "693.79",
//         //             "volume": "488041"
//         //           }
//         //         ]
//         //       },
//         //       "day_change": "11.89",
//         //       "wk_change": "11.40",
//         //       "market_cap": 6531787,
//         //       "day_vol": 434146,
//         //       "supply": 87216759601,
//         //       "previous_close": "965.03",
//         //       "day_range": "62.12-76.77",
//         //       "revenue": 563253.11,
//         //       "EPS": 41694.41,
//         //       "yr_range": "356.71-819.83",
//         //       "PE_ratio": 61.4,
//         //       "ave_volume": 948366,
//         //       "dividend": "29.40"
//         //     },
//         //     {
//         //       "symbol": "SNPS",
//         //       "companyName": "Synopsys Inc",
//         //       "prices": {
//         //         "create": [
//         //           {
//         //             "open": "737.07",
//         //             "close": "727.53",
//         //             "high": "289.21",
//         //             "low": "517.73",
//         //             "volume": "994022"
//         //           },
//         //           {
//         //             "open": "574.98",
//         //             "close": "788.49",
//         //             "high": "935.81",
//         //             "low": "643.35",
//         //             "volume": "707898"
//         //           }
//         //         ]
//         //       },
//         //       "day_change": "12.00",
//         //       "wk_change": "10.04",
//         //       "market_cap": 6845081,
//         //       "day_vol": 855730,
//         //       "supply": 68061111592,
//         //       "previous_close": "896.64",
//         //       "day_range": "338.78-459.88",
//         //       "revenue": 395643.86,
//         //       "EPS": 91619.97,
//         //       "yr_range": "167.41-706.77",
//         //       "PE_ratio": 80.4,
//         //       "ave_volume": 775127,
//         //       "dividend": "9.93"
//         //     },
//         //     {
//         //       "symbol": "TCOM",
//         //       "companyName": "Trip.com Group Ltd",
//         //       "prices": {
//         //         "create": [
//         //           {
//         //             "open": "595.16",
//         //             "close": "563.17",
//         //             "high": "433.33",
//         //             "low": "850.70",
//         //             "volume": "936719"
//         //           },
//         //           {
//         //             "open": "421.65",
//         //             "close": "83.46",
//         //             "high": "925.72",
//         //             "low": "456.74",
//         //             "volume": "516812"
//         //           }
//         //         ]
//         //       },
//         //       "day_change": "6.95",
//         //       "wk_change": "20.60",
//         //       "market_cap": 9392677,
//         //       "day_vol": 258825,
//         //       "supply": 7911284568,
//         //       "previous_close": "461.43",
//         //       "day_range": "111.68-970.54",
//         //       "revenue": 14830.34,
//         //       "EPS": 10810.65,
//         //       "yr_range": "935.53-900.94",
//         //       "PE_ratio": 51.1,
//         //       "ave_volume": 649416,
//         //       "dividend": "28.38"
//         //     },
//         //     {
//         //       "symbol": "TSLA",
//         //       "companyName": "Tesla Inc",
//         //       "prices": {
//         //         "create": [
//         //           {
//         //             "open": "307.58",
//         //             "close": "928.52",
//         //             "high": "327.82",
//         //             "low": "831.24",
//         //             "volume": "603706"
//         //           },
//         //           {
//         //             "open": "582.95",
//         //             "close": "814.44",
//         //             "high": "191.87",
//         //             "low": "46.70",
//         //             "volume": "892742"
//         //           }
//         //         ]
//         //       },
//         //       "day_change": "1.45",
//         //       "wk_change": "40.75",
//         //       "market_cap": 9032943,
//         //       "day_vol": 567114,
//         //       "supply": 52066754706,
//         //       "previous_close": "610.68",
//         //       "day_range": "225.12-389.99",
//         //       "revenue": 21107.60,
//         //       "EPS": 96756.36,
//         //       "yr_range": "501.83-131.91",
//         //       "PE_ratio": 5.8,
//         //       "ave_volume": 158639,
//         //       "dividend": "45.93"
//         //     },
//         //     {
//         //       "symbol": "TXN",
//         //       "companyName": "Texas Instruments Inc",
//         //       "prices": {
//         //         "create": [
//         //           {
//         //             "open": "934.38",
//         //             "close": "173.10",
//         //             "high": "315.04",
//         //             "low": "688.41",
//         //             "volume": "412870"
//         //           },
//         //           {
//         //             "open": "315.41",
//         //             "close": "66.85",
//         //             "high": "814.48",
//         //             "low": "914.25",
//         //             "volume": "56106"
//         //           }
//         //         ]
//         //       },
//         //       "day_change": "19.83",
//         //       "wk_change": "21.93",
//         //       "market_cap": 9222202,
//         //       "day_vol": 951316,
//         //       "supply": 39715987174,
//         //       "previous_close": "253.12",
//         //       "day_range": "591.56-450.77",
//         //       "revenue": 504456.57,
//         //       "EPS": 58067.51,
//         //       "yr_range": "718.12-538.46",
//         //       "PE_ratio": 34.6,
//         //       "ave_volume": 691749,
//         //       "dividend": "25.60"
//         //     },
//         //     {
//         //       "symbol": "TMUS",
//         //       "companyName": "T-Mobile US Inc",
//         //       "prices": {
//         //         "create": [
//         //           {
//         //             "open": "582.92",
//         //             "close": "897.35",
//         //             "high": "458.27",
//         //             "low": "125.67",
//         //             "volume": "140631"
//         //           },
//         //           {
//         //             "open": "996.55",
//         //             "close": "533.84",
//         //             "high": "18.41",
//         //             "low": "893.32",
//         //             "volume": "399633"
//         //           }
//         //         ]
//         //       },
//         //       "day_change": "18.46",
//         //       "wk_change": "18.47",
//         //       "market_cap": 3129074,
//         //       "day_vol": 1341,
//         //       "supply": 16049772192,
//         //       "previous_close": "636.18",
//         //       "day_range": "311.68-866.78",
//         //       "revenue": 902826.24,
//         //       "EPS": 15861.61,
//         //       "yr_range": "283.48-137.90",
//         //       "PE_ratio": 62.3,
//         //       "ave_volume": 365465,
//         //       "dividend": "43.52"
//         //     },
//         //     {
//         //       "symbol": "VRSN",
//         //       "companyName": "Verisign Inc",
//         //       "prices": {
//         //         "create": [
//         //           {
//         //             "open": "671.96",
//         //             "close": "295.03",
//         //             "high": "121.04",
//         //             "low": "191.69",
//         //             "volume": "112150"
//         //           },
//         //           {
//         //             "open": "761.53",
//         //             "close": "138.41",
//         //             "high": "780.87",
//         //             "low": "458.69",
//         //             "volume": "238086"
//         //           }
//         //         ]
//         //       },
//         //       "day_change": "1.63",
//         //       "wk_change": "30.13",
//         //       "market_cap": 280097,
//         //       "day_vol": 229239,
//         //       "supply": 81641100930,
//         //       "previous_close": "387.64",
//         //       "day_range": "664.34-324.46",
//         //       "revenue": 410876.46,
//         //       "EPS": 30562.48,
//         //       "yr_range": "227.11-374.61",
//         //       "PE_ratio": 96.3,
//         //       "ave_volume": 6077,
//         //       "dividend": "3.91"
//         //     },
//         //     {
//         //       "symbol": "VRSK",
//         //       "companyName": "Verisk Analytics Inc",
//         //       "prices": {
//         //         "create": [
//         //           {
//         //             "open": "746.39",
//         //             "close": "618.66",
//         //             "high": "891.17",
//         //             "low": "745.96",
//         //             "volume": "750842"
//         //           },
//         //           {
//         //             "open": "284.27",
//         //             "close": "971.38",
//         //             "high": "620.72",
//         //             "low": "528.31",
//         //             "volume": "449191"
//         //           }
//         //         ]
//         //       },
//         //       "day_change": "0.05",
//         //       "wk_change": "29.02",
//         //       "market_cap": 1889214,
//         //       "day_vol": 39261,
//         //       "supply": 52807029965,
//         //       "previous_close": "56.44",
//         //       "day_range": "822.74-230.50",
//         //       "revenue": 766477.84,
//         //       "EPS": 63782.62,
//         //       "yr_range": "747.69-972.24",
//         //       "PE_ratio": 44.6,
//         //       "ave_volume": 709651,
//         //       "dividend": "44.49"
//         //     },
//         //     {
//         //       "symbol": "VRTX",
//         //       "companyName": "Vertex Pharmaceuticals Inc",
//         //       "prices": {
//         //         "create": [
//         //           {
//         //             "open": "87.82",
//         //             "close": "611.26",
//         //             "high": "838.62",
//         //             "low": "600.56",
//         //             "volume": "156109"
//         //           },
//         //           {
//         //             "open": "211.22",
//         //             "close": "29.05",
//         //             "high": "553.95",
//         //             "low": "78.16",
//         //             "volume": "546157"
//         //           }
//         //         ]
//         //       },
//         //       "day_change": "6.18",
//         //       "wk_change": "16.39",
//         //       "market_cap": 6901457,
//         //       "day_vol": 651096,
//         //       "supply": 66667923176,
//         //       "previous_close": "124.38",
//         //       "day_range": "688.48-139.75",
//         //       "revenue": 693352.12,
//         //       "EPS": 49936.11,
//         //       "yr_range": "546.04-108.93",
//         //       "PE_ratio": 44.1,
//         //       "ave_volume": 875115,
//         //       "dividend": "15.00"
//         //     },
//         //     {
//         //       "symbol": "WBA",
//         //       "companyName": "Walgreens Boots Alliance Inc",
//         //       "prices": {
//         //         "create": [
//         //           {
//         //             "open": "410.42",
//         //             "close": "726.02",
//         //             "high": "181.72",
//         //             "low": "119.12",
//         //             "volume": "13517"
//         //           },
//         //           {
//         //             "open": "29.67",
//         //             "close": "430.34",
//         //             "high": "132.30",
//         //             "low": "704.58",
//         //             "volume": "722789"
//         //           }
//         //         ]
//         //       },
//         //       "day_change": "0.54",
//         //       "wk_change": "30.37",
//         //       "market_cap": 3066778,
//         //       "day_vol": 420169,
//         //       "supply": 2158536044,
//         //       "previous_close": "319.76",
//         //       "day_range": "351.82-54.85",
//         //       "revenue": 756745.88,
//         //       "EPS": 48037.18,
//         //       "yr_range": "536.79-895.78",
//         //       "PE_ratio": 93.8,
//         //       "ave_volume": 129639,
//         //       "dividend": "44.83"
//         //     },
//         //     {
//         //       "symbol": "WDAY",
//         //       "companyName": "Workday Inc",
//         //       "prices": {
//         //         "create": [
//         //           {
//         //             "open": "700.18",
//         //             "close": "166.92",
//         //             "high": "511.34",
//         //             "low": "871.59",
//         //             "volume": "354572"
//         //           },
//         //           {
//         //             "open": "919.98",
//         //             "close": "871.24",
//         //             "high": "71.76",
//         //             "low": "891.92",
//         //             "volume": "263615"
//         //           }
//         //         ]
//         //       },
//         //       "day_change": "3.17",
//         //       "wk_change": "20.53",
//         //       "market_cap": 8132691,
//         //       "day_vol": 390085,
//         //       "supply": 10025640310,
//         //       "previous_close": "390.09",
//         //       "day_range": "66.13-904.21",
//         //       "revenue": 315540.51,
//         //       "EPS": 62164.80,
//         //       "yr_range": "347.78-908.89",
//         //       "PE_ratio": 75.5,
//         //       "ave_volume": 818905,
//         //       "dividend": "4.97"
//         //     },
//         //     {
//         //       "symbol": "XEL",
//         //       "companyName": "Xcel Energy Inc",
//         //       "prices": {
//         //         "create": [
//         //           {
//         //             "open": "168.15",
//         //             "close": "536.06",
//         //             "high": "483.76",
//         //             "low": "567.90",
//         //             "volume": "871022"
//         //           },
//         //           {
//         //             "open": "552.06",
//         //             "close": "348.95",
//         //             "high": "919.51",
//         //             "low": "291.18",
//         //             "volume": "216118"
//         //           }
//         //         ]
//         //       },
//         //       "day_change": "15.41",
//         //       "wk_change": "39.11",
//         //       "market_cap": 6533987,
//         //       "day_vol": 20681,
//         //       "supply": 84540074802,
//         //       "previous_close": "874.61",
//         //       "day_range": "174.20-850.26",
//         //       "revenue": 422923.28,
//         //       "EPS": 20483.91,
//         //       "yr_range": "271.42-294.12",
//         //       "PE_ratio": 45.9,
//         //       "ave_volume": 739926,
//         //       "dividend": "22.59"
//         //     },
//         //     {
//         //       "symbol": "XLNX",
//         //       "companyName": "Xilinx Inc",
//         //       "prices": {
//         //         "create": [
//         //           {
//         //             "open": "8.83",
//         //             "close": "581.14",
//         //             "high": "907.41",
//         //             "low": "827.10",
//         //             "volume": "495572"
//         //           },
//         //           {
//         //             "open": "280.61",
//         //             "close": "8.90",
//         //             "high": "394.39",
//         //             "low": "153.28",
//         //             "volume": "536776"
//         //           }
//         //         ]
//         //       },
//         //       "day_change": "3.75",
//         //       "wk_change": "10.28",
//         //       "market_cap": 7890113,
//         //       "day_vol": 68336,
//         //       "supply": 17146896730,
//         //       "previous_close": "544.34",
//         //       "day_range": "41.93-336.51",
//         //       "revenue": 586671.57,
//         //       "EPS": 91371.48,
//         //       "yr_range": "629.22-133.08",
//         //       "PE_ratio": 59.7,
//         //       "ave_volume": 101138,
//         //       "dividend": "5.06"
//         //     },
//         //     {
//         //       "symbol": "ZM",
//         //       "companyName": "Zoom Video Communications Inc",
//         //       "prices": {
//         //         "create": [
//         //           {
//         //             "open": "293.89",
//         //             "close": "175.27",
//         //             "high": "143.44",
//         //             "low": "1.22",
//         //             "volume": "8343"
//         //           },
//         //           {
//         //             "open": "284.74",
//         //             "close": "129.01",
//         //             "high": "541.30",
//         //             "low": "52.12",
//         //             "volume": "480825"
//         //           }
//         //         ]
//         //       },
//         //       "day_change": "11.52",
//         //       "wk_change": "40.63",
//         //       "market_cap": 4772822,
//         //       "day_vol": 813255,
//         //       "supply": 21959991109,
//         //       "previous_close": "185.35",
//         //       "day_range": "534.42-203.85",
//         //       "revenue": 939659.99,
//         //       "EPS": 83614.56,
//         //       "yr_range": "25.69-258.42",
//         //       "PE_ratio": 61.3,
//         //       "ave_volume": 649104,
//         //       "dividend": "33.71"
//         //     }
//         //   ]
//         //   await Promise.all(
//         //     data.map(async item => {
//         //       await prisma.stocks.create({
//         //         data: item,
//         //       })
//         //     })
//         //   )
//         //   data.forEach(async item => {
//         //       await prisma.stocks.create({
//         //           data: item
//         //       })
//         //   })
//         // const allStocks = await prisma.stocks.findMany({ include: { prices: true } })
//         // console.log(allStocks)
//     } catch (error) {
//         console.log("error ------->", error);
//     }
// }

// main()
