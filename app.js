require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const { Sequelize, where } = require("sequelize");
const Item = require("./item");
const Group = require("./group");
const Synonyms = require("./synonyms");
const GroupItem = require("./GroupItem");
const cors = require("cors")

const app = express();
app.use(cors());
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
//Definiere das GroupItem Modell
const groupItemModel = GroupItem.defineModel(sequelize);


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
  const { name, description } = req.body;
  try {
    const newItem = await itemModel.create({ name, description });
    res.status(201).json(newItem);
  } catch (err) {
    console.log(err);
    res.status(500).send("Fehler beim Erstellen des Items");
  }
});

app.post("/Group/create", async (req, res) => {
  const { name, description, items} = req.body;
  try {
    const newGroup = await groupModel.create({ name, description, items});
    res.status(201).json(newGroup);
  } catch (err) {
    console.log(err);
    res.status(500).send("Fehler beim Erstellen der Group");
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

app.post("/GroupItem/create", async (req, res) => {
  const { i_id, g_id } = req.body;
  try {
    const newGroupItem = await groupItemModel.create({ i_id, g_id });
    res.status(201).json(newGroupItem);
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


app.get("/Group/getAllItems", async (req, res) => {
  try {
    const allGroups = await groupModel.findAll();
    // Asynchron alle zugehörigen Items für jede Gruppe abrufen
    const groupAndItems = await Promise.all(allGroups.map(async group => {
      const items = await groupItemModel.findAll({
        where: { g_id: group.id },
        attributes: ['i_id'] // Annahme, dass die Spalte im itemModel 'g_id' heißt
      });
      const itemIds = items.map(item => parseInt(item.i_id))
      return {
        ...group.toJSON(), // oder group.dataValues, abhängig von Ihrem ORM
        items: itemIds // Fügt die zugehörigen Items zu jeder Gruppe hinzu
      };
    }));
    res.json(groupAndItems);
  } catch (err) {
    console.log(err);
    res.status(500).send("Probleme bei dem Abrufen");
  }
});


app.get("/Item/get/:id", async (req, res) => {
  try {
    const id=req.params.id;
    const item = await itemModel.findByPk(id);
    // Asynchron alle zugehörigen Items für jede Gruppe abrufen
    /*
    const itemsAndSyns = await Promise.all(allGroups.map(async group => {
      const items = await groupItemModel.findAll({
        where: { g_id: group.id },
        attributes: ['i_id'] // Annahme, dass die Spalte im itemModel 'g_id' heißt
      });
      const itemIds = items.map(item => parseInt(item.i_id))
      return {
        ...group.toJSON(), // oder group.dataValues, abhängig von Ihrem ORM
        items: itemIds // Fügt die zugehörigen Items zu jeder Gruppe hinzu
      };
    }));

    */

    const combined= await item.map(async item => {
      const synonyms = await synonymsModel.findAll({
      where: {i_id: item.id}
    });
    return {
      ...item.toJSON(),
      item: synonyms
    };
    })
    res.json(combined);
  } catch (err) {
    console.log(err);
    res.status(500).send("Probleme bei dem Abrufen");
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

app.get("/Item/getAllSyns", async (req, res) => {
  try {
    const allItems = await itemModel.findAll();
    // Asynchron alle zugehörigen Items für jede Gruppe abrufen
    const itemAndSyns = await Promise.all(allItems.map(async item => {
      const synonyms = await synonymsModel.findAll({
        where: { i_id: item.id }
        //attributes: ['i_id'] // Annahme, dass die Spalte im itemModel 'g_id' heißt
      });
      return {
        ...item.toJSON(), // oder group.dataValues, abhängig von Ihrem ORM
        synonyms: synonyms // Fügt die zugehörigen Items zu jeder Gruppe hinzu
      };
    }));
    res.json(itemAndSyns);
  } catch (err) {
    console.log(err);
    res.status(500).send("Probleme bei dem Abrufen");
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

app.get("/GroupItem/getAll", async (req, res) => {
  try {
    const allGroupItems = await groupItemModel.findAll();
    res.json(allGroupItems); 
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

app.put("/GroupItem/change/:id", async (req, res) => {
  try {
    const id=req.params.id;
    const aktualiserteDaten = req.body;

    const changeGroupItemId = await groupItemModel.findByPk(id);
    if (!changeGroupItemId){
      return res.status(404).send('Eintrag nicht gefunden')
    }
    await changeGroupItemId.update(aktualiserteDaten)
    res.send(changeGroupItemId)
  } catch (err) {
    console.log(err);
    res.status(500).send("Fehler beim Ändern des GroupItems");
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

//delete

app.delete("/Group/deleteById/:id", async (req, res) => {
  try {
    const id = req.params.id;

    // Überprüfen, ob die Gruppe existiert
    const groupToDelete = await groupModel.findByPk(id);
    if (!groupToDelete) {
      return res.status(404).send('Eintrag nicht gefunden');
    }

    // Löschen der Gruppe
    await groupModel.destroy({
      where: { id: id }
    });

    res.send('Eintrag erfolgreich gelöscht');
  } catch (err) {
    console.log(err);
    res.status(500).send('Probleme beim Löschen des Eintrags');
  }
});

app.delete("/Item/deleteById/:id", async (req, res) => {
  try {
    const id = req.params.id;

    // Überprüfen, ob die Gruppe existiert
    const itemToDelete = await itemModel.findByPk(id);
    if (!itemToDelete) {
      return res.status(404).send('Eintrag nicht gefunden');
    }

    // Löschen der Gruppe
    await itemModel.destroy({
      where: { id: id }
    });

    res.send('Eintrag erfolgreich gelöscht');
  } catch (err) {
    console.log(err);
    res.status(500).send('Probleme beim Löschen des Eintrags');
  }
});

app.delete("/Synonym/deleteById/:id", async (req, res) => {
  try {
    const id = req.params.id;

    // Überprüfen, ob die Gruppe existiert
    const synonymToDelete = await synonymsModel.findByPk(id);
    if (!synonymToDelete) {
      return res.status(404).send('Eintrag nicht gefunden');
    }

    // Löschen der Gruppe
    await synonymsModel.destroy({
      where: { s_id: id }
    });

    res.send('Eintrag erfolgreich gelöscht');
  } catch (err) {
    console.log(err);
    res.status(500).send('Probleme beim Löschen des Eintrags');
  }
});

app.delete("/GroupItem/deleteById/:id", async (req, res) => {
  try {
    const id = req.params.id;

    // Überprüfen, ob die Gruppe existiert
    const groupItemToDelete = await groupItemModel.findByPk(id);
    if (!groupItemToDelete) {
      return res.status(404).send('Eintrag nicht gefunden');
    }

    // Löschen der Gruppe
    await groupItemModel.destroy({
      where: { id: id }
    });

    res.send('Eintrag erfolgreich gelöscht');
  } catch (err) {
    console.log(err);
    res.status(500).send('Probleme beim Löschen des Eintrags');
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});