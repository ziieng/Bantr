// Requiring path to so we can use relative routes to our HTML files
var path = require("path");
const db = require("../models");

// Requiring our custom middleware for checking if a user is logged in
var isAuthenticated = require("../config/middleware/isAuthenticated");

module.exports = function(app) {
  //route for login page
  app.get("/login", function (req, res) {
    // If the user is already signed in, send them to the dashboard
    if (req.user) {
      res.redirect("/dashboard");
    }
    res.sendFile(path.join(__dirname, "../public/login.html"));
  });
  //catch-all route for any bad URLs
  app.get("*", function (req, res) {
    // If the user is already signed in, send them to the dashboard
    if (req.user) {
      res.redirect("/dashboard");
    }
    res.sendFile(path.join(__dirname, "../public/login.html"));
  });

};
