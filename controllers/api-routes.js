// Requiring models and passport as configured
const db = require("../models");
const passport = require("../config/passport");

// Requiring custom middleware for checking if a user is logged in
var isAuthenticated = require("../config/middleware/isAuthenticated");

// Requiring package to create Gravatar URLs from email addresses
const gravatar = require("gravatar")

module.exports = async function (app) {
  // Using the passport.authenticate middleware with our local strategy.
  // If the user has valid login credentials, respond with their information.
  // Otherwise the user will be sent an error. (handling for error done by passport)
  app.post("/api/login", passport.authenticate("local"), function (req, res) {
    res.json(req.user);
  });

  // Route for signing up a user. The user's password is automatically hashed and stored securely by the Sequelize User Model. If the user is created successfully, proceed to log the user in,
  // otherwise send back an error
  app.post("/api/signup", async function (req, res) {
    db.User.create({
      email: req.body.email,
      username: req.body.username,
      password: req.body.password,
      avatar: req.body.avatar
    })
      .then(function (result) {
        // automatically add test accounts to new users' bud list
        newUser = result.dataValues.id
        db.Buds.bulkCreate([{ "addresseeId": 21, "UserId": newUser }, { "addresseeId": newUser, "UserId": 21 }, { "addresseeId": 81, "UserId": newUser }, { "addresseeId": newUser, "UserId": 81 }])
        // send browser to login process
        res.redirect(307, "/api/login");
      })
      .catch(function (err) {
        console.log(err.parent)
        //if something went wrong, tell the browser
        res.status(401).json(err.parent.sqlMessage);
      });
  });

  // Route for logging user out
  app.get("/logout", function (req, res) {
    req.logout();
    res.redirect("/");
  });


  // Route for the user profile pages - user must be logged in for it to work
  app.get("/users/:username", isAuthenticated, async function (req, res) {
    //take username from URL
    let username = req.params.username
    //call user lookup function
    let userDetail = await userDetails({ username: username })
    //check if the logged in user is the profile's owner and set flag for handlebars
    if (userDetail.id == req.user.id) {
      userDetail.self = true
    } else {
      userDetail.self = false
      //if the profile doesn't belong to logged in user, check if they're already buds and set flag for handlebars
      let { budList, budDetails } = await budLister({ from: req.user.id })
      if (budList.includes(userDetail.id)) {
        userDetail.buds = true
      } else {
        userDetail.buds = false
      }
    }
    //get the detailed bud list for the user profile
    let { budList, budDetails } = await budLister({ from: userDetail.id })
    //get all posts made by the specific user
    let posts = await postLister({ UserId: userDetail.id })
    //send it all to Handlebars
    res.render("userprofile", { user: userDetail, buzz: posts, buds: budDetails })
  });

  // Route for the budlist page, showing followed buds and followers for a given account - user must be logged in for it to work
  app.get("/buds/:username", isAuthenticated, async function (req, res) {
    //take username from URL
    let username = req.params.username
    //call user lookup function
    let userDetail = await userDetails({ username: username })
    //check if the logged in user is the profile's owner and set flag for handlebars
    if (userDetail.id == req.user.id) {
      userDetail.self = true
    } else {
      userDetail.self = false
    }
    //get list of buds followed by this account
    let from = await budLister({ from: userDetail.id })
    let fromDetails = from.budDetails
    //get list of buds following this account
    let to = await budLister({ to: userDetail.id })
    let toDetails = to.budDetails
    //send everything to Handlebars
    res.render("buds", { user: userDetail, following: fromDetails, followers: toDetails })
  });

  //route for making/seeing replies to a particular buzz - user must be logged in for it to work
  app.get("/buzz/:id-:ref", isAuthenticated, async function (req, res) {
    //the first ID is the buzz to look up, the second is the one we clicked to get here (if applicable)
    let buzzId = req.params.id
    let sourceRef = req.params.ref
    let refIndex = ""
    //get the details of the specific buzz
    let buzzMain = await postLister({ id: buzzId })
    //get all existing replies to it
    let postList = await postLister({ reply_to: buzzId })
    //remove the "reply_to" tags so Handlebars isn't rendering the same link on every one
    for (i = 0; i < postList.length; i++) {
      let line = postList[i]
      console.log(line)
      line.reply = ""
      //make a note which one is the referring post from the URL params
      if (sourceRef == line.buzzId) {
        refIndex = i
      }
    }
    //if there was a referred post, move it to the top so it's the first one users see
    if (refIndex) {
      postList.splice(0, 0, postList.splice(refIndex, 1)[0])
    }
    //send data to Handlebars
    res.render("buzz", { focusBuzz: buzzMain[0], buzz: postList })
  })

  //Route to the main dashboard - user must be logged in for it to work
  app.get("/dashboard", isAuthenticated, async function (req, res) {
    //get the list of everyone user follows, deconstructed into a list of user IDs and the array of detailed profiles
    let { budList, budDetails } = await budLister({ from: req.user.id })
    budList.push(req.user.id)
    //get details for the logged in user
    let userDetail = await userDetails({ id: req.user.id })
    //get posts made by anyone in the list of followed user IDs
    let posts = await postLister({ UserId: budList })
    //send data to Handlebars
    res.render("dashboard", { user: userDetail, buds: budDetails, buzz: posts });
  });

  //route to add a new follow relationship; requires user ID for the addressee
  app.post("/api/followReq/", function (req, res) {
    db.Buds.create({ "addresseeId": req.body.addId, "UserId": req.user.id })
      .then(function (result) {
        res.status(200).end();
      })
      .catch(function (err) {
        res.status(401).json(err);
      });
  });

  //route to remove a follow relationship; requires user ID for the addressee to be removed
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
    //if there's a reply, the object to add is constructed differently
    if (req.body.reply) {
      newBuzz = { "body": req.body.body, "reply_to": req.body.reply, "UserId": req.user.id }
    } else {
      newBuzz = { "body": req.body.body, "UserId": req.user.id }
    }
    //send add request to database model
    db.Buzz.create(newBuzz)
      .then(function (result) {
        //report success
        res.status(200).end();
      })
      .catch(function (err) {
        //report error
        res.json(err);
      });
  });

  //route to make Gravatar image links for the signup page
  app.post("/api/grav/", function (req, res) {
    let email = req.body.email;
    //list builds 5 links to gravatar images, one that uses the email's image and four that force a different default generic image
    let list = {
      av1: gravatar.url(email, { protocol: 'https', d: "mp" }),
      av2: gravatar.url(email, { protocol: 'https', d: "identicon", f: "y" }),
      av3: gravatar.url(email, { protocol: 'https', d: "wavatar", f: "y" }),
      av4: gravatar.url(email, { protocol: 'https', d: "retro", f: "y" }),
      av5: gravatar.url(email, { protocol: 'https', d: "robohash", f: "y" })
    };
    //send list back to front-end
    res.json(list)
  });

}

//function for user detail lookup, without the (encrypted, but still) password
async function userDetails(search) {
  let user = await db.User.findOne({
    where: search,
    attributes: { exclude: ["password"] }
  })
  let userDetail = user.dataValues
  return userDetail
}

//function for looking up posts, uses the input variable for sequelize's where clause to be more flexible
async function postLister(whereVar) {
  let posts = await db.Buzz.findAll({
    //join with User table to get the username and avatar for post author
    include: {
      model: db.User,
      required: true,
      attributes: ["username", "avatar"]
    },
    where: whereVar,
    //sort by post date
    order: [["createdAt", "DESC"]]
  })
  //repackage post data for Handlebars to have an easier time
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

//function for looking up the follows/followers for a user
async function budLister(ref) {
  let buds = []
  let budList = []
  let budDetails = []
  if (ref.from) {
    //query for "followed by X"
    buds = await db.Buds.findAll({
      //join to include Users table, but only the username and icon
      include: { model: db.User, as: "addressee", required: true, attributes: ["username", "avatar"] },
      where: { UserId: ref.from }
    })
    //split IDs into one list and user information into another
    for (line of buds) {
      budList.push(line.addresseeId)
      budDetails.push(line.addressee.dataValues)
    }
  } else if (ref.to) {
    //query for "all following X"
    //the join for this wasn't working well, so it takes a different strategy
    buds = await db.Buds.findAll({
      //pull only the user ID for everyone user is following
      attributes: ["UserId"],
      where: { addresseeId: ref.to }
    })
    //repackage IDs into a clean array
    for (line of buds) {
      budList.push(line.UserId)
    }
    //query for usernames and icons of everyone in the array above
    buds = await db.User.findAll({
      attributes: ["username", "avatar"],
      where: { id: budList },
    })
    //repackage information to make Handlebars use easier
    for (line of buds) {
      budDetails.push(line.dataValues)
    }
  }
  return { budList: budList, budDetails: budDetails }
}
