import {ApolloServer, gql} from 'apollo-server';
import axios from 'axios';

const {data: users} = await axios.get('http://localhost:3000/user')
const {data: establishments} = await axios.get('http://localhost:3000/user')


const typeDefs = gql`
    type User {
        UserID: ID!
        UserName: String!
        Password: String!
        Email: String!
        UserPhoto: String!
        City: Int!
    }

    type Query {
        usersCount: Int!
        allUsers: [User]!
    }
`

const resolvers = {
    Query: {
        usersCount: () => users.length,
        allUsers: () => users
    }
}

const server = new ApolloServer({
    typeDefs,
    resolvers,
})

server.listen().then(({url}) => console.log(`Server ready at ${url}`))