const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express')
const app = express();
const cors = require('cors');
require('dotenv').config()
const jwt = require('jsonwebtoken')
const port = process.env.PORT || 5000;




// middlewere
app.use(cors());
app.use(express.json());



// json web token verification
const verifyjwt = (req, res, next) => {
    const authHead = req.headers.authorization;
    if (!authHead) {
        return res.status(401).send({ message: 'in authorized access' })
    }

    const token = authHead.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (error, decoded) {
        if (error) {
            res.status(401).send({ message: 'in authorized access' })
        }
        req.decoded = decoded;
    })
    // console.log(token)
    next();

}





// mongodb Connection
const uri = `mongodb+srv://${process.env.USER}:${process.env.PASSWORD}@cluster0.ddhlldi.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


// Mongodb CURD operation
async function run() {
    try {
        const database = client.db('WheelsOnFire');
        const usersCollection = database.collection('users');
        const cyclesCollection = database.collection('Cycles');
        const catagoriessCollection = database.collection('catagories');
        const bookingssCollection = database.collection('bookings');
        // const reviewsCollection = database.collection('reviews');
        // const feturesCollection = database.collection('features');
        // const characterCollection = database.collection('character');


        // provide json web token
        app.get('/jwt', async (req, res) => {
            const email = req.query.email;
            const query = { email: email }
            const user = await usersCollections.findOne(query);
            if (user) {
                const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: "1h" });
                return res.send({ accessToken: token })
            }
            res.status(401).send({ accessToken: '' })
        });
        // verification for admin

        const verifyAdmin = async (req, res, next) => {
            const decodedEmail = req.decoded.email;
            const query = { email: decodedEmail };
            const user = await usersCollections.findOne(query)
            if (user?.role !== 'admin') {
                return res.status(401).send({ message: 'you havent authorization for that' })
            }
            // console.log('inside verify admin', req.decoded.email)


            next()
        };

        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.send(result);
        });


        app.get('/catagories', async (req, res) => {
            const query = {};
            const result = await catagoriessCollection.find(query).toArray();
            res.send(result)
        });

        app.get('/cycles', async (req, res) => {
            const query = {};
            const result = await cyclesCollection.find(query).toArray();
            res.send(result)
        });

        app.get('/cycles/:id', async (req, res) => {
            const catagoryId = parseInt(req.params.id);
            const query = { catagoryId: catagoryId };
            const result = await cyclesCollection.find(query).toArray();
            res.send(result)
        });

        app.get('/cycle/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await cyclesCollection.findOne(query);
            res.send(result)
        });

        app.patch('/cycle/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const options = { upsert: true }
            const updatedDoc = {
                $set: {
                    sold: 'booked'
                }
            }
            const result = await cyclesCollection.updateOne(query, updatedDoc, options);
            res.send(result)
        });


        app.post('/bookings', async (req, res) => {
            const booking = req.body;

            const result = await bookingssCollection.insertOne(booking);
            res.send(result)

        });

        app.get('/userbooking', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const result = await bookingssCollection.find(query).toArray();
            res.send(result)
        })

    }
    finally {

    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('helow world')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})