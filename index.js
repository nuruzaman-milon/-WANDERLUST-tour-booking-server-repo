const express = require('express')
const cors = require('cors')
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express()
const port = process.env.PORT||5000;

//middleware
app.use(cors());
app.use(express.json());

//db connect code


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.aoukuaq.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
        const servicesCollection = client.db('wanderlustDB').collection('services');

        // homepage service api with only 3 services
        app.get('/services', async(req,res) =>{
        const query = {}
        const cursor = servicesCollection.find(query);
        const services = await cursor.limit(3).toArray();
        res.send(services);
        })

        //all service get api
        app.get('/allServices', async(req,res) =>{
          const query = {}
          const cursor = servicesCollection.find(query);
          const services = await cursor.toArray();
          res.send(services);
          })
    }
    finally{

    }
}
run().catch(err=>console.error(err))


app.get('/', (req, res) => {
  res.send('wanderlust server is running')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})