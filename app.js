require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const { Sequelize } = require("sequelize");
const Item = require("./item");
const Group = require("./group");
const Synonyms = require("./synonyms");

const app = express();
const port = process.env.PORT || 3000;
app.use(bodyParser.json());



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
//Definieren des Synonym-Modells
const synonymsModel = Synonyms.defineModel(sequelize);


sequelize
  .sync()
  .then(() => {
    console.log("Database connected");
  })
  .catch((err) => {
    console.log(err);
  });



//Posts

app.post("/Item/create", async (req, res) => {
  const { name, description, g_id } = req.body;
  try {
    const newItem = await itemModel.create({ name, description, g_id });
    res.status(201).json(newItem);
  } catch (err) {
    console.log(err);
    res.status(500).send("Fehler beim Erstellen des Items");
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

app.post("/Synonym/create", async (req, res) => {
  const { name, i_id, software} = req.body;
  try {
    const newSynonym = await synonymsModel.create({ name, i_id, software});
    res.status(201).json(newSynonym);
  } catch (err) {
    console.log(err);
    res.status(500).send("Fehler beim Erstellen des Items");
  }
});

//Get All

app.get("/Group/getAll", async (req, res) => {
  try {
    const allGroups = await groupModel.findAll();
    res.json(allGroups); 
  } catch (err) {
    console.log(err);
  }
});

app.get("/Item/getAll", async (req, res) => {
  try {
    const allItems = await itemModel.findAll();
    res.json(allItems); 
  } catch (err) {
    console.log(err);
  }
});

app.get("/Synonym/getAll", async (req, res) => {
  try {
    const allSynonyms = await synonymsModel.findAll();
    res.json(allSynonyms); 
  } catch (err) {
    console.log(err);
  }
});


//Puts

app.put("/Group/change/:id", async (req, res) => {
  try {
    const id=req.params.id;
    const aktualiserteDaten = req.body;

    const changeGroupId = await groupModel.findByPk(id);
    if (!changeGroupId){
      return res.status(404).send('Eintrag nicht gefunden')
    }
    await changeGroupId.update(aktualiserteDaten)
    res.send(changeGroupId)
  } catch (err) {
    console.log(err);
    res.status(500).send("Fehler beim Ändern des Items");
  }
});

app.put("/Item/change/:id", async (req, res) => {
  try {
    const id=req.params.id;
    const aktualiserteDaten = req.body;

    const changeItemId = await itemModel.findByPk(id);
    if (!changeItemId){
      return res.status(404).send('Eintrag nicht gefunden')
    }
    await changeItemId.update(aktualiserteDaten)
    res.send(changeItemId)
  } catch (err) {
    console.log(err);
    res.status(500).send("Fehler beim Ändern des Items");
  }
});

app.put("/Synonym/change/:id", async (req, res) => {
  try {
    const id=req.params.id;
    const aktualiserteDaten = req.body;

    const changeSynonymId = await synonymsModel.findByPk(id);
    if (!changeSynonymId){
      return res.status(404).send('Eintrag nicht gefunden')
    }
    await changeSynonymId.update(aktualiserteDaten)
    res.send(changeSynonymId)
  } catch (err) {
    console.log(err);
    res.status(500).send("Fehler beim Ändern des Items");
  }
});

//get by id

app.get("/Item/getById/:id", async (req, res) => {
  try {
    const id=req.params.id;

    const idItem = await itemModel.findByPk(id);
    if (!idItem){
      return res.status(404).send('Eintrag nicht gefunden')
    }
    res.json(idItem); 
  } catch (err) {
    console.log(err);
  }
});

app.get("/Group/getById/:id", async (req, res) => {
  try {
    const id=req.params.id;
    
    const idGroup = await groupModel.findByPk(id);
    if (!idGroup){
      return res.status(404).send('Eintrag nicht gefunden')
    }
    res.json(idGroup); 
  } catch (err) {
    console.log(err);
  }
});

app.get("/Synonym/getById/:id", async (req, res) => {
  try {
    const id=req.params.id;
    
    const idSynonym = await synonymsModel.findByPk(id);
    if (!idSynonym){
      return res.status(404).send('Eintrag nicht gefunden')
    }
    res.json(idSynonym); 
  } catch (err) {
    console.log(err);
  }
});



app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});






