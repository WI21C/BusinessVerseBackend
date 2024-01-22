const { Sequelize, DataTypes } = require("sequelize");
const { v4: uuidv4 } = require('uuid');


class Item {
  static defineModel(sequelize) {
    return sequelize.define("item", {
      id: {
        type: DataTypes.UUID, // Use UUID data type
        defaultValue: () => uuidv4(), // Use the default value with uuid_generate_v4()
        primaryKey: true,
        allowNull: true,
        unique: true,
      },
      name: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING(255),
        allowNull: false,
      }
    }, {
      timestamps: true,
      underscored: true,
    });
  }
}

module.exports = Item;
