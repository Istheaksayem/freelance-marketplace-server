const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 3000;





// middleware
app.use(cors());
app.use(express.json());


const uri = "mongodb+srv://freelancedbUser:WxkW3r7Fx1yU77KF@cluster0.ba90y0b.mongodb.net/?appName=Cluster0";

// WxkW3r7Fx1yU77KF
// freelancedbUser

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

app.get('/', (req, res) => {
    res.send('freelance marketplace server is running')
})

async function run() {
    try {
        await client.connect();

        const db = client.db('freelance_db')
        const jobsCollection = db.collection('jobs')

        app.post('/jobs', async (req, res) => {
            const newJob = req.body;
            const result = await jobsCollection.insertOne(newJob)
            res.send(result)
        })
        // latest job 
        app.get('/latest-jobs', async (req, res) => {
            const cursor = jobsCollection.find().sort({ _id: -1 }).limit(6)
            const result = await cursor.toArray();
            res.send(result)
        })
        app.get('/allJobs', async (req, res) => {
            const cursor = jobsCollection.find().sort({ _id: -1 })
            const result = await cursor.toArray();
            res.send(result)
        })

        app.get("/allJobs/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await jobsCollection.findOne(query);
            res.send(result);
        });



        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

    }
    finally {

    }
}

run().catch(console.dir)

app.listen(port, () => {
    console.log(`freelance marketPlace server is running on port ${port}`)
})