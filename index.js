const express = require('express')
const cors = require('cors')
require('dotenv').config();
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

//db connect code


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.aoukuaq.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
      return res.status(401).send({ message: 'unauthorized access' });
  }
  const token = authHeader.split(' ')[1];

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
      if (err) {
          return res.status(403).send({ message: 'Forbidden access' });
      }
      req.decoded = decoded;
      next();
  })
}

async function run() {
  try {
    const servicesCollection = client.db('wanderlustDB').collection('services');
    const reviewsCollection = client.db('wanderlustDB').collection('reviews')

    //JWT token api
    app.post('/jwt',(req,res) =>{
      const user = req.body;
      console.log(user);
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn:'1h'});
      res.send({token});
    })
    // homepage service api with only 3 services
    app.get('/services', async (req, res) => {
      const query = {}
      const cursor = servicesCollection.find(query);
      const services = await cursor.limit(3).toArray();
      res.send(services);
    });

    //all service get api
    app.get('/allServices', async (req, res) => {
      const query = {}
      const cursor = servicesCollection.find(query);
      const services = await cursor.toArray();
      res.send(services);
    });

    //get a single service item api
    app.get('/services/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) }
      const service = await servicesCollection.findOne(query);
      res.send(service);
    });

    //post api for review 
    app.post('/reviews', async (req, res) => {
      const review = req.body;
      const result = await reviewsCollection.insertOne(review);
      res.send(result);
    });

    //get api for review
    app.get('/reviews', async (req, res) => {
      let query = {}
      if (req.query.service_id) {
        query = {
          service_id: req.query.service_id
        }
      }
      const cursor = reviewsCollection.find(query).sort({"date":-1});
      const reviews = await cursor.toArray();
      res.send(reviews);
    });

    //get a sinle review api using id
    app.get('/reviews/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) }
      const service = await reviewsCollection.findOne(query);
      res.send(service);
    });

    //get api for my-review
    app.get('/myReviews', async (req, res) => {
      let query = {}
      if (req.query.email) {
        query = {
          user_email: req.query.email
        }
      }
      const cursor = reviewsCollection.find(query);
      const reviews = await cursor.toArray();
      res.send(reviews);
    });

    //update a user review
    app.put('/reviews/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const user = req.body;
      const option = { upsert: true };
      const updatedUser = {
        $set: {
          review_name: user.review_name,
          // service_title: user.service_title,
          review_text: user.review_text
        }
      }
      const result = await reviewsCollection.updateOne(filter, updatedUser, option);
      res.send(result);
    })

    //delete api for my-review
    app.delete('/myReviews/:id', async (req, res) => {
      const id = req.params.id
      console.log(id);
      const query = { _id: ObjectId(id) }
      const result = await reviewsCollection.deleteOne(query)
      res.send(result)
    });

    //post services
    app.post('/addService', async (req, res) => {
      const user = req.body;
      // console.log(user);
      const result = await servicesCollection.insertOne(user)
      res.send(result);
  });
  }
  finally {

  }
}
run().catch(err => console.error(err))


app.get('/', (req, res) => {
  res.send('wanderlust server is running')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})