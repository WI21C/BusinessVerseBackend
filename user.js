const { Sequelize, DataTypes } = require("sequelize");

class User {
  static defineModel(sequelize) {
    return sequelize.define(
      "users",
      {
        id: {
          type: DataTypes.UUID, // Use UUID data type
          defaultValue: Sequelize.literal('uuid_generate_v4()'), // Use the default value with uuid_generate_v4()
          primaryKey: true,
          allowNull: false,
          unique: true,
        },
        name: {
          type: DataTypes.STRING(50),
          allowNull: false
        },
        email: {
          type: DataTypes.STRING(255),
          allowNull: false
        },
        password: {
          type: DataTypes.STRING(100),
          allowNull: false
        },
        roles: {
          type: DataTypes.STRING(255),
          allowNull: true
        },
      },
      {
        timestamps: false // Deaktiviere die automatischen Zeitstempel  Für Doku: schlechte Abspache mit db-Team: sequelize erstellt automatisch einen timestamp außer man deaktiviert in explizit. 
      }
    );
  }
}

module.exports = User;