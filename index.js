import { ApolloServer, gql } from "apollo-server";
import axios from "axios";


// Funciones para realizar peticiones a los MS
function getUsers() { 
  return axios.get("http://localhost:3000/user").then(res => res.data)
}

function getEstablishments(){
  return axios.get("http://localhost:3000/establishment").then(res => res.data)
}

function getReports(){
  return axios.get("http://localhost:3000/report").then(res => res.data)
}

function getFavorites(){
  return axios.get("http://localhost:3000/favorites").then(res => res.data)
}

function getBookings(){
  return axios.get("http://localhost:3000/booking").then(res => res.data)
}


const typeDefs = gql`

  # ------------------------------- #
  # ------- DIG Definitions ------- #
  # ------------------------------- #

  type User {
    id: ID!
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
    Menu: String!
    EstablishmentType: String!
    Bookings: Int!
    Capacity: Int!
    InternetQuality: Int!
    Rating: String!
    Description: String!
    CoverPicture: String!
    Location: String!
    City: Int!
    Reports: [Report]
    Statistics: Statistic
  }

  type Report {
    id: ID!
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

  type Statistic {
    IQAverage: Float!
    SEAverage: Float!
  }

  type Bookings {
    UserID: Int!
    EstablishmentID: Int!
    Date: String!
    Hour: String!
    NumberofPeople: Int!
  }

  # ------------------------------- #
  # ---------- Consultas ---------- #
  # ------------------------------- #

  type Query {
    # Users
    allUsers: [User]!
    findUser(id: Int!): User

    # Establishments
    allEstablishtmets: [Establishment]!
    findEstablishment(EstablishmentID: Int!): Establishment

    # Reports
    allReports: [Report]!
    findReports(EstablishmentID: Int!): [Report]

    # Favorites
    favoritesByID(id: Int!): [Favorite]!
    findFavorites(id: Int!): [Establishment]!
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
    ): User

    addEstablishment(
      UserID: Int!
      EstablishmentName: String!
      Opening: String!
      Closing: String!
      Menu: String!
      EstablishmentType: String!
      Capacity: Int!
      InternetQuality: Int!
      Rating: String!
      Description: String!
      CoverPicture: String!
      Location: String!
      City: Int!
    ): Establishment\

    addReport(
      UserID: Int!
      EstablishmentID: Int!
      Date: String!
      InternetQuality: Int!
      CapabilityID: Int!
      ScoreEstablishment: String!
      ScoreReport: String!
      Review: String!
    ): Report


    addFavorite(
      EstablishmentID: Int!
      UserID: Int!
    ): Favorite

    addBooking(
      UserID: Int!
      EstablishmentID: Int!
      Date: String!
      Hour: String!
      NumberofPeople: Int!
    ): Bookings
    
  }
`;

const resolvers = {
  Query: {

    //Users
    allUsers: async () => {
      const users = await getUsers()
      return users
    },
    findUser: async (root, args) => {
        const { id } = args
        const users = await getUsers()
        return users.find(usr => usr.id === id)
    },

    //Establishments
    allEstablishtmets: async () => {
      const establishments = await getEstablishments()
      return establishments
    },
    findEstablishment: async (root, args) => {
      const establishments = await getEstablishments()
      const {EstablishmentID}  = args
      return establishments.find(est => est.EstablishmentID === EstablishmentID)
    },

    //Reports
    allReports: async () => {
      const reports = await getReports()
      return reports
    },
    findReports: async (root, args) => {
      const reports = await getReports()
        const { EstablishmentID } = args
        return reports.filter(rep => rep.EstablishmentID === EstablishmentID)
    },

    //Favorites
    findFavorites: async (root, args) => {
      const favorites = await getFavorites()
      const establishments = await getEstablishments()
      const {id} = args
      const favsUrs = favorites.filter(fav => fav.UserID === id)
      return favsUrs.map(element => {
        const favtemp = establishments.find(est => est.EstablishmentID === element.EstablishmentID)
        return favtemp
      });
    },

  },

  Mutation: {

    addUser: (root, args) => {
      const user = {...args}
      // To do Post Request from User
      return user
    },

    addEstablishment: (root, args) => {
      const establishment = {...args}
      // To do Post Request from Establishmet
      return establishment
    },

    addReport: (root, args) => {
      const report = {...args}
      // To do Post Request from Report
      return report
    },

    addFavorite: (root, args) => {
      const favorite = {...args}
      // To do Post Request from Favorite
      return favorite
    },

    addBooking: (root, args) => {
      const booking = {...args}
      // To do Post Request from Booking
      return booking
    },

  },

  Establishment: {

    // Find and returns the Reports by EstablishmentID
    Reports: async (root) => {
        const reps = await getReports()
        const { EstablishmentID } = root
        const reports = reps.filter(rep => rep.EstablishmentID === EstablishmentID)
        if (reports.length === 0) return null
        return reports
    },

    // Find and retunrs the numbers of bookings by EstablishmentID
    Bookings: async (root) => {
      const {EstablishmentID} = root
      const bkgs = await getBookings()
      const bookings = bkgs.filter(b => b.EstablishmentID === EstablishmentID)
      if (bookings.length === 0) return null
      return bookings.reduce((a, b) => a + b.NumberofPeople, 0)
    },

    // Calculate and returns the aveage of InternetQality and EstablishmentStatus
    Statistics: async (root) => {
      const { EstablishmentID } = root
      const reps = await getReports()
      const reports = await reps.filter(rep => rep.EstablishmentID === EstablishmentID)
      if (reports.length === 0) return null
      const IQAv = reports.reduce((a, b) => a + b.InternetQuality, 0)/ reports.length;
      const SEAv = reports.reduce((a, b) => a + b.ScoreEstablishment, 0)/ reports.length;
      return{
        IQAverage: IQAv,
        SEAverage: SEAv
      }
    }
  }
};


// Creating of Apollo-Server(Server from Graphql) 
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server.listen().then(({ url }) => console.log(`server ready at ${url}`));
