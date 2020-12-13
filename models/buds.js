// Creating our Buds model for follower function
module.exports = function (sequelize, DataTypes) {
  var Buds = sequelize.define("Buds", {
    // The email cannot be null, and must be a proper email before creation
    requester_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    addressee_id: {
      type: DataTypes.STRING,
      allowNull: false,
    }
  });

  return Buds;
};
