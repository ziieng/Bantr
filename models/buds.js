// Creating our Buds model for follower function
module.exports = function (sequelize, DataTypes) {
  var Buds = sequelize.define("Buds", {
  });

  Buds.associate = function (models) {
    // Associating Author with Posts
    // When an Author is deleted, also delete any associated Posts
    Buds.belongsTo(models.User, {
      as: "addressee",
      onDelete: "cascade"
    });
  };

  return Buds;
};
