
// Creating our Buzz model for posts
module.exports = function (sequelize, DataTypes) {
  var Buzz = sequelize.define("Buzz", {
    freezeTableName: true,
    author_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    body: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1, 140]
      }
    },
    reply_to: {
      type: DataTypes.INTEGER,
      allowNull: true,
    }
  });

  Buzz.associate = function (models) {
    // We're saying that a Post should belong to an Author
    // A Post can't be created without an Author due to the foreign key constraint
    Buzz.belongsTo(models.User, {
      foreignKey: {
        allowNull: false
    }
  });
  };

  return Buzz;
};
