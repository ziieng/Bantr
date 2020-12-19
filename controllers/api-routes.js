// Requiring our models and passport as we've configured it
const db = require("../models");
const passport = require("../config/passport");
const gravatar = require("gravatar")
const { Op } = require("sequelize");

// Requiring our custom middleware for checking if a user is logged in
var isAuthenticated = require("../config/middleware/isAuthenticated");
const user = require("../models/user");

let stuff = async function (app) {
  // Using the passport.authenticate middleware with our local strategy.
  // If the user has valid login credentials, send them to the members page.
  // Otherwise the user will be sent an error
  app.post("/api/login", passport.authenticate("local"), function (req, res) {
    res.json(req.user);
  });

  // Route for signing up a user. The user's password is automatically hashed and stored securely thanks to
  // how we configured our Sequelize User Model. If the user is created successfully, proceed to log the user in,
  // otherwise send back an error
  app.post("/api/signup", function (req, res) {
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
  app.get("/logout", function (req, res) {
    req.logout();
    res.redirect("/");
  });


  // Route for getting some data about our user to be used client side
  app.get("/api/user_data", function (req, res) {
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

  // A redirect bc zii keeps typing the wrong address
  app.get("/dash", function (req, res) {
    res.status(307).redirect("/dashboard")
  });

  // Here we've add our isAuthenticated middleware to this route.
  // If a user who is not logged in tries to access this route they will be redirected to the signup page
  app.get("/dashboard", isAuthenticated, async function (req, res) {
    let { budList, budDetails } = await budLister({ from: req.user.id })
    let posts = await postLister(budList)
    res.render("dashboard", { buds: budDetails, buzz: posts });
  });

  //route to create a new Buzz: requires body for text and reply_to id for any Buzz it's in reply to, server provides UserId for who is making the post
  app.post("/api/buzz/", function (req, res) {
    users.create(["body", "reply_to", "userId"], [req.body.body, req.body.reply,
    req.user.id], function (result) {
      // Send back the ID of the new buzz, for fun
      res.json({ id: result.insertId });
    });
  });

  //route to make Gravatar image links for the signup page
  app.post("/api/grav/", function (req, res) {
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

async function postLister(whereId) {
  let posts = await db.Buzz.findAll({
    include: {
      model: db.User,
      required: true,
      attributes: ["username", "avatar"]
    },
    where: { UserId: whereId }
  })
  console.log(posts[0])
  let postData = []
  for (line of posts) {
    postData.push({
      body: line.dataValues.body,
      reply: line.dataValues.reply_to,
      buzzId: line.dataValues.id,
      created: line.dataValues.createdAt,
      username: line.User.dataValues.username,
      avatar: line.User.dataValues.avatar
    })
  }
  return postData
}

async function budLister(ref) {
  let buds = []
  let budList = []
  let budDetails = []
  if (ref.from) {
    //query for "followed by X"
    buds = await db.Buds.findAll({
      include: { model: db.User, as: "addressee", required: true, attributes: ["username", "avatar"] },
      where: { UserId: ref.from }
    })
    for (line of buds) {
      budList.push(line.addresseeId)
      budDetails.push(line.addressee.dataValues)
    }
  } else if (ref.to) {
    //query for "all following X"
    buds = await db.Buds.findAll({
      attributes: ["UserId"],
      where: { addresseeId: ref.to }
    })
    console.log(buds)
    for (line of buds) {
      budList.push(line.UserId)
    }
    buds = await db.User.findAll({
      attributes: ["username", "avatar"],
      where: { id: budList },
    })
    for (line of buds) {
      budDetails.push(line.dataValues)
    }
  }
  // if (buds = "[]") {
  //   console.log("empty")
  // }
  return { budList: budList, budDetails: budDetails }
}

module.exports = stuff