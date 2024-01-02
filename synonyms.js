const { Sequelize, DataTypes } = require("sequelize");

class Synonyms {
  static defineModel(sequelize) {
    return sequelize.define("post", {
      s_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
      name: {
        type: DataTypes.STRING(50),
        allowNull: true,
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