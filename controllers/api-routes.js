// Requiring our models and passport as we've configured it
const db = require("../models");
const passport = require("../config/passport");
const gravatar = require("gravatar")

// Requiring our custom middleware for checking if a user is logged in
var isAuthenticated = require("../config/middleware/isAuthenticated");

module.exports = async function (app) {
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
  app.get("/users/:username", isAuthenticated, async function (req, res) {
    let username = req.params.username
    let userDetail = await userDetails({ username: username })
    if (userDetail.id == req.user.id) {
      userDetail.self = true
    } else {
      userDetail.self = false
    }
    let { budList, budDetails } = await budLister({ from: userDetail.id })
    let posts = await postLister(userDetail.id)
    res.render("userprofile", { user: userDetail, buzz: posts, buds: budDetails })
  });

  // A redirect bc zii keeps typing the wrong address
  app.get("/dash", function (req, res) {
    res.status(307).redirect("/dashboard")
  });

  // Here we've add our isAuthenticated middleware to this route.
  // If a user who is not logged in tries to access this route they will be redirected to the signup page
  app.get("/dashboard", isAuthenticated, async function (req, res) {
    console.log(req.user)
    let { budList, budDetails } = await budLister({ from: req.user.id })
    budList.push(req.user.id)
    let userDetail = await userDetails({ id: req.user.id })
    let posts = await postLister(budList)
    res.render("dashboard", { user: userDetail, buds: budDetails, buzz: posts });
  });

  //route to create a new Buzz: requires body for text and reply_to id for any Buzz it's in reply to, server provides UserId for who is making the post
  app.post("/api/followReq/", function (req, res) {
    db.Buds.create(["addresseeId", "UserId"], [req.body.addId, req.user.id])
      .then(function (result) {
        res.json({ id: result.insertId });
      })
      .catch(function (err) {
        res.status(401).json(err);
      });
  });

  //route to create a new Buzz: requires body for text and reply_to id for any Buzz it's in reply to, server provides UserId for who is making the post
  app.post("/api/buzz/", function (req, res) {
    db.Buzz.create(["body", "reply_to", "userId"], [req.body.body, req.body.reply,
      req.body.id])
      .then(function (result) {
        // Send back the ID of the new buzz, for fun
        res.json({ id: result.insertId });
      })
      .catch(function (err) {
        res.json(err);
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

async function userDetails(search) {
  let user = await db.User.findOne({
    where: search,
    attributes: { exclude: ["password"] }
  })
  let userDetail = user.dataValues
  return userDetail
}

async function postLister(whereId) {
  let posts = await db.Buzz.findAll({
    include: {
      model: db.User,
      required: true,
      attributes: ["username", "avatar"]
    },
    where: { UserId: whereId },
    order: [["createdAt", "DESC"]]
  })
  let postData = []
  for (line of posts) {
    let data = line.dataValues
    let user = line.User.dataValues
    postData.push({
      body: data.body,
      reply: data.reply_to,
      buzzId: data.id,
      created: data.createdAt,
      username: user.username,
      avatar: user.avatar
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
    console.log(buds)
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
  //   budList = "None"
  //   budDetails = "None"
  // }
  return { budList: budList, budDetails: budDetails }
}
