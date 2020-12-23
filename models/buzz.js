
// Creating our Buzz model for posts
module.exports = function (sequelize, DataTypes) {
  var Buzz = sequelize.define("Buzz", {
    //text of post
    body: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: [1, 140]
      }
    },
    //id of post it's replying to if applicable
    reply_to: {
      type: DataTypes.INTEGER,
      allowNull: true,
    }
  },
    //don't let Sequelize pluralize the table name because it does it wrong
    {
    freezeTableName: true
  });

  Buzz.associate = function (models) {
    // Associate a Post to a User as a foreign key
    Buzz.belongsTo(models.User, {
      foreignKey: {
        allowNull: false
    }
  });
  };

  return Buzz;
};
