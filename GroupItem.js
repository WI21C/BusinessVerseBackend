const { Sequelize, DataTypes } = require("sequelize");

class GroupItem {
  static defineModel(sequelize) {
    return sequelize.define("groupitem", {
      i_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      g_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
    }, {
      timestamps: true,
      underscored: true,
    });
  }
}

module.exports = GroupItem;
