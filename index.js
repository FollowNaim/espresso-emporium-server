const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

// MiddleWear
app.use(cors());
app.use(express.json());
require("dotenv").config();

app.get("/", (req, res) => {
  res.send("Coffee server is running");
});

app.get("/hello", (req, res) => {
  res.send("hello world");
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.sdg7y.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // await client.connect();
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
    const coffeesCollection = client.db("coffeesDB").collection("coffees");

    // adding new coffes to the database
    app.post("/coffees", async (req, res) => {
      const coffee = req.body;
      const result = await coffeesCollection.insertOne(coffee);
      res.send(result);
    });

    // getting all the coffes from the database
    app.get("/coffees", async (req, res) => {
      const result = await coffeesCollection.find().toArray();
      res.send(result);
    });

    // getting only single data from api via id
    app.get("/coffees/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await coffeesCollection.findOne(query);
      res.send(result);
    });

    // Updating coffee data
    app.put("/coffees/:id", async (req, res) => {
      const id = req.params.id;
      const coffee = req.body;
      const updatedCoffee = {
        $set: {
          name: coffee.name,
          chef: coffee.chef,
          supplier: coffee.nasupplierme,
          taste: coffee.taste,
          category: coffee.category,
          details: coffee.details,
          photo: coffee.photo,
        },
      };
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const result = await coffeesCollection.updateOne(
        filter,
        updatedCoffee,
        options
      );
      res.send(result);
    });

    // Delete a coffee
    app.delete("/coffees/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await coffeesCollection.deleteOne(query);
      res.send(result);
    });

    // Find coffee via category
    app.get("/coffees/category/:category", async (req, res) => {
      const category = req.params.category;
      const query = { category: category };
      const result = await coffeesCollection.find(query).toArray();
      res.send(result);
    });
  } catch (err) {
    await client.close();
    console.log(err);
  }
}
run().catch((err) => {
  console.log(err);
});

// Listening to the port
app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
