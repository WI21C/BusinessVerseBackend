const { Sequelize, DataTypes } = require("sequelize");

class Synonyms {
  static defineModel(sequelize) {
    return sequelize.define("synonyms", {
      name: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      i_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      software: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
    }, {
      timestamps: true,
      underscored: true,
    });
  }
}

module.exports = Synonyms;