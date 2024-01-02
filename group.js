const { Sequelize, DataTypes } = require("sequelize");

class Groups {
  static defineModel(sequelize) {
    return sequelize.define("Group", {
      name: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING(255),
        allowNull: true,
      }
    }, {
      timestamps: true,
      underscored: true,
    });
  }
}

module.exports = Groups;
