require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const { Sequelize, where } = require("sequelize");
const Item = require("./item");
const Group = require("./group");
const Synonyms = require("./synonyms");
const GroupItem = require("./GroupItem");
const User = require("./user");
const cors = require("cors");
const bcrypt = require("bcrypt");

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
//Definieren des User Modells
const userModel = User.defineModel(sequelize);


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
  const { name, description, group, synonyms } = req.body;
  try {
    const newItem = await itemModel.create({ name, description });

    let createdSynonyms = [];
    if (Array.isArray(synonyms)) {
      for (const synonym of synonyms) {
        let synonymModelObject = {
          name: synonym.name,
          i_id: newItem.id,
          software: synonym.software
        };

        let argsArray = [];
        if (Array.isArray(synonym.arg)) {
          synonym.arg.forEach((argValue, index) => {
            if (index < 15) {
              argsArray.push(argValue);
            }
          });
        }
        synonymModelObject.args = argsArray;

        const createdSynonym = await synonymsModel.create(synonymModelObject);

        let synonymOutputObject = JSON.parse(JSON.stringify(createdSynonym));
        synonymOutputObject.args = argsArray;

        // Entfernen von args1 bis args15 aus dem Antwortobjekt
        for (let i = 1; i <= 15; i++) {
          delete synonymOutputObject[`args${i}`];
        }

        createdSynonyms.push(synonymOutputObject);
      }
    }

    if (group) {
      const newGroupItem = await groupItemModel.create({
        i_id: newItem.id,
        g_id: group
      });

      res.status(201).json({ item: newItem, groupItem: newGroupItem, synonyms: createdSynonyms });
    } else {
      res.status(201).json({ item: newItem, synonyms: createdSynonyms });
    }
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

app.post("/User/create", async (req, res) => {
  const { id, name, email, password, roles } = req.body;
  const userRolesArray = await req.body.roles;


  try {
    // Checken, ob es die email schon gibt
    const existingUser = await userModel.findOne({ where: { email: email } });

    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists in the database' });
    }

    const userRolesString = userRolesArray.join(";");
    // falls die email noch frei ist erstelle neuen user
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await userModel.create({ id, name, email, password: hashedPassword, roles: userRolesString });
    res.status(201).json(newUser);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error creating user");
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
    const groupAndItems = await Promise.all(allGroups.map(async group => {
      const items = await groupItemModel.findAll({
        where: { g_id: group.id },
        attributes: ['i_id']
      });

      let itemIds = [];
      // Überprüfen, ob 'items' definiert und ein Array ist
      if (items && Array.isArray(items)) {
        itemIds = items.map(item => item.i_id);
      }

      return {
        ...group.toJSON(),
        items: itemIds
      };
    }));
    res.json(groupAndItems);
  } catch (err) {
    console.error(err);
    res.status(500).send("Probleme bei dem Abrufen");
  }
});



/*app.get("/Group/getAllItems", async (req, res) => {
  try {
    const allGroups = await groupModel.findAll();
    // Asynchron alle zugehörigen Items für jede Gruppe abrufen
    const groupAndItems = await Promise.all(allGroups.map(async group => {
      const [items] = await groupItemModel.findAll({
        where: { g_id: group.id },
        attributes: ['i_id'] // Annahme, dass die Spalte im itemModel 'g_id' heißt
      });

      let itemIds = [];
      if (items.length !== 0) {
        itemIds = items.map(item => item.i_id);
      }

      if (items.length !== 0){
        const itemIds = items.map(item => item.i_id )
      }
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
*/



app.get("/Item/getAllItems", async (req, res) => {
  try {
    const allItems = await itemModel.findAll();
    res.json(allItems); 
  } catch (err) {
    console.log(err);
  }
});

app.get("/Item/getAll", async (req, res) => {
  try {
    const allItems = await itemModel.findAll();
    const itemAndSyns = await Promise.all(allItems.map(async item => {
      const synonyms = await synonymsModel.findAll({
        where: { i_id: item.id }
      });

      const transformedSynonyms = synonyms.map(synonym => {
        const synonymData = synonym.toJSON();
        let argsArray = [];

        for (let i = 1; i <= 15; i++) {
          let argKey = `args${i}`;
          if (synonymData[argKey]) {
            argsArray.push(synonymData[argKey]);
          }
        }

        return {
          id: synonymData.id,
          name: synonymData.name,
          software: synonymData.software,
          args: argsArray
        };
      });

      return {
        ...item.toJSON(),
        synonyms: transformedSynonyms
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

app.get("/User/getAllUsers", async (req, res) => {
  try {
    const allUsers = await userModel.findAll();
    res.json(allUsers);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error retrieving all users");
  }
});



//Puts

/*
app.put("/Item/update/:id", async (req, res) => {
  const { id } = req.params;
  const { name, description, group, synonyms } = req.body;

  try {
    // Suchen des Items über seine ID
    const itemToUpdate = await itemModel.findByPk(id);

    // Überprüfen, ob das Item existiert
    if (!itemToUpdate) {
      return res.status(404).send("Item nicht gefunden");
    }

    // Aktualisieren des Items
    const updatedItem = await itemToUpdate.update({ name, description });

    // Verarbeiten der Synonyme, falls vorhanden
    let updatedSynonyms = [];
    if (Array.isArray(synonyms)) {
      // Löschen alter Synonyme (optional, abhängig von Geschäftslogik)
      await synonymsModel.destroy({ where: { i_id: id } });

      for (const synonym of synonyms) {
        // Erstellen eines Objekts für Synonym-Daten
        let synonymData = {
          name: synonym.name,
          software: synonym.software,
          i_id: id
        };

        // Hinzufügen der args-Werte als args1 bis args15
        synonym.arg.forEach((value, index) => {
          synonymData[`args${index + 1}`] = value;
        });

        const updatedSynonym = await synonymsModel.create(synonymData);
        updatedSynonyms.push(updatedSynonym);
      }
    }

    // Aktualisieren der Gruppenzugehörigkeit, falls vorhanden
    if (group) {
      const [updatedGroupItem, created] = await groupItemModel.findOrCreate({
        where: { i_id: id },
        defaults: { i_id: id, g_id: group }
      });

      if (!created) {
        await updatedGroupItem.update({ g_id: group });
      }

      res.status(200).json({ item: updatedItem, groupItem: updatedGroupItem, synonyms: updatedSynonyms });
    } else {
      res.status(200).json({ item: updatedItem, synonyms: updatedSynonyms });
    }

  } catch (err) {
    console.log(err);
    res.status(500).send("Fehler beim Aktualisieren des Items");
  }
});
*/
app.put("/Item/change/:id", async (req, res) => {
  const { id } = req.params;
  const { name, description, group, synonyms } = req.body;

  try {
    // Suchen des Items über seine ID
    const itemToUpdate = await itemModel.findByPk(id);

    // Überprüfen, ob das Item existiert
    if (!itemToUpdate) {
      return res.status(404).send("Item nicht gefunden");
    }

    // Aktualisieren des Items
    const updatedItem = await itemToUpdate.update({ name, description });

    // Verarbeiten der Synonyme, falls vorhanden
    let updatedSynonyms = [];
    if (Array.isArray(synonyms)) {
      // Löschen alter Synonyme (optional, abhängig von Geschäftslogik)
      await synonymsModel.destroy({ where: { i_id: id } });

      for (const synonym of synonyms) {
        // Erstellen eines Objekts für Synonym-Daten
        let synonymData = {
          name: synonym.name,
          software: synonym.software,
          i_id: id
        };

        // Hinzufügen der args-Werte als args1 bis args15
        synonym.args.forEach((value, index) => {
          synonymData[`args${index + 1}`] = value;
        });

        const createdSynonym = await synonymsModel.create(synonymData);

        // Umformen der Synonym-Daten für die Antwort
        let synonymResponse = {
          name: createdSynonym.name,
          software: createdSynonym.software,
          args: synonym.args
        };
        
        updatedSynonyms.push(synonymResponse);
      }
    }

    // Aktualisieren der Gruppenzugehörigkeit, falls vorhanden
    if (group) {
      const [updatedGroupItem, created] = await groupItemModel.findOrCreate({
        where: { i_id: id },
        defaults: { i_id: id, g_id: group }
      });

      if (!created) {
        await updatedGroupItem.update({ g_id: group });
      }

      res.status(200).json({ item: updatedItem, groupItem: updatedGroupItem, synonyms: updatedSynonyms });
    } else {
      res.status(200).json({ item: updatedItem, synonyms: updatedSynonyms });
    }

  } catch (err) {
    console.log(err);
    res.status(500).send("Fehler beim Aktualisieren des Items");
  }
});




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

app.put("/User/changeUser/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const updatedData = req.body;

    const userToUpdate = await userModel.findByPk(userId);
    if (!userToUpdate) {
      return res.status(404).send('User not found');
    }

    if (updatedData.password){
      //erst hashen vor dem updaten
      const hashedPassword = await bcrypt.hash(updatedData.password, 10);
      updatedData.password = hashedPassword;
      }

    await userToUpdate.update(updatedData);
    res.send(userToUpdate);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error updating user");
  }
});


//get by id

app.get("/Item/getById/:id", async (req, res) => {
  try {
    const id=req.params.id;
    const item = await itemModel.findByPk(id);
    
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

app.get("/User/getUser/:id", async (req, res) => {
  try {
    const u_id = req.params.id;
    
    const user = await userModel.findByPk(u_id);
    if (!user){
      return res.status(404).send('User not found')
    }

    user.roles = user.roles.split(';');

    res.json(user); 
  } catch (err) {
    console.log(err);
    res.status(500).send("Error retrieving user");
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

//löschen eines Items
app.delete("/Item/delete/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Starten einer Transaktion
    const transaction = await sequelize.transaction();

    // Löschen der Synonyme
    await synonymsModel.destroy({ where: { i_id: id } }, { transaction });

    // Löschen des zugehörigen groupItems
    await groupItemModel.destroy({ where: { i_id: id } }, { transaction });

    // Löschen des Items selbst
    const deleteResult = await itemModel.destroy({ where: { id: id } }, { transaction });

    // Überprüfen, ob das Item existierte und gelöscht wurde
    if (deleteResult === 0) {
      // Wenn das Item nicht gefunden wurde, Transaktion zurückrollen und Fehlermeldung senden
      await transaction.rollback();
      return res.status(404).send("Item nicht gefunden");
    }

    // Commit der Transaktion
    await transaction.commit();

    // Rückmeldung, dass das Item und seine Verknüpfungen erfolgreich gelöscht wurden
    res.status(200).send(`Item mit der ID ${id} und alle zugehörigen Daten wurden erfolgreich gelöscht.`);
  } catch (err) {
    console.log(err);
    // Im Fehlerfall Transaktion zurückrollen
    if (transaction) await transaction.rollback();
    res.status(500).send("Fehler beim Löschen des Items");
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

app.delete("/User/deleteUser/:id", async (req, res) => {
  try {
    const userId = req.params.id;

    // Ünerprüfen ob User existiert
    const userToDelete = await userModel.findByPk(userId);
    if (!userToDelete) {
      return res.status(404).send('User not found');
    }

    // User löschen
    await userModel.destroy({
      where: { u_id: userId }
    });

    res.send('User successfully deleted');
  } catch (err) {
    console.log(err);
    res.status(500).send('Problem deleting the user');
  }
});

// Methode funktioniert, wenn die Attribute als Teil der URL, also  http://localhost:5432/User/checkLogin?email=Luis@dhbw.com&password=Passwort€99, übergeben werden. Eventuell nochmal mit Frontend über Passwörter reden und gemeinsam testen
app.post("/User/checkLogin", async (req, res) => {
  const { email, password } = req.body;
  console.log(email, password);

  if (!email || !password) {
    return res.status(400).send('Both email and password are required');
  }

  try {
    const user = await userModel.findOne({ where: { email: email } });

    if (!user) {
      return res.status(405).send('User not found');
    }

    // Vergleiche das eingegebene Passwort mit dem in der Datenbank gespeicherten Passwort
    const isValidPassword = await bcrypt.compare(password, user.password);
    user.roles = user.roles.split(';');

    if (isValidPassword) {
      return res.json({ user, success: true });
    } else {
      return res.json({ ID: null, success: false, error: 'Invalid credentials' });
    }

  } catch (err) {
    console.log(err);
    res.status(500).send("Error checking login");
  }
});


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});