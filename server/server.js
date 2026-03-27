require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const { typeDefs, resolvers } = require('./graphql/index');
const authController = require('./controllers/authController');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Error:', err));

const resourceRoutes = require('./routes/resourceRoutes');
app.use('/api/resources', resourceRoutes);

app.get('/', (req, res) => {
    res.send('Server is running');
});

app.post('/api/auth/register', authController.register);
app.get('/api/auth/activate/:link', authController.activate);
app.post('/api/auth/login', authController.login);

async function startServer() {
    const server = new ApolloServer({
        typeDefs,
        resolvers,
    });

    await server.start();

    app.use('/graphql', expressMiddleware(server));

    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
        console.log(`GraphQL API is ready at http://localhost:${PORT}/graphql`);
    });
}

startServer();