const { Sequelize, DataTypes } = require("sequelize");

class Synonyms {
  static defineModel(sequelize) {
    return sequelize.define("synonyms", {
      /*s_id: {
        type: DataTypes.UUID, // Use UUID data type
        defaultValue: Sequelize.literal('uuid_generate_v4()'), // Use the default value with uuid_generate_v4()
        primaryKey: true
      },
      */
      name: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      i_id: {
        type: DataTypes.UUID, // Use UUID data type
        defaultValue: Sequelize.literal('uuid_generate_v4()'), // Use the default value with uuid_generate_v4()
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