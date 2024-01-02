require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const { Sequelize } = require("sequelize");
const Item = require("./item");
const Group = require("./group");

const app = express();
const port = process.env.PORT || 3000;
app.use(bodyParser.json());


/*
class Item {
  constructor(id, name, description, synonyms) {
      this.id = id;
      this.name = name;
      this.description = description;
      this.synonyms = synonyms.map(syn => new Synonym(syn.name, syn.softwares, syn.args));
  }
}
*/


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

//Definieren des Item-Modells
const itemModel = Item.defineModel(sequelize);
//Definieren des Group-Modells
const groupModel = Group.defineModel(sequelize);


sequelize
  .sync()
  .then(() => {
    console.log("Database connected");
  })
  .catch((err) => {
    console.log(err);
  });

//-------------------------------------------------------------------------------------

//   model schema

/*
const item = sequelize.define("item", {
  id: {
    primaryKey: true,
    type: DataTypes.STRING,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  synonyms: {
    type: DataTypes.ARRAY(DataTypes.JSON)
  }
});

*/



/*app.post("/Item/create", async (req, res) => {
  const itemData = req.body;
  const item = new Item(itemData.id, itemData.name, itemData.description, itemData.synonyms);
  res.status(201).send(itemData.name);
});
*/
/*
app.get("/Item/getAll", async (req, res) => {
  try {
    const allItems = await Item.findAll();
    res.json(allItems);
  } catch (err) {
    console.log(err);
  }
});
*/

app.post("/Item/create", async (req, res) => {
  const { name, description, groups, synonyms } = req.body;
  try {
    const newItem = await itemModel.create({ name, description, groups, synonyms });
    res.status(201).json(newItem);
  } catch (err) {
    console.log(err);
    res.status(500).send("Fehler beim Erstellen des Items");
  }
});

app.get("/Item/getAll", async (req, res) => {
  try {
    const allItems = await item.findAll();
    res.json(allItems); 
  } catch (err) {
    console.log(err);
  }
});


app.get("/get-posts", async (req, res) => {
  try {
    const allPosts = await post.findAll();
    res.json(allPosts);
  } catch (err) {
    console.log(err);
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

app.get("/Group/getAll", async (req, res) => {
  try {
    const allGroups = await groupModel.findAll();
    res.json(allGroups); 
  } catch (err) {
    console.log(err);
  }
});

app.post("/Group/create", async (req, res) => {
  const { name, description} = req.body;
  try {
    const newGroup = await groupModel.create({ name, description});
    res.status(201).json(newGroup);
  } catch (err) {
    console.log(err);
    res.status(500).send("Fehler beim Erstellen des Items");
  }
});

app.put("/Group/change/:id", async (req, res) => {
  try {
    const id=req.params.id
    const aktualiserteDaten = req.body;
    //const {name, description} = req.body;

    const changeGroupId = await groupModel.findByPk(id);
    if (!changeGroupId){
      return res.status(404).send('Eintrag nicht gefunden')
    }
    await changeGroupId.update(aktualiserteDaten)
    res.send(changeGroupId)
    //res.status(201).json(changeGroupId);
  } catch (err) {
    console.log(err);
    res.status(500).send("Fehler beim Ändern des Items");
  }
});
