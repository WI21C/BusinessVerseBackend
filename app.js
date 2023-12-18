require("dotenv").config();
const express = require("express");
const { Sequelize, DataTypes } = require("sequelize");

const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());

const sequelize = new Sequelize(process.env.DB_URL, {
  dialect: "postgres",
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
});

sequelize
  .sync()
  .then(() => {
    console.log("Database connected");
  })
  .catch((err) => {
    console.log(err);
  });

//   model schema
const post = sequelize.define("post", {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  content: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/get-posts", async (req, res) => {
  try {
    const allPosts = await post.findAll();
    res.json(allPosts);
  } catch (err) { 
    console.log(err);
  }
});

app.get("/User/getUser", (req, res) => {
  res.send("Hello World!");
});

app.get("/Items/getItems", (req, res) => {
  res.send("Hello World!");
});

app.get("/User/checkLogin", (req, res) => {
  res.send("Hello World!");
});


app.post("/create-post", async (req, res) => {
  const { title, content } = req.body;
  try {
    const newPost = await post.create({ title, content });
    res.json(newPost);
  } catch (err) {
    console.log(err);
  }
});

app.post("/User/createUser", async (req, res) => {
  const { title, content } = req.body;
  try {
    const newPost = await post.create({ title, content });
    res.json(newPost);
  } catch (err) {
    console.log(err);
  }
});

app.post("/Item/createItem", async (req, res) => {
  const { title, content } = req.body;
  try {
    const newPost = await post.create({ title, content });
    res.json(newPost);
  } catch (err) {
    console.log(err);
  }
});



app.patch('/Item/editItem/:id', (req, res) => {
});

app.put('/Item/editItem/:id', (req, res) => {
});

app.patch('/User/editUser/:id', (req, res) => {
});

app.put('/User/editUser/:id', (req, res) => {
});

app.delete("/User/deleteUser/:id", (req, res) => {
});

app.delete("/Item/deleteItem/:id", (req, res) => {
});




app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
