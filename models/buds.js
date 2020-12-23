// Creating our Buds model for follower function
module.exports = function (sequelize, DataTypes) {
  var Buds = sequelize.define("Buds", {
    //to get this to work, Sequelize actually makes all the columns through associations
  });

  Buds.associate = function (models) {
    // Associating User with their follow requests
    // When a User is deleted, also delete their relationships
    Buds.belongsTo(models.User, {
      as: "addressee",
      onDelete: "cascade"
    });
  };

  return Buds;
};
