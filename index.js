import { ApolloServer, gql } from "apollo-server-express";
import axios from "axios";
import { parseString } from "xml2js";
import express from "express"
import cors from "cors"

// Url MS
const userUrl = "http://10.0.40.2:3000";
// URL's in the cluster private
const estUrl = "http://10.0.36.205:8080/api/establishments";

// New Urls in kubernetes cluster.
const repsUrl = "http://10.0.37.247:8081/api/reports";

// Not Updated Urls
const bookingUrl = "http://104.197.127.77:5000/api/bookings";
const favsUrl =
  "https://github-digapp-arquisoft-favorites-module-t2ngntgfya-ue.a.run.app/favorites";
const soapTwidditUrl = "http://34.138.201.211:80/wsdl";

const typeDefs = gql`
  # ------------------------------- #
  # ------- DIG Definitions ------- #
  # ------------------------------- #

  type User {
    _id: ID
    UserName: String
    Password: String
    Email: String
    Telephone: String
    UserPhoto: String
    City: Int
  }

  type Establishment {
    id: ID!
    userID: ID!
    establishmentName: String!
    opening: String!
    closing: String!
    establishmentType: String!
    capacity: Int!
    description: String!
    menu: String!
    coverPicture: String!
    location: String!
    city: Int!
    Reports: [Report]
    Statistics: Statistic
    #Bookings: Int
  }

  type Report {
    userid: String
    establishmentid: String
    date: String
    internetquality: Float
    scoreestablishment: Float
    scorereport: Float
    review: String
  }

  type Favorite {
    city: String
    establishment: ID!
    id: ID!
    user: ID!
  }

  type Statistic {
    IQAverage: Float
    SEAverage: Float
  }

  type Booking {
    id: ID!
    userId: String!
    establishmentId: String!
    date: String!
    hour: String!
    numberofPeople: Int!
    startHour: String!
    endHour: String!
  }

  type VerifiedToken {
    Verified: Boolean!
  }

  type Token {
    Token: String
    Message: String
  }

  type totalBooking {
    total: Int!
  }

  type Tweet {
    id: ID!
    text: String!
    user: String!
  }

  # ------------------------------- #
  # ---------- Consultas ---------- #
  # ------------------------------- #

  type Query {
    # Users
    loginUser(Email: String!, Password: String!): Token!
    userByToken(token: String!): User

    # Establishments
    allEstablishments: [Establishment]!
    establishmentsSoap: [Establishment]!
    findEstablishment(EstablishmentID: String!): Establishment
    establishmentsByType(establishmentType: String!): [Establishment]

    # Favorites
    findFavorites(UserId: ID!): [Establishment]

    # Booking
    getTotalBooking(
      EstablishmentID: ID!
      Date: String!
      BlockId: Int!
    ): totalBooking

    #Soap
    getTweets(EstablismentName: String): [Tweet]
  }

  # -------------------------------- #
  # ------- Adds and Deletes ------- #
  # -------------------------------- #

  type Mutation {
    addUser(
      UserName: String!
      Password: String!
      Telephone: String!
      Email: String!
      UserPhoto: String!
      City: Int!
    ): Token!

    addEstablishment(
      userID: ID!
      establishmentName: String!
      opening: String!
      closing: String!
      establishmentType: String!
      capacity: Int!
      description: String!
      menu: String!
      coverPicture: String!
      location: String!
      city: Int!
    ): Establishment

    addReport(
      userid: ID!
      establishmentid: ID!
      date: String!
      internetquality: Float!
      scoreestablishment: Float!
      scorereport: Float!
      review: String!
    ): Report

    addFavorite(establishment: ID!, user: ID!, city: String!): Favorite

    addBooking(
      userId: String!
      establishmentId: String!
      date: String!
      blockId: Int!
      numberofPeople: Int!
    ): Booking
  }
`;

const resolvers = {
  Query: {
    // UserLogin
    loginUser: async (root, args) => {
      const { Email, Password } = args;
      const Token = await axios
        .post(userUrl + "/auth/signin", {
          Email: Email,
          Password: Password,
        })
        .then((res) => res.data);
      return Token;
    },

    // UserByToken
    userByToken: async (root, args) => {
      const { token } = args;
      const user = await axios
        .post(
          userUrl + "/auth/verifyToken",
          {},
          {
            headers: {
              "Content-Type": "text/json",
              "x-access-token": token,
            },
          }
        )
        .then((res) => res.data);
      return user;
    },

    //Establishments
    allEstablishments: async () => {
      const establishments = await axios.get(estUrl).then((res) => res.data);
      return establishments;
    },

    establishmentsSoap: async () => {
      const establishments = await axios
        .get(estUrl + "/type/Aula de Estudio")
        .then((res) => res.data);
      return establishments;
    },

    findEstablishment: async (root, args) => {
      const { EstablishmentID } = args;
      const establishment = axios
        .get(estUrl + "/" + EstablishmentID)
        .then((res) => res.data);
      return establishment;
    },

    establishmentsByType: async (root, args) => {
      const { establishmentType } = args;
      const establishments = axios
        .get(estUrl + "/type/" + establishmentType)
        .then((res) => res.data);
      return establishments;
    },

    //Favorites
    findFavorites: async (root, args) => {
      const { UserId } = args;
      const favorites = await axios
        .get(favsUrl + "?user=" + UserId)
        .then((res) => res.data);
      const establishments = await favorites.map(async (fav) => {
        const data = await axios
          .get(estUrl + "/" + fav.establishment)
          .then((res) => res.data);
        return data;
      });
      return establishments;
    },

    // Bookings
    getTotalBooking: async (root, args) => {
      const { EstablishmentID, Date, BlockId } = args;
      const response = await axios
        .get(`${bookingUrl}/establishments/${EstablishmentID}/count`, {
          params: {
            Date: Date,
            BlockId: BlockId,
          },
        })
        .then((res) => res.data)
        .catch((error) => console.error(error));
      return response;
    },

    //Soap
    getTweets: async (root, args) => {
      const { EstablismentName } = args;
      const soapRequest = `
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/">
         <soapenv:Header/>
         <soapenv:Body>
            <tem:Request>
               <tem:text>${EstablismentName}</tem:text>
            </tem:Request>
         </soapenv:Body>
      </soapenv:Envelope>
      `;
      const headers = {
        "Content-Type": "text/xml",
      };
      const soapResp = await axios
        .post(soapTwidditUrl, soapRequest, { headers })
        .then((response) => {
          var tweets = [];
          parseString(response.data, (err, result) => {
            if (err) {
              console.error(err);
            } else {
              const results =
                result["soap:Envelope"]["soap:Body"][0]["Response"][0][
                  "result"
                ];
              results.forEach((element) => {
                var id = element._id[0];
                var text = element.text[0];
                var user = element.user[0];
                var tweet = { id, text, user };
                tweets.push(tweet);
              });
              return tweets;
              // Aquí puedes manejar la respuesta convertida a JSON
            }
          });
          return tweets;
        })
        .catch((error) => {
          console.error(error);
          // Aquí puedes manejar cualquier error que ocurra durante la solicitud
        });
      return soapResp;
    },
  },

  Mutation: {
    addUser: async (root, args) => {
      const user = { ...args };
      const response = await axios
        .post(userUrl + "/auth/signup", user)
        .then((res) => res.data);
      return response;
    },

    addEstablishment: async (root, args) => {
      const establishment = { ...args };
      const response = await axios
        .post(estUrl, establishment)
        .then((res) => res.data);
      return response;
    },

    addReport: async (root, args) => {
      const report = { ...args };
      const response = await axios
        .post(repsUrl, report)
        .then((res) => res.data);
      return response;
    },

    addFavorite: async (root, args) => {
      const favorite = { ...args };
      const response = await axios
        .post(favsUrl, favorite)
        .then((res) => res.data.object);
      return response;
    },

    addBooking: async (root, args) => {
      const booking = { ...args };
      const response = await axios
        .post(bookingUrl, booking)
        .then((res) => res.data);
      return response;
    },
  },

  Establishment: {
    // Find and returns the Reports by EstablishmentID
    Reports: async (root) => {
      const { id } = root;
      const reports = await axios
        .get(repsUrl + "/e/" + id)
        .then((res) => res.data);
      return reports;
    },

    // Calculate and returns the aveage of InternetQality and EstablishmentStatus
    Statistics: async (root) => {
      const { id } = root;
      const response = await axios
        .get(repsUrl + "/a/" + id)
        .then((res) => res.data);
      return {
        IQAverage: response.iqaverage,
        SEAverage: response.rtaverage,
      };
    },

    // // Find and retunrs the numbers of bookings by EstablishmentID
    // Bookings: async (root) => {
    //   const { id } = root
    //   const result = axios.get(bookingUrl, id).then(res => res.data)
    //   return result
    // },
  },
};


const app = express()

// Creating of Apollo-Server(Server from Graphql)
const server = new ApolloServer({
  typeDefs,
  resolvers,
  cors: {
    origin:'https://studio.apollographql.com',
    credentials: true,
  }
});

await server.start();

app.use(cors());
server.applyMiddleware({ app })

await new Promise((resolve) => app.listen({ port: 4000 }, resolve));
console.log(`🚀 Server ready at http://localhost:4000/graphql`);