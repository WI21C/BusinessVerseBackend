const { Sequelize, DataTypes } = require("sequelize");

class GroupItem {
  static defineModel(sequelize) {
    return sequelize.define("itemgroups", {
      i_id: {
        type: DataTypes.UUID, // Use UUID data type
        defaultValue: Sequelize.literal('uuid_generate_v4()'), // Use the default value with uuid_generate_v4()
        allowNull: false,
      },
      g_id: {
        type: DataTypes.UUID, // Use UUID data type
        defaultValue: Sequelize.literal('uuid_generate_v4()'), // Use the default value with uuid_generate_v4()
        allowNull: false,
      },
    }, {
      timestamps: true,
      underscored: true,
    });
  }
}

module.exports = GroupItem;
