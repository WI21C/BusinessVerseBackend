const { Sequelize, DataTypes } = require("sequelize");

class User {
  static defineModel(sequelize) {
    return sequelize.define(
      "users",
      {
        u_id: {
          type: DataTypes.BIGINT,
          autoIncrement: true,
          primaryKey: true
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
        }
      },
      {
        timestamps: false // Deaktiviere die automatischen Zeitstempel  Für Doku: schlechte Abspache mit db-Team: sequelize erstellt automatisch einen timestamp außer man deaktiviert in explizit. 
      }
    );
  }
}

module.exports = User;
