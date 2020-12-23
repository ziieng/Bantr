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
  app.post("/api/signup", async function (req, res) {
    db.User.create({
      email: req.body.email,
      username: req.body.username,
      password: req.body.password,
      avatar: req.body.avatar
    })
      .then(function (result) {
        console.log(result)
        newUser = result.dataValues.id
        db.Buds.bulkCreate([{ "addresseeId": 21, "UserId": newUser }, { "addresseeId": newUser, "UserId": 21 }, { "addresseeId": 81, "UserId": newUser }, { "addresseeId": newUser, "UserId": 81 }])
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
      let { budList, budDetails } = await budLister({ from: req.user.id })
      if (budList.includes(userDetail.id)) {
        userDetail.buds = true
      } else {
        userDetail.buds = false
      }
    }
    let { budList, budDetails } = await budLister({ from: userDetail.id })
    let posts = await postLister({ UserId: userDetail.id })
    res.render("userprofile", { user: userDetail, buzz: posts, buds: budDetails })
  });

  // Route for getting some data about our user to be used client side
  app.get("/buds/:username", isAuthenticated, async function (req, res) {
    let username = req.params.username
    let userDetail = await userDetails({ username: username })
    if (userDetail.id == req.user.id) {
      userDetail.self = true
    } else {
      userDetail.self = false
    }
    let from = await budLister({ from: userDetail.id })
    let fromDetails = from.budDetails
    let to = await budLister({ to: userDetail.id })
    let toDetails = to.budDetails
    res.render("buds", { user: userDetail, following: fromDetails, followers: toDetails })
  });

  app.get("/buzz/:id-:ref", isAuthenticated, async function (req, res) {
    let buzzId = req.params.id
    let sourceRef = req.params.ref
    let refIndex = ""
    let postList = await postLister({ reply_to: buzzId })
    let buzzMain = await postLister({ id: buzzId })
    for (i = 0; i < postList.length; i++) {
      let line = postList[i]
      console.log(line)
      line.reply = ""
      if (sourceRef == line.buzzId) {
        refIndex = i
      }
    }
    if (refIndex) {
      postList.splice(0, 0, postList.splice(refIndex, 1)[0])
    }
    res.render("buzz", { focusBuzz: buzzMain[0], buzz: postList })
  })

  // A redirect bc zii keeps typing the wrong address
  app.get("/dash", function (req, res) {
    res.status(307).redirect("/dashboard")
  });

  // Here we've add our isAuthenticated middleware to this route.
  // If a user who is not logged in tries to access this route they will be redirected to the signup page
  app.get("/dashboard", isAuthenticated, async function (req, res) {
    let { budList, budDetails } = await budLister({ from: req.user.id })
    budList.push(req.user.id)
    let userDetail = await userDetails({ id: req.user.id })
    let posts = await postLister({ UserId: budList })
    res.render("dashboard", { user: userDetail, buds: budDetails, buzz: posts });
  });

  //route to create a new Buzz: requires body for text and reply_to id for any Buzz it's in reply to, server provides UserId for who is making the post
  app.post("/api/followReq/", function (req, res) {
    db.Buds.create({ "addresseeId": req.body.addId, "UserId": req.user.id })
      .then(function (result) {
        res.status(200).end();
      })
      .catch(function (err) {
        res.status(401).json(err);
      });
  });

  //route to create a new Buzz: requires body for text and reply_to id for any Buzz it's in reply to, server provides UserId for who is making the post
  app.post("/api/removeReq/", function (req, res) {
    db.Buds.destroy({ where: { "addresseeId": req.body.remId, "UserId": req.user.id } })
      .then(function (result) {
        res.status(200).end();
      })
      .catch(function (err) {
        res.status(401).json(err);
      });
  });

  //route to create a new Buzz: requires body for text and reply_to id for any Buzz it's in reply to, server provides UserId for who is making the post
  app.post("/api/buzz/", function (req, res) {
    let newBuzz = {}
    if (req.body.reply) {
      newBuzz = { "body": req.body.body, "reply_to": req.body.reply, "UserId": req.user.id }
    } else {
      newBuzz = { "body": req.body.body, "UserId": req.user.id }
    }
    db.Buzz.create(newBuzz)
      .then(function (result) {
        // Send back the ID of the new buzz, for fun
        res.status(200).end();
      })
      .catch(function (err) {
        console.log(err);
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

async function postLister(whereVar) {
  let posts = await db.Buzz.findAll({
    include: {
      model: db.User,
      required: true,
      attributes: ["username", "avatar"]
    },
    where: whereVar,
    order: [["createdAt", "DESC"]]
  })
  let postData = []
  for (line of posts) {
    let data = line.dataValues
    let user = line.User.dataValues
    //format date with local time
    let time = new Date(data.createdAt)
    data.createdAt = time.toLocaleString()
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
