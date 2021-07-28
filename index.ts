// const { ApolloServer } = require("apollo-server");
const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { GraphQLJSON } = require("graphql-type-json");
const { ApolloServer } = require("apollo-server-express");
const compression = require("compression");
const prisma = new PrismaClient();

const app = express();
app.use(compression());
// 1
const typeDefs = `
scalar JSON

type Query {
  stocks(filter: FilterStocks, search: String, skip: Int, take: Int,orderBy: StocksOrderBy): Stock!
  stockInfoQuery(symbol: String, stockId: Int):Stocks!
  userQuery(userId: Int!): User!
  price: [Price!]!
  chart_timeframe: Chart_TimeFrame
  tech_timeframe: Tech_TimeFrame
}

type Mutation {
  bookmark(userId: Int!, stockId: Int!, status: BookMarkStatus!): User!
}

type Stock {
  stocks: [Stocks!]!
  count: Int!
}

type StockInfo {
  id: Int
  stocksId: Int
  previous_close:Float
  open:Float
  volume:Float
  ave_volume:Float
  day_min:Float
  day_max:Float
  yearly_min:Float
  yearly_max:Float
}

type Stocks {
  id:Int
  symbol:String
  companyName:String
  day_change:Float
  wk_change:Float
  market_cap:Float
  day_vol:Int
  supply:Float
  previous_close:Float
  day_range:String
  revenue:Float
  EPS:Float
  yr_range:String
  PE_ratio:Float
  ave_volume:Float
  dividend:Float
  prices:JSON
  stockInfo: StockInfo
}

type Price {
  prices: JSON,
  date: String
}

type User {
  id:Int
  bookmarks: JSON
}

input StocksOrderBy {
  PE_ratio: Sort
  dividend: Sort
  companyName: Sort
  symbol: Sort
  day_change: Sort
  previous_close: Sort
  wk_change: Sort
  market_cap: Sort
  ave_volume: Sort
}

input FilterStocks {
  market_cap: Filter,
  previous_close: Filter,
  day_change: Filter,
  ave_volume: Filter,
  supply: Filter
}

input Filter {
  low: Float,
  high: Float
}

enum Sort {
  asc
  desc
}

enum BookMarkStatus {
  Add
  Remove
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

interface CustomObject {
  [key: string]: any;
}
// 2
const resolvers = {
  JSON: GraphQLJSON,
  Query: {
    stocks: async (parent: any, args: any, context: any) => {
      const filter = args.filter;
      const where: CustomObject = {};
      for (const key in filter) {
        if (Object.prototype.hasOwnProperty.call(filter, key)) {
          const element = filter[key];
          // where[key] = {}
          // if (element.high) {
          //   where[key]['lte'] = element.high
          // }
          // if (element.low) {
          //   where[key]['gte'] = element.low
          // }
          where[key] = {
            lte: element.high,
            gte: element.low,
          };
        }
      }
      if (args.search) {
        where["OR"] = [
          { companyName: { contains: args.search, mode: "insensitive" } },
          { symbol: { contains: args.search, mode: "insensitive" } },
        ];
      }
      // const where = args.filter
      //   ? {
      //       OR: [
      //         { companyName: { contains: args.filter, mode: "insensitive" } },
      //         { symbol: { contains: args.filter, mode: "insensitive" } },
      //       ],
      //     }
      //   : {};
      const stocksResult = await context.prisma.stocks.findMany({
        where,
        skip: args.skip,
        take: args.take,
        orderBy: args.orderBy,
        include: { prices: true },
      });

      stocksResult.forEach((element: { prices: CustomObject }) => {
        const priceJson: CustomObject = {};
        element.prices.forEach((priceElem: any) => {
          priceJson[priceElem.prices[0].dateTime] = {
            low: priceElem.prices[0].low,
            high: priceElem.prices[0].high,
            open: priceElem.prices[0].open,
            close: priceElem.prices[0].close,
            volume: priceElem.prices[0].volume,
          };
        });
        element.prices = priceJson;
      });

      return {
        stocks: stocksResult,
        count: context.prisma.stocks.count({ where }),
      };
    },
    // price: async (parent: any, args: any, context: any) => {
    //   console.log("-------> ", parent);

    //   return context.prisma.price.findMany({where: {stocksId: parent.id}})
    // }
    stockInfoQuery: async (parent: any, args: any, context: any) => {
      const symbol = args.symbol;
      const stockId = args.stockId;
      const where: CustomObject = {};
      if (symbol) {
        where["symbol"] = symbol;
      }
      if (stockId) {
        where["id"] = stockId;
      }
      const stockResult = await context.prisma.stocks.findFirst({
        where,
        include: {
          prices: true,
          stockInfo: true,
        },
      });

      const priceJson: CustomObject = {};
      stockResult.prices.forEach((priceElem: any) => {
        priceJson[priceElem.prices[0].dateTime] = {
          low: priceElem.prices[0].low,
          high: priceElem.prices[0].high,
          open: priceElem.prices[0].open,
          close: priceElem.prices[0].close,
          volume: priceElem.prices[0].volume,
        };
      });
      stockResult.prices = priceJson;

      return stockResult
    },
    userQuery: async (parent: any, args: any, context: any) => {
      const { userId } = args
      return context.prisma.user.findUnique({
        where: {
          id: userId
        }
      })
    }
  },
  Mutation: {
    bookmark: async (root: any, args: any, context: any) => {
      const { userId, stockId, status } = args
      if (!userId || !stockId || !status) {
        return {}
      }
      const fetchUserData = await context.prisma.user.findUnique({
        where: {
          id: userId
        }
      })
      const bookmarkData = fetchUserData.bookmarks || []
      if (status === 'Add') {
        if (bookmarkData.includes(stockId)) {
          return fetchUserData
        } else {
          bookmarkData.push(stockId)
        }
      } else {
        const indexOfStock = bookmarkData.indexOf(stockId)
        if (indexOfStock > -1) {
          bookmarkData.splice(indexOfStock, 1)
        } else {
          return fetchUserData
        }
      }
      const updatedUser = await context.prisma.user.update({
        where: {
          id: userId
        },
        data: {
          bookmarks: bookmarkData
        }
      })
      return updatedUser
    }
  }
};

const startApolloServer = async () => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: {
      prisma,
    },
    introspection: true,
    playground: true,
  });
  await server.start();

  server.applyMiddleware({ app });

  app.use((_req: any, res: any) => {
    res.status(200);
    res.send("Hello!");
    res.end();
  });
  await new Promise((resolve) =>
    app.listen({ port: process.env.PORT }, resolve)
  );
  console.log(`🚀 Server ready at ${process.env.PORT}`);
  return { server, app };
};
// 3
startApolloServer();
// server
//   .listen(process.env.PORT)
//   .then(({ url }: { url: string }) =>
//     console.log(`Server is running on ${url}`)
//   );

// import { PrismaClient } from '@prisma/client'

// const prisma = new PrismaClient()

// const main = async () => {
//   try {
//     const data = [
//       {
//         symbol: "ATVI",
//         companyName: "Activision Blizzard Inc",
//         // prices: {},
//         day_change: 14.57,
//         wk_change: 10.69,
//         market_cap: 3467978,
//         day_vol: 598746,
//         supply: 46942671839,
//         previous_close: 90.1,
//         day_range: "80.16-842.66",
//         revenue: 536052.02,
//         EPS: 33715.67,
//         yr_range: "435.52-744.23",
//         PE_ratio: 23.1,
//         ave_volume: 665638,
//         dividend: 1.75,
//       },
//       {
//         symbol: "AMD",
//         companyName: "Advanced Micro Devices Inc",
//         prices: {},
//         day_change: 11.89,
//         wk_change: 45.07,
//         market_cap: 4000197,
//         day_vol: 392524,
//         supply: 74027237278,
//         previous_close: 859.87,
//         day_range: "881.33-220.00",
//         revenue: 587414.3,
//         EPS: 54555.2,
//         yr_range: "842.57-444.50",
//         PE_ratio: 52.1,
//         ave_volume: 173882,
//         dividend: 21.67,
//       },
//       {
//         symbol: "ADBE",
//         companyName: "Adobe Inc.",
//         prices: {},
//         day_change: 12.15,
//         wk_change: 13.51,
//         market_cap: 8272478,
//         day_vol: 237468,
//         supply: 35660108378,
//         previous_close: 190.5,
//         day_range: "421.41-243.35",
//         revenue: 923539.84,
//         EPS: 18932.79,
//         yr_range: "929.63-812.53",
//         PE_ratio: 18.6,
//         ave_volume: 8456,
//         dividend: 22.19,
//       },
//       {
//         symbol: "ALGN",
//         companyName: "Align Technology Inc",
//         prices: {},
//         day_change: 9.44,
//         wk_change: 42.84,
//         market_cap: 5753290,
//         day_vol: 272784,
//         supply: 85813809056,
//         previous_close: 554.27,
//         day_range: "257.74-4.53",
//         revenue: 434113.52,
//         EPS: 40554.87,
//         yr_range: "686.57-776.02",
//         PE_ratio: 9.2,
//         ave_volume: 8532,
//         dividend: 10.22,
//       },
//       {
//         symbol: "ALXN",
//         companyName: "Alexion Pharmaceuticals Inc",
//         prices: {},
//         day_change: 7.35,
//         wk_change: 44.83,
//         market_cap: 6508761,
//         day_vol: 687597,
//         supply: 50844139824,
//         previous_close: 883.9,
//         day_range: "699.49-803.75",
//         revenue: 801235.04,
//         EPS: 10813.71,
//         yr_range: "343.98-242.57",
//         PE_ratio: 67.9,
//         ave_volume: 480908,
//         dividend: 48.24,
//       },
//       {
//         symbol: "AMZN",
//         companyName: "Amazon.com Inc",
//         prices: {},
//         day_change: 14.57,
//         wk_change: 0.52,
//         market_cap: 2903656,
//         day_vol: 907665,
//         supply: 95363799769,
//         previous_close: 256.8,
//         day_range: "959.54-72.76",
//         revenue: 686665.33,
//         EPS: 39053.28,
//         yr_range: "589.37-951.62",
//         PE_ratio: 40.9,
//         ave_volume: 39943,
//         dividend: 32.39,
//       },
//       {
//         symbol: "AMGN",
//         companyName: "Amgen Inc",
//         prices: {},
//         day_change: 7.05,
//         wk_change: 3.99,
//         market_cap: 2194888,
//         day_vol: 311442,
//         supply: 20098319881,
//         previous_close: 190.25,
//         day_range: "438.87-568.64",
//         revenue: 972623.24,
//         EPS: 65864.42,
//         yr_range: "61.42-691.82",
//         PE_ratio: 32.2,
//         ave_volume: 500863,
//         dividend: 17.43,
//       },
//       {
//         symbol: "AEP",
//         companyName: "American Electric Power Company Inc",
//         prices: {},
//         day_change: 18.13,
//         wk_change: 13.91,
//         market_cap: 9430318,
//         day_vol: 844536,
//         supply: 82795536270,
//         previous_close: 970.13,
//         day_range: "326.93-495.16",
//         revenue: 457157.41,
//         EPS: 68820.95,
//         yr_range: "184.51-81.15",
//         PE_ratio: 46.6,
//         ave_volume: 980671,
//         dividend: 29.33,
//       },
//       {
//         symbol: "ADI",
//         companyName: "Analog Devices Inc",
//         prices: {},
//         day_change: 13.95,
//         wk_change: 49.70,
//         market_cap: 1590667,
//         day_vol: 881045,
//         supply: 44011589588,
//         previous_close: 620.84,
//         day_range: "392.79-538.94",
//         revenue: 309701.76,
//         EPS: 6177.66,
//         yr_range: "954.25-941.44",
//         PE_ratio: 52.6,
//         ave_volume: 203539,
//         dividend: 44.95,
//       },
//       {
//         symbol: "ANSS",
//         companyName: "ANSYS Inc",
//         prices: {},
//         day_change: 19.31,
//         wk_change: 20.93,
//         market_cap: 1713057,
//         day_vol: 444852,
//         supply: 84916705049,
//         previous_close: 759.3,
//         day_range: "830.75-683.22",
//         revenue: 24190.6,
//         EPS: 50771.45,
//         yr_range: "949.56-902.10",
//         PE_ratio: 70.3,
//         ave_volume: 942088,
//         dividend: 8.58,
//       },
//       {
//         symbol: "AAPL",
//         companyName: "Apple Inc",
//         prices: {},
//         day_change: 14.33,
//         wk_change: 25.06,
//         market_cap: 4927569,
//         day_vol: 206953,
//         supply: 8459834730,
//         previous_close: 638.54,
//         day_range: "800.40-746.10",
//         revenue: 4132.68,
//         EPS: 42822.07,
//         yr_range: "981.49-972.25",
//         PE_ratio: 96.7,
//         ave_volume: 901783,
//         dividend: 26.41,
//       },
//       {
//         symbol: "AMAT",
//         companyName: "Applied Materials Inc",
//         prices: {},
//         day_change: 6.84,
//         wk_change: 27.20,
//         market_cap: 9441139,
//         day_vol: 420885,
//         supply: 87518328149,
//         previous_close: 838.93,
//         day_range: "954.40-709.23",
//         revenue: 312337.17,
//         EPS: 37111.16,
//         yr_range: "762.23-116.00",
//         PE_ratio: 34.0,
//         ave_volume: 71275,
//         dividend: 48.6,
//       },
//       {
//         symbol: "ASML",
//         companyName: "ASML Holding NV",
//         prices: {},
//         day_change: 5.74,
//         wk_change: 24.14,
//         market_cap: 4247990,
//         day_vol: 952646,
//         supply: 93587940223,
//         previous_close: 479.49,
//         day_range: "840.50-114.99",
//         revenue: 439424.91,
//         EPS: 58180.66,
//         yr_range: "289.82-57.40",
//         PE_ratio: 37.4,
//         ave_volume: 588251,
//         dividend: 45.41,
//       },
//       {
//         symbol: "TEAM",
//         companyName: "Atlassian Corporation PLC",
//         prices: {},
//         day_change: 17.74,
//         wk_change: 28.61,
//         market_cap: 5609573,
//         day_vol: 145040,
//         supply: 28495060014,
//         previous_close: 71.86,
//         day_range: "179.89-555.04",
//         revenue: 625929.95,
//         EPS: 47664.91,
//         yr_range: "177.88-470.97",
//         PE_ratio: 88.2,
//         ave_volume: 357004,
//         dividend: 1.15,
//       },
//       {
//         symbol: "ADSK",
//         companyName: "Autodesk Inc",
//         prices: {},
//         day_change: 7.82,
//         wk_change: 7.05,
//         market_cap: 4942798,
//         day_vol: 633495,
//         supply: 50822560431,
//         previous_close: 559.69,
//         day_range: "24.83-244.32",
//         revenue: 597836.21,
//         EPS: 85036.01,
//         yr_range: "665.86-128.44",
//         PE_ratio: 63.9,
//         ave_volume: 384756,
//         dividend: 45.52,
//       },
//       {
//         symbol: "ADP",
//         companyName: "Automatic Data Processing Inc",
//         prices: {},
//         day_change: 18.41,
//         wk_change: 31.88,
//         market_cap: 1125172,
//         day_vol: 651921,
//         supply: 38460217061,
//         previous_close: 528.72,
//         day_range: "758.71-870.84",
//         revenue: 868418.19,
//         EPS: 72879.42,
//         yr_range: "470.82-494.48",
//         PE_ratio: 58.9,
//         ave_volume: 398574,
//         dividend: 24.29,
//       },
//       {
//         symbol: "AVGO",
//         companyName: "Broadcom Inc",
//         prices: {},
//         day_change: 12.45,
//         wk_change: 35.70,
//         market_cap: 2766408,
//         day_vol: 317745,
//         supply: 29924253892,
//         previous_close: 215.45,
//         day_range: "350.92-836.19",
//         revenue: 307751.39,
//         EPS: 34594.2,
//         yr_range: "153.07-938.01",
//         PE_ratio: 79.9,
//         ave_volume: 841468,
//         dividend: 4.59,
//       },
//       {
//         symbol: "BIDU",
//         companyName: "Baidu Inc",
//         prices: {},
//         day_change: 12.58,
//         wk_change: 8.49,
//         market_cap: 2269344,
//         day_vol: 100705,
//         supply: 54078312669,
//         previous_close: 270.18,
//         day_range: "946.07-552.49",
//         revenue: 213193.57,
//         EPS: 47384.39,
//         yr_range: "326.39-792.73",
//         PE_ratio: 84.0,
//         ave_volume: 623741,
//         dividend: 21.3,
//       },
//       {
//         symbol: "BIIB",
//         companyName: "Biogen Inc",
//         prices: {},
//         day_change: 4.59,
//         wk_change: 41.63,
//         market_cap: 3392627,
//         day_vol: 722862,
//         supply: 34829255519,
//         previous_close: 276.45,
//         day_range: "667.68-357.48",
//         revenue: 345591.5,
//         EPS: 52357.12,
//         yr_range: "820.53-481.79",
//         PE_ratio: 33.3,
//         ave_volume: 726692,
//         dividend: 5.6,
//       },
//       {
//         symbol: "BMRN",
//         companyName: "Biomarin Pharmaceutical Inc",
//         prices: {},
//         day_change: 3.96,
//         wk_change: 28.25,
//         market_cap: 8401632,
//         day_vol: 854491,
//         supply: 22445073205,
//         previous_close: 582.74,
//         day_range: "73.95-826.50",
//         revenue: 252787.89,
//         EPS: 80016.58,
//         yr_range: "375.71-77.27",
//         PE_ratio: 66.0,
//         ave_volume: 934219,
//         dividend: 41.16,
//       },
//       {
//         symbol: "BKNG",
//         companyName: "Booking Holdings Inc",
//         prices: {},
//         day_change: 3.1,
//         wk_change: 36.96,
//         market_cap: 2119089,
//         day_vol: 164818,
//         supply: 72678609472,
//         previous_close: 319.29,
//         day_range: "559.00-628.86",
//         revenue: 534472.19,
//         EPS: 56082.28,
//         yr_range: "920.24-37.64",
//         PE_ratio: 39.4,
//         ave_volume: 584284,
//         dividend: 3.19,
//       },
//       {
//         symbol: "CDNS",
//         companyName: "Cadence Design Systems Inc",
//         prices: {},
//         day_change: 14.28,
//         wk_change: 16.35,
//         market_cap: 367614,
//         day_vol: 569395,
//         supply: 2418680424,
//         previous_close: 335.91,
//         day_range: "739.33-755.63",
//         revenue: 17442.52,
//         EPS: 71782.08,
//         yr_range: "494.33-814.52",
//         PE_ratio: 23.9,
//         ave_volume: 427330,
//         dividend: 43.62,
//       },
//       {
//         symbol: "CDW",
//         companyName: "CDW Corp",
//         prices: {},
//         day_change: 15.4,
//         wk_change: 1.07,
//         market_cap: 4132433,
//         day_vol: 390715,
//         supply: 40121095417,
//         previous_close: 82.74,
//         day_range: "878.42-952.28",
//         revenue: 637787.66,
//         EPS: 44097.83,
//         yr_range: "432.55-786.91",
//         PE_ratio: 19.7,
//         ave_volume: 829315,
//         dividend: 15.0,
//       },
//       {
//         symbol: "CERN",
//         companyName: "Cerner Corp",
//         prices: {},
//         day_change: 6.87,
//         wk_change: 33.63,
//         market_cap: 7912618,
//         day_vol: 549871,
//         supply: 29259336586,
//         previous_close: 825.95,
//         day_range: "231.08-758.15",
//         revenue: 363885.6,
//         EPS: 95418.11,
//         yr_range: "259.41-742.33",
//         PE_ratio: 74.5,
//         ave_volume: 793554,
//         dividend: 26.65,
//       },
//       {
//         symbol: "CHKP",
//         companyName: "Check Point Software Technologies Ltd",
//         prices: {},
//         day_change: 15.29,
//         wk_change: 4.72,
//         market_cap: 3298704,
//         day_vol: 63396,
//         supply: 14697639733,
//         previous_close: 208.11,
//         day_range: "613.56-214.62",
//         revenue: 413996.07,
//         EPS: 43639.58,
//         yr_range: "829.35-250.20",
//         PE_ratio: 77.2,
//         ave_volume: 533867,
//         dividend: 28.59,
//       },
//       {
//         symbol: "CHTR",
//         companyName: "Charter Communications Inc",
//         prices: {},
//         day_change: 11.74,
//         wk_change: 44.19,
//         market_cap: 7008688,
//         day_vol: 131663,
//         supply: 59424167185,
//         previous_close: 966.86,
//         day_range: "419.35-485.43",
//         revenue: 982551.21,
//         EPS: 64515.85,
//         yr_range: "293.50-670.62",
//         PE_ratio: 69.0,
//         ave_volume: 385300,
//         dividend: 41.62,
//       },
//       {
//         symbol: "CPRT",
//         companyName: "Copart Inc",
//         prices: {},
//         day_change: 18.44,
//         wk_change: 20.19,
//         market_cap: 3583360,
//         day_vol: 666885,
//         supply: 6139659821,
//         previous_close: 598.04,
//         day_range: "858.68-520.53",
//         revenue: 699179.52,
//         EPS: 34752.95,
//         yr_range: "149.32-882.04",
//         PE_ratio: 53.2,
//         ave_volume: 713116,
//         dividend: 35.79,
//       },
//       {
//         symbol: "CTAS",
//         companyName: "Cintas Corp",
//         prices: {},
//         day_change: 10.0,
//         wk_change: 0.11,
//         market_cap: 8681540,
//         day_vol: 210879,
//         supply: 43325311186,
//         previous_close: 571.12,
//         day_range: "849.34-853.29",
//         revenue: 920466.05,
//         EPS: 61184.49,
//         yr_range: "734.36-341.33",
//         PE_ratio: 76.0,
//         ave_volume: 164077,
//         dividend: 17.25,
//       },
//       {
//         symbol: "CSCO",
//         companyName: "Cisco Systems Inc",
//         prices: {},
//         day_change: 7.01,
//         wk_change: 17.90,
//         market_cap: 4437533,
//         day_vol: 938514,
//         supply: 56720043017,
//         previous_close: 548.37,
//         day_range: "990.61-885.57",
//         revenue: 362743.53,
//         EPS: 50945.37,
//         yr_range: "988.14-751.42",
//         PE_ratio: 2.6,
//         ave_volume: 655076,
//         dividend: 23.26,
//       },
//       {
//         symbol: "CMCSA",
//         companyName: "Comcast Corp",
//         prices: {},
//         day_change: 10.97,
//         wk_change: 14.89,
//         market_cap: 9513921,
//         day_vol: 680528,
//         supply: 14400952747,
//         previous_close: 523.11,
//         day_range: "460.34-620.57",
//         revenue: 473900.27,
//         EPS: 92262.19,
//         yr_range: "506.66-13.49",
//         PE_ratio: 6.2,
//         ave_volume: 313430,
//         dividend: 41.02,
//       },
//       {
//         symbol: "COST",
//         companyName: "Costco Wholesale Corp",
//         prices: {},
//         day_change: 7.43,
//         wk_change: 18.88,
//         market_cap: 9796856,
//         day_vol: 314045,
//         supply: 67240572280,
//         previous_close: 784.5,
//         day_range: "471.24-624.42",
//         revenue: 290122.59,
//         EPS: 24438.52,
//         yr_range: "162.63-341.53",
//         PE_ratio: 81.1,
//         ave_volume: 176896,
//         dividend: 15.93,
//       },
//       {
//         symbol: "CSX",
//         companyName: "CSX Corp",
//         prices: {},
//         day_change: 7.03,
//         wk_change: 23.67,
//         market_cap: 9090520,
//         day_vol: 946925,
//         supply: 26436797970,
//         previous_close: 195.46,
//         day_range: "339.74-137.91",
//         revenue: 368772.29,
//         EPS: 9154.79,
//         yr_range: "607.69-95.86",
//         PE_ratio: 99.4,
//         ave_volume: 5526,
//         dividend: 2.7,
//       },
//       {
//         symbol: "CTSH",
//         companyName: "Cognizant Technology Solutions Corp",
//         prices: {},
//         day_change: 14.82,
//         wk_change: 4.90,
//         market_cap: 667163,
//         day_vol: 546941,
//         supply: 59475219497,
//         previous_close: 556.57,
//         day_range: "117.72-780.04",
//         revenue: 670903.26,
//         EPS: 94014.83,
//         yr_range: "607.02-974.28",
//         PE_ratio: 25.3,
//         ave_volume: 853721,
//         dividend: 16.36,
//       },
//       {
//         symbol: "DOCU",
//         companyName: "DocuSign Inc",
//         prices: {},
//         day_change: 11.35,
//         wk_change: 6.09,
//         market_cap: 6869683,
//         day_vol: 48523,
//         supply: 58884539691,
//         previous_close: 755.24,
//         day_range: "853.15-532.88",
//         revenue: 99631.94,
//         EPS: 54482.68,
//         yr_range: "751.37-128.38",
//         PE_ratio: 87.1,
//         ave_volume: 411515,
//         dividend: 33.28,
//       },
//       {
//         symbol: "DXCM",
//         companyName: "Dexcom Inc",
//         prices: {},
//         day_change: 1.62,
//         wk_change: 33.21,
//         market_cap: 3145564,
//         day_vol: 906649,
//         supply: 74857068399,
//         previous_close: 941.42,
//         day_range: "896.20-246.32",
//         revenue: 101537.56,
//         EPS: 65855.8,
//         yr_range: "38.44-45.48",
//         PE_ratio: 23.4,
//         ave_volume: 558126,
//         dividend: 38.88,
//       },
//       {
//         symbol: "DLTR",
//         companyName: "Dollar Tree Inc",
//         prices: {},
//         day_change: 19.4,
//         wk_change: 10.75,
//         market_cap: 353561,
//         day_vol: 605606,
//         supply: 74782182903,
//         previous_close: 361.7,
//         day_range: "853.85-954.62",
//         revenue: 735508.39,
//         EPS: 57527.1,
//         yr_range: "374.24-423.83",
//         PE_ratio: 21.6,
//         ave_volume: 93293,
//         dividend: 23.65,
//       },
//       {
//         symbol: "EA",
//         companyName: "Electronic Arts",
//         prices: {},
//         day_change: 19.37,
//         wk_change: 7.39,
//         market_cap: 9580189,
//         day_vol: 64007,
//         supply: 48968238778,
//         previous_close: 844.51,
//         day_range: "985.98-262.55",
//         revenue: 543415.45,
//         EPS: 58824.14,
//         yr_range: "747.03-243.65",
//         PE_ratio: 22.2,
//         ave_volume: 435329,
//         dividend: 8.08,
//       },
//       {
//         symbol: "EBAY",
//         companyName: "eBay Inc",
//         prices: {},
//         day_change: 12.6,
//         wk_change: 4.73,
//         market_cap: 2249656,
//         day_vol: 975228,
//         supply: 47309347668,
//         previous_close: 19.49,
//         day_range: "577.12-408.94",
//         revenue: 164386.73,
//         EPS: 87278.54,
//         yr_range: "284.53-332.97",
//         PE_ratio: 29.3,
//         ave_volume: 334652,
//         dividend: 3.74,
//       },
//       {
//         symbol: "EXC",
//         companyName: "Exelon Corp",
//         prices: {},
//         day_change: 19.04,
//         wk_change: 39.03,
//         market_cap: 3638821,
//         day_vol: 927869,
//         supply: 46205410683,
//         previous_close: 234.08,
//         day_range: "154.72-404.92",
//         revenue: 130944.42,
//         EPS: 38344.36,
//         yr_range: "342.08-159.56",
//         PE_ratio: 58.9,
//         ave_volume: 908905,
//         dividend: 10.4,
//       },
//       {
//         symbol: "FAST",
//         companyName: "Fastenal Co",
//         prices: {},
//         day_change: 19.6,
//         wk_change: 3.29,
//         market_cap: 4427763,
//         day_vol: 285072,
//         supply: 65776581399,
//         previous_close: 553.06,
//         day_range: "139.05-171.29",
//         revenue: 966089.84,
//         EPS: 53341.73,
//         yr_range: "731.32-13.61",
//         PE_ratio: 40.0,
//         ave_volume: 549091,
//         dividend: 18.62,
//       },
//       {
//         symbol: "FB",
//         companyName: "Facebook",
//         prices: {},
//         day_change: 10.13,
//         wk_change: 17.83,
//         market_cap: 2690191,
//         day_vol: 457274,
//         supply: 1711192247,
//         previous_close: 283.52,
//         day_range: "236.01-111.48",
//         revenue: 701636.86,
//         EPS: 63563.01,
//         yr_range: "41.39-577.85",
//         PE_ratio: 75.4,
//         ave_volume: 307534,
//         dividend: 27.03,
//       },
//       {
//         symbol: "FISV",
//         companyName: "Fiserv Inc",
//         prices: {},
//         day_change: 0.94,
//         wk_change: 32.07,
//         market_cap: 4542354,
//         day_vol: 925567,
//         supply: 16291006703,
//         previous_close: 576.94,
//         day_range: "876.65-812.37",
//         revenue: 576199.38,
//         EPS: 51336.37,
//         yr_range: "551.99-60.90",
//         PE_ratio: 23.0,
//         ave_volume: 218556,
//         dividend: 43.05,
//       },
//       {
//         symbol: "FOX",
//         companyName: "Fox Corp. Class B",
//         prices: {},
//         day_change: 17.21,
//         wk_change: 9.17,
//         market_cap: 107038,
//         day_vol: 225256,
//         supply: 94655582741,
//         previous_close: 641.05,
//         day_range: "137.19-715.18",
//         revenue: 623295.31,
//         EPS: 41680.55,
//         yr_range: "629.13-303.91",
//         PE_ratio: 21.7,
//         ave_volume: 877341,
//         dividend: 32.49,
//       },
//       {
//         symbol: "FOXA",
//         companyName: "Fox Corp. Class A",
//         prices: {},
//         day_change: 0.21,
//         wk_change: 25.81,
//         market_cap: 3579225,
//         day_vol: 656186,
//         supply: 95198977736,
//         previous_close: 762.43,
//         day_range: "513.24-198.61",
//         revenue: 229189.22,
//         EPS: 24453.77,
//         yr_range: "789.55-616.73",
//         PE_ratio: 65.6,
//         ave_volume: 340053,
//         dividend: 1.12,
//       },
//       {
//         symbol: "GILD",
//         companyName: "Gilead Sciences Inc",
//         prices: {},
//         day_change: 6.94,
//         wk_change: 40.94,
//         market_cap: 7593041,
//         day_vol: 867087,
//         supply: 45859091496,
//         previous_close: 530.92,
//         day_range: "634.54-794.48",
//         revenue: 163982.9,
//         EPS: 44676.88,
//         yr_range: "500.11-946.16",
//         PE_ratio: 50.9,
//         ave_volume: 932073,
//         dividend: 5.67,
//       },
//       {
//         symbol: "GOOG",
//         companyName: "Alphabet Class C",
//         prices: {},
//         day_change: 15.91,
//         wk_change: 2.55,
//         market_cap: 4357674,
//         day_vol: 416110,
//         supply: 63122244395,
//         previous_close: 525.13,
//         day_range: "705.55-188.42",
//         revenue: 896922.16,
//         EPS: 72924.33,
//         yr_range: "292.60-40.64",
//         PE_ratio: 79.9,
//         ave_volume: 677749,
//         dividend: 22.22,
//       },
//       {
//         symbol: "GOOGL",
//         companyName: "Alphabet Class A",
//         prices: {},
//         day_change: 19.22,
//         wk_change: 20.48,
//         market_cap: 1428739,
//         day_vol: 628147,
//         supply: 86278955290,
//         previous_close: 40.99,
//         day_range: "206.74-261.18",
//         revenue: 242988.14,
//         EPS: 55817.29,
//         yr_range: "785.63-194.43",
//         PE_ratio: 19.6,
//         ave_volume: 183723,
//         dividend: 37.58,
//       },
//       {
//         symbol: "ILMN",
//         companyName: "Illumina Inc",
//         prices: {},
//         day_change: 2.94,
//         wk_change: 6.92,
//         market_cap: 5368666,
//         day_vol: 426095,
//         supply: 59661286924,
//         previous_close: 635.63,
//         day_range: "667.84-828.30",
//         revenue: 317374.73,
//         EPS: 25627.06,
//         yr_range: "857.39-564.84",
//         PE_ratio: 61.0,
//         ave_volume: 565145,
//         dividend: 19.65,
//       },
//       {
//         symbol: "INCY",
//         companyName: "Incyte Corp",
//         prices: {},
//         day_change: 11.98,
//         wk_change: 15.52,
//         market_cap: 9654322,
//         day_vol: 274730,
//         supply: 68573341509,
//         previous_close: 1.7,
//         day_range: "331.43-51.68",
//         revenue: 111719.76,
//         EPS: 38499.42,
//         yr_range: "11.13-512.48",
//         PE_ratio: 41.1,
//         ave_volume: 336017,
//         dividend: 35.25,
//       },
//       {
//         symbol: "INTC",
//         companyName: "Intel Corp",
//         prices: {},
//         day_change: 7.41,
//         wk_change: 2.34,
//         market_cap: 5393606,
//         day_vol: 502371,
//         supply: 59628195417,
//         previous_close: 818.45,
//         day_range: "717.39-513.31",
//         revenue: 804550.76,
//         EPS: 50261.26,
//         yr_range: "930.44-828.98",
//         PE_ratio: 45.0,
//         ave_volume: 987778,
//         dividend: 7.68,
//       },
//       {
//         symbol: "INTU",
//         companyName: "Intuit Inc",
//         prices: {},
//         day_change: 7.82,
//         wk_change: 48.39,
//         market_cap: 8967453,
//         day_vol: 127343,
//         supply: 73336034953,
//         previous_close: 979.49,
//         day_range: "777.64-682.91",
//         revenue: 283742.92,
//         EPS: 34020.93,
//         yr_range: "37.77-957.72",
//         PE_ratio: 66.7,
//         ave_volume: 60917,
//         dividend: 17.09,
//       },
//       {
//         symbol: "ISRG",
//         companyName: "Intuitive Surgical Inc",
//         prices: {},
//         day_change: 10.53,
//         wk_change: 2.80,
//         market_cap: 1824458,
//         day_vol: 334761,
//         supply: 38856793591,
//         previous_close: 383.55,
//         day_range: "490.82-86.32",
//         revenue: 91178.95,
//         EPS: 6547.12,
//         yr_range: "321.16-442.28",
//         PE_ratio: 38.9,
//         ave_volume: 666797,
//         dividend: 21.69,
//       },
//       {
//         symbol: "MRVL",
//         companyName: "Marvell Technology Group Ltd",
//         prices: {},
//         day_change: 18.28,
//         wk_change: 31.96,
//         market_cap: 1227342,
//         day_vol: 149515,
//         supply: 92552683771,
//         previous_close: 588.0,
//         day_range: "922.93-149.81",
//         revenue: 906961.1,
//         EPS: 35524.71,
//         yr_range: "667.91-869.58",
//         PE_ratio: 21.0,
//         ave_volume: 703362,
//         dividend: 44.88,
//       },
//       {
//         symbol: "IDXX",
//         companyName: "IDEXX Laboratories Inc",
//         prices: {},
//         day_change: 13.82,
//         wk_change: 47.96,
//         market_cap: 2174596,
//         day_vol: 45900,
//         supply: 2717473853,
//         previous_close: 538.19,
//         day_range: "912.15-27.65",
//         revenue: 622715.05,
//         EPS: 87811.82,
//         yr_range: "382.58-287.48",
//         PE_ratio: 77.2,
//         ave_volume: 558382,
//         dividend: 47.86,
//       },
//       {
//         symbol: "JD",
//         companyName: "JD.Com Inc",
//         prices: {},
//         day_change: 7.23,
//         wk_change: 30.21,
//         market_cap: 1027418,
//         day_vol: 838428,
//         supply: 4490873570,
//         previous_close: 103.82,
//         day_range: "433.92-553.16",
//         revenue: 876406.19,
//         EPS: 81560.27,
//         yr_range: "861.58-812.56",
//         PE_ratio: 9.3,
//         ave_volume: 814122,
//         dividend: 31.4,
//       },
//       {
//         symbol: "KDP",
//         companyName: "Keurig Dr Pepper Inc",
//         prices: {},
//         day_change: 10.16,
//         wk_change: 6.69,
//         market_cap: 4909383,
//         day_vol: 871423,
//         supply: 97139815711,
//         previous_close: 886.18,
//         day_range: "119.34-159.52",
//         revenue: 787286.88,
//         EPS: 40897.94,
//         yr_range: "427.51-797.43",
//         PE_ratio: 63.0,
//         ave_volume: 331948,
//         dividend: 32.65,
//       },
//       {
//         symbol: "KLAC",
//         companyName: "KLA Corp",
//         prices: {},
//         day_change: 9.83,
//         wk_change: 26.44,
//         market_cap: 5775977,
//         day_vol: 953961,
//         supply: 14179065994,
//         previous_close: 364.96,
//         day_range: "151.28-452.38",
//         revenue: 534086.57,
//         EPS: 9049.53,
//         yr_range: "707.41-924.56",
//         PE_ratio: 85.2,
//         ave_volume: 830425,
//         dividend: 0.27,
//       },
//       {
//         symbol: "KHC",
//         companyName: "Kraft Heinz Co",
//         prices: {},
//         day_change: 9.52,
//         wk_change: 48.56,
//         market_cap: 9377497,
//         day_vol: 599183,
//         supply: 23938814748,
//         previous_close: 43.29,
//         day_range: "442.50-253.97",
//         revenue: 534038.99,
//         EPS: 18623.78,
//         yr_range: "971.65-743.12",
//         PE_ratio: 25.9,
//         ave_volume: 1794,
//         dividend: 10.39,
//       },
//       {
//         symbol: "LRCX",
//         companyName: "Lam Research Corp",
//         prices: {},
//         day_change: 15.68,
//         wk_change: 23.13,
//         market_cap: 6029188,
//         day_vol: 819358,
//         supply: 79388266831,
//         previous_close: 658.46,
//         day_range: "702.42-238.79",
//         revenue: 496997.35,
//         EPS: 90982.24,
//         yr_range: "494.04-209.95",
//         PE_ratio: 3.2,
//         ave_volume: 851569,
//         dividend: 39.37,
//       },
//       {
//         symbol: "LULU",
//         companyName: "Lululemon Athletica Inc",
//         prices: {},
//         day_change: 7.28,
//         wk_change: 3.08,
//         market_cap: 4788802,
//         day_vol: 789411,
//         supply: 22004455739,
//         previous_close: 600.05,
//         day_range: "463.91-202.20",
//         revenue: 831583.09,
//         EPS: 88318.31,
//         yr_range: "436.77-421.76",
//         PE_ratio: 21.1,
//         ave_volume: 767275,
//         dividend: 46.74,
//       },
//       {
//         symbol: "MELI",
//         companyName: "Mercadolibre Inc",
//         prices: {},
//         day_change: 11.77,
//         wk_change: 13.23,
//         market_cap: 4259108,
//         day_vol: 997862,
//         supply: 56260383245,
//         previous_close: 233.34,
//         day_range: "279.84-101.36",
//         revenue: 442942.05,
//         EPS: 79575.18,
//         yr_range: "179.20-190.22",
//         PE_ratio: 83.9,
//         ave_volume: 269061,
//         dividend: 16.0,
//       },
//       {
//         symbol: "MAR",
//         companyName: "Marriott International Inc",
//         prices: {},
//         day_change: 19.78,
//         wk_change: 6.02,
//         market_cap: 3067407,
//         day_vol: 344160,
//         supply: 66300627550,
//         previous_close: 884.54,
//         day_range: "206.85-629.07",
//         revenue: 183788.03,
//         EPS: 33597.04,
//         yr_range: "526.74-660.86",
//         PE_ratio: 38.5,
//         ave_volume: 286274,
//         dividend: 4.27,
//       },
//       {
//         symbol: "MTCH",
//         companyName: "Match Group Inc",
//         prices: {},
//         day_change: 1.67,
//         wk_change: 3.84,
//         market_cap: 6685810,
//         day_vol: 209648,
//         supply: 70293237895,
//         previous_close: 538.96,
//         day_range: "234.09-903.69",
//         revenue: 812765.84,
//         EPS: 69573.37,
//         yr_range: "953.04-111.54",
//         PE_ratio: 1.5,
//         ave_volume: 346206,
//         dividend: 16.41,
//       },
//       {
//         symbol: "MCHP",
//         companyName: "Microchip Technology Inc",
//         prices: {},
//         day_change: 9.81,
//         wk_change: 3.14,
//         market_cap: 4959201,
//         day_vol: 865086,
//         supply: 31739520410,
//         previous_close: 242.51,
//         day_range: "619.04-932.81",
//         revenue: 335075.04,
//         EPS: 99536.33,
//         yr_range: "973.32-205.66",
//         PE_ratio: 67.4,
//         ave_volume: 63743,
//         dividend: 28.31,
//       },
//       {
//         symbol: "MDLZ",
//         companyName: "Mondelez International Inc",
//         prices: {},
//         day_change: 0.6,
//         wk_change: 10.85,
//         market_cap: 6401370,
//         day_vol: 370710,
//         supply: 77662792608,
//         previous_close: 857.6,
//         day_range: "434.20-168.20",
//         revenue: 868841.36,
//         EPS: 81068.94,
//         yr_range: "712.11-87.82",
//         PE_ratio: 82.3,
//         ave_volume: 921196,
//         dividend: 4.26,
//       },
//       {
//         symbol: "MRNA",
//         companyName: "Moderna Inc",
//         prices: {},
//         day_change: 8.43,
//         wk_change: 20.74,
//         market_cap: 7266916,
//         day_vol: 314972,
//         supply: 66284921910,
//         previous_close: 922.5,
//         day_range: "531.74-745.72",
//         revenue: 787239.79,
//         EPS: 64775.17,
//         yr_range: "43.91-832.40",
//         PE_ratio: 34.1,
//         ave_volume: 381808,
//         dividend: 19.06,
//       },
//       {
//         symbol: "MNST",
//         companyName: "Monster Beverage Corp",
//         prices: {},
//         day_change: 0.88,
//         wk_change: 30.02,
//         market_cap: 5058431,
//         day_vol: 93886,
//         supply: 44076048287,
//         previous_close: 837.62,
//         day_range: "246.05-388.43",
//         revenue: 989967.78,
//         EPS: 78806.61,
//         yr_range: "388.63-320.48",
//         PE_ratio: 84.0,
//         ave_volume: 291093,
//         dividend: 6.43,
//       },
//       {
//         symbol: "MSFT",
//         companyName: "Microsoft Corp",
//         prices: {},
//         day_change: 19.07,
//         wk_change: 31.23,
//         market_cap: 8896040,
//         day_vol: 336698,
//         supply: 57686581003,
//         previous_close: 94.8,
//         day_range: "866.21-701.44",
//         revenue: 446916.47,
//         EPS: 61484.52,
//         yr_range: "372.11-972.40",
//         PE_ratio: 45.1,
//         ave_volume: 991427,
//         dividend: 12.02,
//       },
//       {
//         symbol: "MU",
//         companyName: "Micron Technology Inc",
//         prices: {},
//         day_change: 18.49,
//         wk_change: 14.79,
//         market_cap: 3832243,
//         day_vol: 314466,
//         supply: 78261101002,
//         previous_close: 229.81,
//         day_range: "130.91-587.66",
//         revenue: 828019.78,
//         EPS: 78591.23,
//         yr_range: "679.38-430.50",
//         PE_ratio: 41.2,
//         ave_volume: 922746,
//         dividend: 30.42,
//       },
//       {
//         symbol: "MXIM",
//         companyName: "Maxim Integrated Products Inc",
//         prices: {},
//         day_change: 15.85,
//         wk_change: 5.81,
//         market_cap: 1166957,
//         day_vol: 104255,
//         supply: 39779035874,
//         previous_close: 993.7,
//         day_range: "826.10-817.94",
//         revenue: 488437.0,
//         EPS: 57132.68,
//         yr_range: "285.89-311.79",
//         PE_ratio: 65.7,
//         ave_volume: 687135,
//         dividend: 25.75,
//       },
//       {
//         symbol: "NFLX",
//         companyName: "Netflix Inc",
//         prices: {},
//         day_change: 11.66,
//         wk_change: 3.06,
//         market_cap: 6915312,
//         day_vol: 229656,
//         supply: 66206719109,
//         previous_close: 346.38,
//         day_range: "132.23-442.20",
//         revenue: 463695.42,
//         EPS: 90387.71,
//         yr_range: "578.16-242.10",
//         PE_ratio: 91.6,
//         ave_volume: 767415,
//         dividend: 4.84,
//       },
//       {
//         symbol: "NTES",
//         companyName: "NetEase Inc",
//         prices: {},
//         day_change: 9.67,
//         wk_change: 6.58,
//         market_cap: 7317419,
//         day_vol: 54656,
//         supply: 8637924525,
//         previous_close: 308.35,
//         day_range: "442.03-938.36",
//         revenue: 39299.08,
//         EPS: 79585.63,
//         yr_range: "933.59-660.60",
//         PE_ratio: 29.5,
//         ave_volume: 545773,
//         dividend: 24.67,
//       },
//       {
//         symbol: "NVDA",
//         companyName: "NVIDIA Corp",
//         prices: {},
//         day_change: 8.56,
//         wk_change: 27.16,
//         market_cap: 8033318,
//         day_vol: 529710,
//         supply: 57200656474,
//         previous_close: 453.84,
//         day_range: "550.89-714.87",
//         revenue: 900128.23,
//         EPS: 47696.7,
//         yr_range: "607.45-663.07",
//         PE_ratio: 66.6,
//         ave_volume: 789955,
//         dividend: 31.74,
//       },
//       {
//         symbol: "NXPI",
//         companyName: "NXP Semiconductors NV",
//         prices: {},
//         day_change: 8.51,
//         wk_change: 12.06,
//         market_cap: 2543540,
//         day_vol: 765598,
//         supply: 85578886884,
//         previous_close: 820.68,
//         day_range: "611.07-209.49",
//         revenue: 814284.02,
//         EPS: 18418.58,
//         yr_range: "559.31-799.73",
//         PE_ratio: 45.6,
//         ave_volume: 158624,
//         dividend: 38.93,
//       },
//       {
//         symbol: "OKTA",
//         companyName: "Okta Inc",
//         prices: {},
//         day_change: 1.0,
//         wk_change: 38.81,
//         market_cap: 1018165,
//         day_vol: 851026,
//         supply: 49343666323,
//         previous_close: 151.07,
//         day_range: "236.56-433.82",
//         revenue: 304917.83,
//         EPS: 23959.27,
//         yr_range: "426.72-107.71",
//         PE_ratio: 69.2,
//         ave_volume: 907815,
//         dividend: 31.21,
//       },
//       {
//         symbol: "ORLY",
//         companyName: "O'Reilly Automotive Inc",
//         prices: {},
//         day_change: 15.89,
//         wk_change: 46.71,
//         market_cap: 401497,
//         day_vol: 825530,
//         supply: 56567696191,
//         previous_close: 124.41,
//         day_range: "261.34-994.09",
//         revenue: 653466.6,
//         EPS: 62916.66,
//         yr_range: "692.39-613.70",
//         PE_ratio: 46.4,
//         ave_volume: 294882,
//         dividend: 27.17,
//       },
//       {
//         symbol: "PAYX",
//         companyName: "Paychex Inc",
//         prices: {},
//         day_change: 18.87,
//         wk_change: 39.41,
//         market_cap: 9192514,
//         day_vol: 748081,
//         supply: 27231098031,
//         previous_close: 60.07,
//         day_range: "742.23-170.45",
//         revenue: 831245.14,
//         EPS: 92349.2,
//         yr_range: "58.31-702.58",
//         PE_ratio: 52.0,
//         ave_volume: 117868,
//         dividend: 4.49,
//       },
//       {
//         symbol: "PCAR",
//         companyName: "Paccar Inc",
//         prices: {},
//         day_change: 8.68,
//         wk_change: 40.98,
//         market_cap: 7611633,
//         day_vol: 169837,
//         supply: 87738931609,
//         previous_close: 447.57,
//         day_range: "22.87-684.91",
//         revenue: 525382.42,
//         EPS: 56067.44,
//         yr_range: "109.60-168.76",
//         PE_ratio: 80.1,
//         ave_volume: 479415,
//         dividend: 23.16,
//       },
//       {
//         symbol: "PDD",
//         companyName: "Pinduoduo Inc",
//         prices: {},
//         day_change: 1.37,
//         wk_change: 8.26,
//         market_cap: 5167377,
//         day_vol: 839128,
//         supply: 86914951173,
//         previous_close: 540.39,
//         day_range: "695.11-156.09",
//         revenue: 742330.45,
//         EPS: 85877.52,
//         yr_range: "421.67-826.51",
//         PE_ratio: 90.7,
//         ave_volume: 356949,
//         dividend: 43.2,
//       },
//       {
//         symbol: "PTON",
//         companyName: "Peloton Interactive Inc",
//         prices: {},
//         day_change: 13.99,
//         wk_change: 15.38,
//         market_cap: 1813394,
//         day_vol: 726188,
//         supply: 11409706378,
//         previous_close: 105.8,
//         day_range: "908.71-718.70",
//         revenue: 454616.57,
//         EPS: 29377.23,
//         yr_range: "453.70-758.72",
//         PE_ratio: 67.3,
//         ave_volume: 708928,
//         dividend: 5.94,
//       },
//       {
//         symbol: "PYPL",
//         companyName: "PayPal Holdings Inc",
//         prices: {},
//         day_change: 4.72,
//         wk_change: 37.74,
//         market_cap: 5470279,
//         day_vol: 911704,
//         supply: 52903793845,
//         previous_close: 938.81,
//         day_range: "797.09-372.15",
//         revenue: 275452.95,
//         EPS: 51162.83,
//         yr_range: "480.55-654.35",
//         PE_ratio: 55.5,
//         ave_volume: 412450,
//         dividend: 33.54,
//       },
//       {
//         symbol: "PEP",
//         companyName: "PepsiCo Inc.",
//         prices: {},
//         day_change: 0.72,
//         wk_change: 16.25,
//         market_cap: 403409,
//         day_vol: 224004,
//         supply: 56100973328,
//         previous_close: 650.45,
//         day_range: "80.75-971.32",
//         revenue: 700510.19,
//         EPS: 39371.91,
//         yr_range: "77.26-308.58",
//         PE_ratio: 59.1,
//         ave_volume: 482057,
//         dividend: 11.94,
//       },
//       {
//         symbol: "QCOM",
//         companyName: "Qualcomm Inc",
//         prices: {},
//         day_change: 14.5,
//         wk_change: 46.94,
//         market_cap: 9338266,
//         day_vol: 360511,
//         supply: 33474682595,
//         previous_close: 789.0,
//         day_range: "839.51-959.36",
//         revenue: 800434.58,
//         EPS: 6197.79,
//         yr_range: "836.36-586.64",
//         PE_ratio: 30.7,
//         ave_volume: 872942,
//         dividend: 41.96,
//       },
//       {
//         symbol: "REGN",
//         companyName: "Regeneron Pharmaceuticals Inc",
//         prices: {},
//         day_change: 5.71,
//         wk_change: 15.13,
//         market_cap: 7291573,
//         day_vol: 68334,
//         supply: 92327383513,
//         previous_close: 745.91,
//         day_range: "25.98-643.79",
//         revenue: 59459.53,
//         EPS: 21048.95,
//         yr_range: "924.32-697.53",
//         PE_ratio: 91.2,
//         ave_volume: 571781,
//         dividend: 25.31,
//       },
//       {
//         symbol: "ROST",
//         companyName: "Ross Stores Inc",
//         prices: {},
//         day_change: 7.43,
//         wk_change: 38.35,
//         market_cap: 7654672,
//         day_vol: 254984,
//         supply: 77007869238,
//         previous_close: 516.49,
//         day_range: "310.52-247.59",
//         revenue: 973002.26,
//         EPS: 30322.08,
//         yr_range: "806.30-56.74",
//         PE_ratio: 20.0,
//         ave_volume: 189330,
//         dividend: 21.71,
//       },
//       {
//         symbol: "SIRI",
//         companyName: "Sirius XM Holdings Inc",
//         prices: {},
//         day_change: 19.34,
//         wk_change: 28.64,
//         market_cap: 7321356,
//         day_vol: 64934,
//         supply: 38567182854,
//         previous_close: 345.8,
//         day_range: "214.39-286.11",
//         revenue: 119821.36,
//         EPS: 25903.33,
//         yr_range: "784.43-368.36",
//         PE_ratio: 10.5,
//         ave_volume: 339729,
//         dividend: 14.66,
//       },
//       {
//         symbol: "SGEN",
//         companyName: "Seagen Inc",
//         prices: {},
//         day_change: 11.64,
//         wk_change: 17.91,
//         market_cap: 1636015,
//         day_vol: 918578,
//         supply: 47163972002,
//         previous_close: 414.17,
//         day_range: "229.12-6.25",
//         revenue: 311128.91,
//         EPS: 14683.72,
//         yr_range: "917.78-157.09",
//         PE_ratio: 36.9,
//         ave_volume: 264936,
//         dividend: 16.53,
//       },
//       {
//         symbol: "SPLK",
//         companyName: "Splunk Inc",
//         prices: {},
//         day_change: 7.04,
//         wk_change: 32.82,
//         market_cap: 1069991,
//         day_vol: 900684,
//         supply: 50984722350,
//         previous_close: 411.79,
//         day_range: "65.41-983.29",
//         revenue: 297425.59,
//         EPS: 79986.01,
//         yr_range: "772.56-512.84",
//         PE_ratio: 88.4,
//         ave_volume: 595449,
//         dividend: 27.89,
//       },
//       {
//         symbol: "SWKS",
//         companyName: "Skyworks Solutions Inc",
//         prices: {},
//         day_change: 2.01,
//         wk_change: 29.11,
//         market_cap: 6788513,
//         day_vol: 235672,
//         supply: 6525808627,
//         previous_close: 507.41,
//         day_range: "684.52-298.46",
//         revenue: 953083.88,
//         EPS: 37226.62,
//         yr_range: "143.98-577.26",
//         PE_ratio: 50.6,
//         ave_volume: 808642,
//         dividend: 48.43,
//       },
//       {
//         symbol: "SBUX",
//         companyName: "Starbucks Corp",
//         prices: {},
//         day_change: 11.89,
//         wk_change: 11.40,
//         market_cap: 6531787,
//         day_vol: 434146,
//         supply: 87216759601,
//         previous_close: 965.03,
//         day_range: "62.12-76.77",
//         revenue: 563253.11,
//         EPS: 41694.41,
//         yr_range: "356.71-819.83",
//         PE_ratio: 61.4,
//         ave_volume: 948366,
//         dividend: 29.4,
//       },
//       {
//         symbol: "SNPS",
//         companyName: "Synopsys Inc",
//         prices: {},
//         day_change: 12.0,
//         wk_change: 10.04,
//         market_cap: 6845081,
//         day_vol: 855730,
//         supply: 68061111592,
//         previous_close: 896.64,
//         day_range: "338.78-459.88",
//         revenue: 395643.86,
//         EPS: 91619.97,
//         yr_range: "167.41-706.77",
//         PE_ratio: 80.4,
//         ave_volume: 775127,
//         dividend: 9.93,
//       },
//       {
//         symbol: "TCOM",
//         companyName: "Trip.com Group Ltd",
//         prices: {},
//         day_change: 6.95,
//         wk_change: 20.60,
//         market_cap: 9392677,
//         day_vol: 258825,
//         supply: 7911284568,
//         previous_close: 461.43,
//         day_range: "111.68-970.54",
//         revenue: 14830.34,
//         EPS: 10810.65,
//         yr_range: "935.53-900.94",
//         PE_ratio: 51.1,
//         ave_volume: 649416,
//         dividend: 28.38,
//       },
//       {
//         symbol: "TSLA",
//         companyName: "Tesla Inc",
//         prices: {},
//         day_change: 1.45,
//         wk_change: 40.75,
//         market_cap: 9032943,
//         day_vol: 567114,
//         supply: 52066754706,
//         previous_close: 610.68,
//         day_range: "225.12-389.99",
//         revenue: 21107.6,
//         EPS: 96756.36,
//         yr_range: "501.83-131.91",
//         PE_ratio: 5.8,
//         ave_volume: 158639,
//         dividend: 45.93,
//       },
//       {
//         symbol: "TXN",
//         companyName: "Texas Instruments Inc",
//         prices: {},
//         day_change: 19.83,
//         wk_change: 21.93,
//         market_cap: 9222202,
//         day_vol: 951316,
//         supply: 39715987174,
//         previous_close: 253.12,
//         day_range: "591.56-450.77",
//         revenue: 504456.57,
//         EPS: 58067.51,
//         yr_range: "718.12-538.46",
//         PE_ratio: 34.6,
//         ave_volume: 691749,
//         dividend: 25.6,
//       },
//       {
//         symbol: "TMUS",
//         companyName: "T-Mobile US Inc",
//         prices: {},
//         day_change: 18.46,
//         wk_change: 18.47,
//         market_cap: 3129074,
//         day_vol: 1341,
//         supply: 16049772192,
//         previous_close: 636.18,
//         day_range: "311.68-866.78",
//         revenue: 902826.24,
//         EPS: 15861.61,
//         yr_range: "283.48-137.90",
//         PE_ratio: 62.3,
//         ave_volume: 365465,
//         dividend: 43.52,
//       },
//       {
//         symbol: "VRSN",
//         companyName: "Verisign Inc",
//         prices: {},
//         day_change: 1.63,
//         wk_change: 30.13,
//         market_cap: 280097,
//         day_vol: 229239,
//         supply: 81641100930,
//         previous_close: 387.64,
//         day_range: "664.34-324.46",
//         revenue: 410876.46,
//         EPS: 30562.48,
//         yr_range: "227.11-374.61",
//         PE_ratio: 96.3,
//         ave_volume: 6077,
//         dividend: 3.91,
//       },
//       {
//         symbol: "VRSK",
//         companyName: "Verisk Analytics Inc",
//         prices: {},
//         day_change: 0.05,
//         wk_change: 29.02,
//         market_cap: 1889214,
//         day_vol: 39261,
//         supply: 52807029965,
//         previous_close: 56.44,
//         day_range: "822.74-230.50",
//         revenue: 766477.84,
//         EPS: 63782.62,
//         yr_range: "747.69-972.24",
//         PE_ratio: 44.6,
//         ave_volume: 709651,
//         dividend: 44.49,
//       },
//       {
//         symbol: "VRTX",
//         companyName: "Vertex Pharmaceuticals Inc",
//         prices: {},
//         day_change: 6.18,
//         wk_change: 16.39,
//         market_cap: 6901457,
//         day_vol: 651096,
//         supply: 66667923176,
//         previous_close: 124.38,
//         day_range: "688.48-139.75",
//         revenue: 693352.12,
//         EPS: 49936.11,
//         yr_range: "546.04-108.93",
//         PE_ratio: 44.1,
//         ave_volume: 875115,
//         dividend: 15.0,
//       },
//       {
//         symbol: "WBA",
//         companyName: "Walgreens Boots Alliance Inc",
//         prices: {},
//         day_change: 0.54,
//         wk_change: 30.37,
//         market_cap: 3066778,
//         day_vol: 420169,
//         supply: 2158536044,
//         previous_close: 319.76,
//         day_range: "351.82-54.85",
//         revenue: 756745.88,
//         EPS: 48037.18,
//         yr_range: "536.79-895.78",
//         PE_ratio: 93.8,
//         ave_volume: 129639,
//         dividend: 44.83,
//       },
//       {
//         symbol: "WDAY",
//         companyName: "Workday Inc",
//         prices: {},
//         day_change: 3.17,
//         wk_change: 20.53,
//         market_cap: 8132691,
//         day_vol: 390085,
//         supply: 10025640310,
//         previous_close: 390.09,
//         day_range: "66.13-904.21",
//         revenue: 315540.51,
//         EPS: 62164.8,
//         yr_range: "347.78-908.89",
//         PE_ratio: 75.5,
//         ave_volume: 818905,
//         dividend: 4.97,
//       },
//       {
//         symbol: "XEL",
//         companyName: "Xcel Energy Inc",
//         prices: {},
//         day_change: 15.41,
//         wk_change: 39.11,
//         market_cap: 6533987,
//         day_vol: 20681,
//         supply: 84540074802,
//         previous_close: 874.61,
//         day_range: "174.20-850.26",
//         revenue: 422923.28,
//         EPS: 20483.91,
//         yr_range: "271.42-294.12",
//         PE_ratio: 45.9,
//         ave_volume: 739926,
//         dividend: 22.59,
//       },
//       {
//         symbol: "XLNX",
//         companyName: "Xilinx Inc",
//         prices: {},
//         day_change: 3.75,
//         wk_change: 10.28,
//         market_cap: 7890113,
//         day_vol: 68336,
//         supply: 17146896730,
//         previous_close: 544.34,
//         day_range: "41.93-336.51",
//         revenue: 586671.57,
//         EPS: 91371.48,
//         yr_range: "629.22-133.08",
//         PE_ratio: 59.7,
//         ave_volume: 101138,
//         dividend: 5.06,
//       },
//       {
//         symbol: "ZM",
//         companyName: "Zoom Video Communications Inc",
//         prices: {},
//         day_change: 11.52,
//         wk_change: 40.63,
//         market_cap: 4772822,
//         day_vol: 813255,
//         supply: 21959991109,
//         previous_close: 185.35,
//         day_range: "534.42-203.85",
//         revenue: 939659.99,
//         EPS: 83614.56,
//         yr_range: "25.69-258.42",
//         PE_ratio: 61.3,
//         ave_volume: 649104,
//         dividend: 33.71,
//       },
//     ];
//     // await Promise.all(
//     //   data.map(async item => {
//     //     await prisma.stocks.create({
//     //       data: item,
//     //     })
//     //   })
//     // )
//     for (const item of data) {

//       // item.prices = {
//       //   create: price_list
//       // };
//       console.log("--------------------");

//       const res = await prisma.stocks.create({
//         data: item
//       })
//       const price_list = await generateData(res.id);

//       // price_list?.forEach(async (price) => {
//         await prisma.price.createMany({
//           data: price_list
//         })

//       // })
//     }

//     // console.log("res======> ",res);
//     console.log("here");

//     const allStocks = await prisma.stocks.findMany({
//       include: { prices: { orderBy: { date: 'desc' } } },
//       // take: 5
//     });
//     console.log("allStocks %j", allStocks);
//     // allStocks.map(async (stockData) => {
//     for (const stockData of allStocks) {

//       const [ave_volume, yearly_min, yearly_max] = await getStockPageData(stockData.prices)
//       const stocksJson = {
//         stocksId: stockData.id,
//         previous_close: Number(stockData.prices[1].prices[0].close),
//         open: Number(stockData.prices[0].prices[0].open),
//         volume: Number(stockData.prices[0].prices[0].volume),
//         ave_volume: ave_volume,
//         day_min: Number(stockData.prices[0].prices[0].low),
//         day_max: Number(stockData.prices[0].prices[0].high),
//         yearly_min: yearly_min,
//         yearly_max: yearly_max,
//       }
//       // const findStockInfo = await prisma.stockInfo.findMany({where: {stocksId: stockData.id}})
//       await prisma.stockInfo.upsert({
//         where: {
//           stocksId: stockData.id
//         },
//         update: stocksJson,
//         create: stocksJson
//       })
//     }

//     // // })
//     //  console.log(allStocks);
//   } catch (error) {
//     console.log("error ------->", error);
//   }
// };

// const getStockPageData = async (prices: string | any[]) => {
//   try {
//     const priceLength = 365
//     const priceArray = []
//     let totalVolume = 0
//     for (let index = 0; index < priceLength; index++) {
//       totalVolume = totalVolume + Number(prices[index].prices[0].volume)
//       priceArray.push(Number(prices[index].prices[0].close))
//     }
//     return [
//       Math.floor(totalVolume / priceLength),
//       Math.min(...priceArray),
//       Math.max(...priceArray)
//     ]
//   } catch (error) {
//     console.log("error--", error);
//   }
// }

// const generateData = async (stocksId: any) => {
//   try {
//     let date = new Date();
//     const priceArray = [];
//     for (let index = 0; index <= 400; index++) {
//       date = new Date(date.setDate(date.getDate() - 1));
//       const open = Number((Math.random() * 1000).toFixed(2));
//       const close = Number((Math.random() * 1000).toFixed(2));
//       const high = Number((Math.random() * 1000).toFixed(2));
//       const low = Number((Math.random() * 1000).toFixed(2));
//       const volume = Number((Math.random() * 1000000).toFixed(0));
//       // const shortDate = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
//       const shortDate = new Date(
//         date.getFullYear(),
//         date.getMonth(),
//         date.getDate()
//       ).toISOString();
//       const json: CustomObject = {
//         prices: [],
//       };
//       json["stocksId"] = stocksId;
//       json["date"] = shortDate;
//       const priceSubJson: CustomObject = {
//         dateTime: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
//         open,
//         close,
//         high,
//         low,
//         volume,
//       };

//       json.prices.push(priceSubJson);
//       priceArray.push(json);
//     }
//     return priceArray;
//   } catch (error) {
//     console.log("error--", error);
//   }
// };
// main();
