const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 3000;



// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ba90y0b.mongodb.net/?appName=Cluster0`;



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
        const acceptedCollection = db.collection('accepted_jobs')


        app.post('/jobs', async (req, res) => {
            const job = req.body;
            job.postedDate = new Date();
            const result = await jobsCollection.insertOne(job);
            res.send(result);
        });
            // All Jobs (with sorting option)
        app.get('/allJobs', async (req, res) => {
            const sortOrder = req.query.sort === 'asc' ? 1 : -1; 
            const cursor = jobsCollection.find().sort({ postedDate: sortOrder });
            const result = await cursor.toArray();
            res.send(result);
        });

        //  Update Job by ID
        app.patch('/jobs/:id', async (req, res) => {
            const id = req.params.id;
            const updateJob = req.body;

            const filter = { _id: new ObjectId(id) };

            const updateDoc = {
                $set: {
                    title: updateJob.title,
                    category: updateJob.category,
                    summary: updateJob.summary,
                    coverImage: updateJob.coverImage,
                },
            }

            const result = await jobsCollection.updateOne(filter, updateDoc);
            res.send(result)

        })
        // My added Job
        app.get('/myAddedJobs', async (req, res) => {
            const email = req.query.email;
            if (!email) {
                return res.status(400).send({ message: 'Email is required' })
            }
            const query = { userEmail: email }
            const result = await jobsCollection.find(query).sort({ _id: -1 }).toArray()
            res.send(result)
        })

        // Accept a job
        app.post('/accepted-jobs', async (req, res) => {
            const acceptedJob = req.body;
            const result = await acceptedCollection.insertOne(acceptedJob);
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

        //get all accepted jobs
        app.get('/accepted-jobs', async (req, res) => {
            const cursor = acceptedCollection.find().sort({ _id: -1 });
            const result = await cursor.toArray();
            res.send(result);
        });

        //  Delete accepted job by ID
        app.delete('/accepted-jobs/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await acceptedCollection.deleteOne(query)
            res.send(result)

        })



        // await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

    }
    finally {

    }
}

run().catch(console.dir)

app.listen(port, () => {
    console.log(`freelance marketPlace server is running on port ${port}`)
})