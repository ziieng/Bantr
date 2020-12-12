
// Creating our User model
module.exports = function (sequelize, DataTypes) {
  var Buzz = sequelize.define("Buzz", {
    author_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        // This is a reference to another model
        model: User,
        // This is the column name of the referenced model
        key: 'id',
      }
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
      references: {
        // This is a reference to another model
        model: Buzz,
        // This is the column name of the referenced model
        key: 'id',
      }
    }
  });
  return Buzz;
};
