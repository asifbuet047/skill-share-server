const PORT = process.env.PORT || 5000;
const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const JWT_SECRET = process.env.JWT_SECRECT_KEY;
app.use(cors()); //cors middleware
app.use(express.json()); //json convertion middleware

const database_name = 'skillup';
const users_collection_name = 'users';

const uri = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@cluster0.2jixdw6.mongodb.net/?retryWrites=true&w=majority`;
const mongoClient = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});
const verifyUser = (request, response, next) => {
    const token = request.cookies?.ACCESS_TOKEN;
    if (token) {
        jwt.verify(token, JWT_SECRET, {
            algorithms: 'HS512',
            expiresIn: '1d',
        }, (error, decoded) => {
            if (decoded) {
                response.user = decoded;
                next();
            }
            if (error) {
                response.status(401).send({ message: 'Unauthorized user' });
            }
        })
    } else {
        return response.status(401).send({ message: 'Unauthorized user' });
    }
}
async function run() {
    try {

        app.post('/api/v1/token', (request, response) => {
            jwt.sign(request.body, JWT_SECRET, {
                algorithm: 'HS512',
                expiresIn: '1d',
            }, (error, token) => {
                if (token) {
                    response.send({ ACCESS_TOKEN: token });
                } else {
                    response.send({ user: 'unauthorized', error: error });
                }
            });
        });


        app.get('/user', async (request, response) => {
            const id = request.query.id;
            const query = { email: id };
            const data = await mongoClient.db(database_name).collection(users_collection_name).findOne(query);
            console.log(data);
            response.send(data);
        });



    } finally {

    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send(`SkillShare server is ready`)
})

app.listen(PORT, () => {
    console.log(`SkillShare server on port ${PORT}`);
})