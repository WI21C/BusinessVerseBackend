const { Sequelize, DataTypes } = require("sequelize");

class Synonyms {
  static defineModel(sequelize) {
    return sequelize.define("synonyms", {
      s_id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true
      },
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
      timestamps: false,
      underscored: true,
    });
  }
}

module.exports = Synonyms;