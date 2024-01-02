const { Sequelize, DataTypes } = require("sequelize");

class Item {
  static defineModel(sequelize) {
    return sequelize.define("Item", {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      groups: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: [],
      },
      synonyms: {
        type: DataTypes.ARRAY(DataTypes.JSON),
        defaultValue: [],
        get() {
          const rawValue = this.getDataValue('synonyms');
          if (rawValue && Array.isArray(rawValue)) {
            return rawValue.map((synonym) => ({
              name: synonym.name,
              softwares: synonym.softwares,
              args: synonym.args,
            }));
          }
          return [];
        },
        set(value) {
          if (Array.isArray(value)) {
            this.setDataValue('synonyms', value);
          }
        },
      },
    }, {
      timestamps: true,
      underscored: true,
    });
  }
}

module.exports = Item;
