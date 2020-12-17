// Requiring our models and passport as we've configured it
var db = require("../models");
var passport = require("../config/passport");
var express = require("express");
const gravatar = require("gravatar")

module.exports = function (router) {
  // Using the passport.authenticate middleware with our local strategy.
  // If the user has valid login credentials, send them to the members page.
  // Otherwise the user will be sent an error
  router.post("/api/login", passport.authenticate("local"), function (req, res) {
    res.json(req.user);
  });

  // Route for signing up a user. The user's password is automatically hashed and stored securely thanks to
  // how we configured our Sequelize User Model. If the user is created successfully, proceed to log the user in,
  // otherwise send back an error
  router.post("/api/signup", function (req, res) {
    db.User.create({
      email: req.body.email,
      username: req.body.username,
      password: req.body.password,
      avatar: req.body.avatar
    })
      .then(function () {
        res.redirect(307, "/api/login");
      })
      .catch(function (err) {
        res.status(401).json(err);
      });
  });

  // Route for logging user out
  router.get("/logout", function (req, res) {
    req.logout();
    res.redirect("/");
  });


  // Route for getting some data about our user to be used client side
  router.get("/api/user_data", function (req, res) {
    if (!req.user) {
      // The user is not logged in, send back an empty object
      res.json({});
    } else {
      // Otherwise send back the user's email and id
      // Sending back a password, even a hashed password, isn't a good idea
      res.json({
        email: req.user.email,
        id: req.user.id
      });
    }
  });

  //route to create a new Buzz: requires body for text and reply_to id for any Buzz it's in reply to, server provides UserId for who is making the post
  router.post("/api/buzz/", function (req, res) {
    users.create(["body", "reply_to", "userId"], [req.body.body, req.body.reply,
    req.user.id], function (result) {
      // Send back the ID of the new buzz
      res.json({ id: result.insertId });
    });
  });

  //route to make Gravatar image links for the signup page
  router.post("/api/grav/", function (req, res) {
    let email = req.body.email;
    let list = {
      av1: gravatar.url(email, { protocol: 'https', d: "mp" }),
      av2: gravatar.url(email, { protocol: 'https', d: "identicon", f: "y" }),
      av3: gravatar.url(email, { protocol: 'https', d: "wavatar", f: "y" }),
      av4: gravatar.url(email, { protocol: 'https', d: "retro", f: "y" }),
      av5: gravatar.url(email, { protocol: 'https', d: "robohash", f: "y" })
    };
    res.json(list)
  });

}