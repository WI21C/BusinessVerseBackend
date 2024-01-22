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
        //defaultValue: Sequelize.literal('uuid_generate_v4()'), // Use the default value with uuid_generate_v4()
        allowNull: false,
      },
      software: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      args1: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      args2: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      args3: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      args4: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      args5: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      args6: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      args7: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      args8: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      args9: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      args10: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      args11: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      args12: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      args13: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      args14: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      args15: {
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