import { ApolloServer, gql } from "apollo-server";
import axios from "axios";

const users = await axios.get("http://localhost:3000/user").then(res => {return res.data});
const establishments = await axios.get(
    "http://localhost:3000/establishment"
    ).then(res=>{return res.data});
const reports = await axios.get("http://localhost:3000/report").then(res=>{return res.data});
const favorites = await axios.get("http://localhost:3000/favorites").then(res=>{return res.data}) 

// cover_picture = models.CharField(max_length=300, null=True, blank=True)

const typeDefs = gql`
  type User {
    UserID: ID!
    UserName: String!
    Password: String!
    Email: String!
    UserPhoto: String!
    City: Int!
  }

  type Establishment {
    EstablishmentID: ID!
    UserID: Int!
    EstablishmentName: String!
    Opening: String!
    Closing: String!
    EstablishmentType: String!
    Capacity: Int!
    InternetQuality: Int!
    Rating: String!
    Description: String!
    CoverPicture: String!
    Location: String!
    City: Int!
    Reports: [Report]!
  }

  type Report {
    ReportID: ID!
    UserID: Int!
    EstablishmentID: Int!
    Date: String!
    InternetQuality: String!
    CapabilityID: String!
    ScoreEstablishment: String!
    ScoreReport: String!
    Review: String!
   }

  type Favorite {
    EstablishmentID: Int!
    UserID: Int!
  }

  type Query {
    # Users
    allUsers: [User]!
    findUser(UserID: Int!): User

    # Establishments
    allEstablishtmets: [Establishment]!
    findEstablishment(EstablishmentID: Int!): Establishment

    # Reports
    allReports: [Report]!
    findReports(EstablishmentID: Int!): [Report]

    # Favorites
    favoritesByID(UserID: Int!): [Favorite]!
    findFavorites(UserID: Int!): [Establishment]!
  }
`;

const resolvers = {
  Query: {

    //Users
    allUsers: () => users,
    findUser: (root, args) => {
        const { UserID } = args
        return users.find(usr => usr.UserID === UserID)
    },

    //Establishments
    allEstablishtmets: () => establishments,
    findEstablishment: (root, args) => {
        const { EstablishmentID }  = args
        return establishments.find(est => est.EstablishmentID === EstablishmentID)
    },

    //Reports
    allReports: () => reports,
    findReports: (root, args) => {
        const { EstablishmentID } = args
        return reports.filter(rep => rep.EstablishmentID === EstablishmentID)
    },

    
    //Favorites
    findFavorites: (root, args) => {
      const {UserID} = args
      const favsUrs = favorites.filter(fav => fav.UserID === UserID)
      return favsUrs.map(element => {
        const favtemp = establishments.find(est => est.EstablishmentID === element.EstablishmentID)
        return favtemp
      });
    }


  },

  Establishment: {
    Reports: (root) => {
        const {EstablishmentID} = root
        return reports.filter(rep => rep.EstablishmentID === EstablishmentID)
    }
  }
};



const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server.listen().then(({ url }) => console.log(`server ready at ${url}`));
