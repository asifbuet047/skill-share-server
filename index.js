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
const class_collection_name = 'classes';
const request_collection_name = 'request';


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
            response.send(data);
        });

        app.post('/user', async (request, response) => {
            const user = request.body;
            const data = await mongoClient.db(database_name).collection(users_collection_name).insertOne(user);
            console.log(data);
            response.send(data);
        });

        app.patch('/user', async (request, response) => {
            const id = request.query.id;
            const currentRole = request.body;
            const query = { email: id };
            const update = {
                $set: {
                    role: currentRole.role
                }
            };
            const data = await mongoClient.db(database_name).collection(users_collection_name).updateOne(query, update);
            console.log(data);
            response.send(data);
        });

        app.post('/addclass', async (request, response) => {
            const classDetails = request.body;
            if (classDetails) {
                const data = await mongoClient.db(database_name).collection(class_collection_name).insertOne(classDetails);
                response.send(data);
            }
        });


        app.patch('/updateclass/:id', async (request, response) => {
            const i = request.params.id;
            const updateBody = request.body;
            const query = { _id: new ObjectId(i) };
            const update = {
                $set: {
                    title: updateBody.title,
                    name: updateBody.name,
                    email: updateBody.email,
                    price: updateBody.price,
                    description: updateBody.description,
                    image: updateBody.image
                }
            };
            const data = await mongoClient.db(database_name).collection(class_collection_name).updateOne(query, update);
            response.send(data);
        });


        app.get('/allclass', async (request, response) => {
            const query = { status: 'approved' };
            const data = await mongoClient.db(database_name).collection(class_collection_name).find(query).toArray();
            response.send(data);
        });

        app.get('/allclasses', async (request, response) => {
            const data = await mongoClient.db(database_name).collection(class_collection_name).find().toArray();
            response.send(data);
        });

        app.get('/myclass', async (request, response) => {
            const mail = request.query.id;
            const query = { email: mail };
            const data = await mongoClient.db(database_name).collection(class_collection_name).find(query).toArray();
            response.send(data);
        });

        app.get('/classDetails/:id', async (request, response) => {
            const i = request.params.id;
            const query = { _id: new ObjectId(i) };
            const data = await mongoClient.db(database_name).collection(class_collection_name).findOne(query);
            response.send(data);
        });

        app.delete('/deleteclass/:id', async (request, response) => {
            const i = request.params.id;
            const query = { _id: new ObjectId(i) };
            const data = await mongoClient.db(database_name).collection(class_collection_name).deleteOne(query);
            response.send(data);
        });

        app.post('/teachrequest', async (request, response) => {
            const teach = request.body;
            if (teach.times === 1) {
                const data = await mongoClient.db(database_name).collection(request_collection_name).insertOne(teach);
                response.send(data);
            } else {
                console.log(teach.times);
                const query = { email: teach.email };
                const update = {
                    $set: {
                        status: teach.status,
                        title: teach.title,
                        experience: teach.experience,
                        category: teach.category,
                        times: teach.times
                    }
                };
                const data = await mongoClient.db(database_name).collection(request_collection_name).updateOne(query, update);
                response.send(data);
            }
        });

        app.get('/teachrequest', async (request, response) => {
            const teachingmail = request.query.id;
            const query = { email: teachingmail };
            const data = await mongoClient.db(database_name).collection(request_collection_name).findOne(query);
            if (data) {
                response.send(data);
            } else {
                response.send({ student: true });
            }
        });

        app.get('/allrequest', async (request, response) => {
            const data = await mongoClient.db(database_name).collection(request_collection_name).find().toArray();
            if (data) {
                response.send(data);
            } else {
                response.send({ norequest: true });
            }
        });

        app.patch('/editrequest', async (request, response) => {
            const details = request.body;
            console.log(details);
            const query = { _id: new ObjectId(details.id) };
            if (details.status === 'approved') {
                const update = {
                    $set: {
                        status: 'approved'
                    }
                };
                const data = await mongoClient.db(database_name).collection(request_collection_name).updateOne(query, update);
                response.send(data);
            }
            if (details.status === 'rejected') {
                const update = {
                    $set: {
                        status: 'rejected'
                    }
                };

                const data = await mongoClient.db(database_name).collection(request_collection_name).updateOne(query, update);
                response.send(data);
            }
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