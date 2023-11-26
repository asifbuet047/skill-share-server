const PORT = process.env.PORT || 5000;
const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const JWT_SECRET = process.env.JWT_SECRECT_KEY;


const uri = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@cluster0.2jixdw6.mongodb.net/?retryWrites=true&w=majority`;

const mongoClient = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});



app.get('/', (req, res) => {
    res.send(`SkillShare server is ready`)
  })
  
  app.listen(PORT, () => {
    console.log(`SkillShare server on port ${PORT}`);
  })