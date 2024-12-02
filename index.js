const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
require('dotenv').config()
const e = require('cors');
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jqnby.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();
        const database = client.db("coffeeDB");
        const coffeeCollection = database.collection("coffee");
        const userCollection = client.db('coffeeDB').collection('users');

        //multiple get
        app.get('/coffee', async(req, res)=>{
            const cursor = coffeeCollection.find();
            const result = await cursor.toArray();
            res.send(result)
        })

        app.get('/coffee/:id', async(req, res) =>{
            const id = req.params.id;
            const query = {_id : new ObjectId(id)}
            const result = await coffeeCollection.findOne(query);
            res.send(result);
        })

        app.post('/coffee', async(req, res)=>{
            const newCoffee = req.body;
            // console.log(newCoffee);
            const result = await coffeeCollection.insertOne(newCoffee);
            res.send(result);
        })

        app.put('/coffee/:id', async(req, res) =>{
            const id = req.params.id;
            const filter = {_id : new ObjectId(id)};
            const option = {upsert : true};
            const updateCoffee = req.body;
            const coffee = {
                $set: {
                    name: updateCoffee.name, quantity: updateCoffee.quantity, supplier: updateCoffee.supplier, taste: updateCoffee.taste, category: updateCoffee.category, details: updateCoffee.details, photo: updateCoffee.photo
                }
            }
            const  result = await coffeeCollection.updateOne(filter, coffee, option);
            res.send(result);
        })

        app.delete('/coffee/:id', async(req, res) => {
           const id = req.params.id;
           const queary = {_id : new ObjectId(id)}
           const result = await coffeeCollection.deleteOne(queary);
           res.send(result);
        })

        //user related database
        app.get('/users', async(req, res)=> {
            const cursor = userCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        app.post('/users', async(req, res)=> {
            const user = req.body;
            const result = await userCollection.insertOne(user);
            res.send(result);
        })

        app.patch('/users', async(req, res) => {
            const email = req.body.email;
            const filter = {email};
            const updatedDoc = {
                $set: {
                    lastSignInTime: req.body?.lastSignInTime
                }
            }
            const result = await userCollection.updateOne(filter, updatedDoc);
            res.send(result);
        })

        app.delete('/users/:id', async(req, res)=>{
            const id = req.params.id;
            const quary = {_id : new ObjectId(id)}
            const result = await userCollection.deleteOne(quary);
            res.send(result);
        })

        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        // console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Coffee making server is Running');
})

app.listen(port, () => {
    // console.log("Coffee Server is running on port", port);
})
