// Creating our User model
module.exports = function (sequelize, DataTypes) {
  var Buds = sequelize.define("Buds", {
    // The email cannot be null, and must be a proper email before creation
    requester_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        // This is a reference to another model
        model: User,
        // This is the column name of the referenced model
        key: 'id',
      }
    },
    addressee_id: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        // This is a reference to another model
        model: User,
        // This is the column name of the referenced model
        key: 'id',
      }
    }
  });
  return Buds;
};
