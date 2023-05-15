import { ApolloServer, gql } from "apollo-server";
import axios from "axios";
import amqp from "amqplib"


// Funciones para realizar peticiones a los MS

function getUsers() { 
  return axios.get("http://localhost:3000/user").then(res => res.data)
}

function getEstablishments(){
  return axios.get("http://localhost:3002/establishment").then(res => res.data)
}

function getReports(){
  return axios.get("http://localhost:3002/report").then(res => res.data)
}

function getFavorites(){
  return axios.get("http://localhost:3001/favorites").then(res => res.data.result)
}

function getBookings(){
  return axios.get("http://localhost:8001/booking").then(res => res.data)
}


const typeDefs = gql`

  # ------------------------------- #
  # ------- DIG Definitions ------- #
  # ------------------------------- #

  type User {
    _id: ID!
    UserName: String!
    Password: String
    Email: String!
    Telephone: String
    UserPhoto: String
    City: Int
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
    EstablishmentID: ID!
    UserID: ID!
    City: String
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

  type VerifiedToken{
    Verified: Boolean!
  }

  type Token{
    Token: String
    Message: String
  }

  type id{
    id: String
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
    favoritesByID(id: ID!): [Favorite]!
    findFavorites(id: ID!): [Establishment]!

    #Login
    loginUser(Email: String!, Password: String!): Token!


    # Verification with token
    userByToken(token: String!): User

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
      establishment: String!
      user: String!
      city: String!
    ): id

    addBooking(
      UserID: String!
      EstablishmentID: String!
      Date: String!
      Hour: String!
      NumberofPeople: Int!
    ): id
    

    signUp(
      UserName: String!
      Password: String!
      Email: String!
      Telephone: String
      UserPhoto: String
      City: Int
    ): Token
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
      const favsUrs = favorites.filter(fav => fav.id === id)
      return favsUrs.map(element => {
        const favtemp = establishments.find(est => est.EstablishmentID === element.establishment)
        return favtemp
      });
    },

    //Login
    loginUser: async (root, args) => {
      const {Email, Password} = args
      const Token = await axios.post('http://localhost:3000/auth/signin', {
        Email: Email,
        Password: Password
      }).then(res => res.data)
      return Token
    },

    userByToken: async (root, args) => {
        const { token } = args
        const user = await axios.post('http://localhost:3000/auth/verifyToken', {}, {
          headers: {
            'Content-Type': 'text/json',
            'x-access-token': token
          }
        }).then(res => res.data)
        console.log( "Usuario que retorna ",user)
        return user
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

    addFavorite: async (root, args) => {
      const favorite = {...args}
      const res = await axios.post("http://localhost:3001/favorites", favorite).then(res => res.data)
      return res
    },

    addBooking: (root, args) => {
      const booking = {...args}
      main(booking);
      return "123"
    },

    signUp: async (root, args) => {
      const user = {...args}
      const Token = await axios.post("http://localhost:3000/auth/signup", user).then(res => res.data)
      return Token
    }



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
  },

  VerifiedToken:{
    Verified: async (args)=>{
      const { token } = args
        const user = await axios.post('http://localhost:3000/auth/verifyToken', {}, {
          headers: {
            'Content-Type': 'text/json',
            'x-access-token': token
          }
        }).then(res => res.data)
        console.log( "Usuario que retorna ",user)
        if (user) return {Verified: true}
        return {Verified: false}
    }
  } 
};

// Creating of Apollo-Server(Server from Graphql) 
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server.listen().then(({ url }) => console.log(`server ready at ${url}`));


const main = async (message) => {
  const connection = await amqp.connect('amqp://localhost');
  const channel = await connection.createChannel();

  const queueName = 'booking';

  await channel.assertQueue(queueName, { durable: false });
  
  await channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)));

  console.log("Message sent");
  await channel.close();
  await connection.close();
}

main().catch(console.error);




