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
const payment_collection_name = 'payment';
const partners_collection_name = 'partners';
const assignments_collection_name = 'assignments';


const uri = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@cluster0.2jixdw6.mongodb.net/?retryWrites=true&w=majority`;
const mongoClient = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {

        const verifyUser = (request, response, next) => {
            if (!request.headers.authorization) {
                return response.status(401).send({ message: 'unauthorized access' });
            }
            const token = request.headers.authorization.split(' ')[1];
            if (token) {
                jwt.verify(token, JWT_SECRET, {
                    algorithms: 'HS512',
                    expiresIn: '1d',
                }, (error, decoded) => {
                    if (decoded) {
                        request.decoded = decoded;
                        next();
                    }
                    if (error) {
                        response.status(401).send({ message: 'Unauthorized access' });
                    }
                })
            } else {
                return response.status(401).send({ message: 'Unauthorized access' });
            }
        }

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


        app.get('/user', verifyUser, async (request, response) => {
            const id = request.query.id;
            const query = { email: id };
            const data = await mongoClient.db(database_name).collection(users_collection_name).findOne(query);
            response.send(data);
        });

        app.get('/alluser', verifyUser, async (request, response) => {
            const data = await mongoClient.db(database_name).collection(users_collection_name).find().toArray();
            response.send(data);
        });

        app.post('/user', verifyUser, async (request, response) => {
            const user = request.body;
            const query = { email: user.email };
            const exitingUser = await mongoClient.db(database_name).collection(users_collection_name).findOne(query);
            if (exitingUser) {
                response.send({ status: 'exiting' });
            } else {
                const data = await mongoClient.db(database_name).collection(users_collection_name).insertOne(user);
                response.send(data);
            }
        });

        app.patch('/user', verifyUser, async (request, response) => {
            const id = request.query.id;
            const currentRole = request.body;
            const query = { email: id };
            const update = {
                $set: {
                    role: currentRole.role
                }
            };
            const data = await mongoClient.db(database_name).collection(users_collection_name).updateOne(query, update);
            response.send(data);
        });

        app.post('/addclass', verifyUser, async (request, response) => {
            const classDetails = request.body;
            if (classDetails) {
                const data = await mongoClient.db(database_name).collection(class_collection_name).insertOne(classDetails);
                response.send(data);
            }
        });


        app.patch('/updateclass/:id', verifyUser, async (request, response) => {
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


        app.patch('/editclass', verifyUser, async (request, response) => {
            const updateBody = request.body;
            const query = { _id: new ObjectId(updateBody.id) };
            const update = {
                $set: {
                    status: updateBody.status
                }
            };
            const data = await mongoClient.db(database_name).collection(class_collection_name).updateOne(query, update);
            response.send(data);
        });

        app.patch('/editclassenroll', verifyUser, async (request, response) => {
            const updateBody = request.body;
            const query = { _id: new ObjectId(updateBody.id) };
            const update = {
                $set: {
                    enroll: updateBody.enroll
                }
            };
            const data = await mongoClient.db(database_name).collection(class_collection_name).updateOne(query, update);
            response.send(data);
        });


        app.get('/allclass', async (request, response) => {
            const query = { status: 'approved' };
            const data = await mongoClient.db(database_name).collection(class_collection_name).find(query).toArray();
            if (data) {
                response.send(data);
            } else {
                response.send({ noclass: true });
            }
        });

        app.get('/allclasses', async (request, response) => {
            const data = await mongoClient.db(database_name).collection(class_collection_name).find().toArray();
            if (data) {
                response.send(data);
            } else {
                response.send({ noclass: true });
            }
        });

        app.get('/allpopularclass', async (request, response) => {
            const sort = { enroll: -1 }
            const data = await mongoClient.db(database_name).collection(class_collection_name).find().sort(sort).limit(4).toArray();
            if (data) {
                response.send(data);
            } else {
                response.send({ noclass: true });
            }
        });

        app.get('/myclass', verifyUser, async (request, response) => {
            const mail = request.query.id;
            const query = { email: mail };
            const data = await mongoClient.db(database_name).collection(class_collection_name).find(query).toArray();
            response.send(data);
        });

        app.get('/classDetails/:id', verifyUser, async (request, response) => {
            const i = request.params.id;
            const query = { _id: new ObjectId(i) };
            const data = await mongoClient.db(database_name).collection(class_collection_name).findOne(query);
            response.send(data);
        });

        app.delete('/deleteclass/:id', verifyUser, async (request, response) => {
            const i = request.params.id;
            const query = { _id: new ObjectId(i) };
            const data = await mongoClient.db(database_name).collection(class_collection_name).deleteOne(query);
            response.send(data);
        });

        app.post('/teachrequest', verifyUser, async (request, response) => {
            const teach = request.body;
            if (teach.times === 1) {
                const data = await mongoClient.db(database_name).collection(request_collection_name).insertOne(teach);
                response.send(data);
            } else {
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

        app.get('/teachrequest', verifyUser, async (request, response) => {
            const teachingmail = request.query.id;
            const query = { email: teachingmail };
            const data = await mongoClient.db(database_name).collection(request_collection_name).findOne(query);
            if (data) {
                response.send(data);
            } else {
                response.send({ student: true });
            }
        });

        app.get('/allrequest', verifyUser, async (request, response) => {
            const data = await mongoClient.db(database_name).collection(request_collection_name).find().toArray();
            if (data) {
                response.send(data);
            } else {
                response.send({ norequest: true });
            }
        });

        app.patch('/editrequest', verifyUser, async (request, response) => {
            const details = request.body;
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


        app.post('/create_payment_intent', verifyUser, async (request, response) => {
            const { price } = request.body;
            const amount = parseInt(price * 100);
            const stripe = require('stripe')(process.env.STRIPE_SECRECT_KEY);
            const paymentIntent = await stripe.paymentIntents.create({
                amount: amount,
                currency: 'usd',
                payment_method_types: ['card']
            });
            response.send({
                clientSecret: paymentIntent.client_secret
            });
        });

        app.post('/payment', verifyUser, async (request, response) => {
            const info = request.body;
            const data = await mongoClient.db(database_name).collection(payment_collection_name).insertOne(info);
            response.send(data);
        });

        app.get('/paymentinfo', verifyUser, async (request, response) => {
            const mail = request.query.id;
            const query = { email: mail };
            const data = await mongoClient.db(database_name).collection(payment_collection_name).find(query).toArray();
            response.send(data);
        });


        app.get('/partners', async (req, res) => {
            const data = await mongoClient.db(database_name).collection(partners_collection_name).find().toArray();
            res.send(data);
        });

        app.get('/totalusercount', async (request, response) => {
            const data = await mongoClient.db(database_name).collection(users_collection_name).countDocuments();
            response.send({ totalUser: data });
        });

        app.get('/userscount', async (request, response) => {
            const id = request.query.id;
            const query = { email: id };
            const data = await mongoClient.db(database_name).collection(class_collection_name).find(query).project({ enroll: 1 }).toArray();
            response.send(data);
        });

        app.get('/totalclasscount', async (request, response) => {
            const data = await mongoClient.db(database_name).collection(class_collection_name).countDocuments();
            response.send({ totalClass: data });
        });

        app.get('/totalenrollcount', async (request, response) => {
            const data = await mongoClient.db(database_name).collection(class_collection_name).find().toArray();
            let total = 0;
            data.map((value, index) => {
                total = total + value.enroll;
            });
            response.send({ total });
        });

        app.get('/totalassignmentcount', verifyUser, async (request, response) => {
            const id = request.query.id;
            const query = { class_id: id };
            const data = await mongoClient.db(database_name).collection(assignments_collection_name).countDocuments();
            response.send({ total_assignment: data });
        });

        app.get('/assignments', verifyUser, async (request, response) => {
            const id = request.query.id;
            const query = { class_id: id };
            const data = await mongoClient.db(database_name).collection(assignments_collection_name).find(query).toArray();
            response.send(data);
        });

        app.post('/submitassignment', verifyUser, async (request, response) => {
            const id = request.query.id;
            const query = { class_id: id };
            const assignment = request.body;
            const data = await mongoClient.db(database_name).collection(assignments_collection_name).insertOne(assignment);
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