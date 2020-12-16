$(document).ready(function () {
  // Getting references to our form and input
  let signUpForm = $("form.signup");
  let emailInput = $("#email-input");
  let passwordInput = $("#password-input");
  let userInput = $("#username-input");
  let gravatar = require("gravatar");
  
  // $("#email-input").on("click", function () {
  //   let email = $("#email-input").val().trim();
  //   avatar1element.src = gravatar.url(email, { protocol: 'https', d: "mp"})
  //   avatar2element.src = gravatar.url(email, { protocol: 'https', d: "identicon", f: "y" })
  //   avatar3element.src = gravatar.url(email, { protocol: 'https', d: "wavatar", f: "y" })
  //   avatar4element.src = gravatar.url(email, { protocol: 'https', d: "retro", f: "y" })
  //   avatar5element.src = gravatar.url(email, { protocol: 'https', d: "robohash", f: "y" })

  //   $("#grav1").attr("src", avatar1element.src);
  //   $("#grav2").attr("src", avatar2element.src);
  //   $("#grav3").attr("src", avatar3element.src);
  //   $("#grav4").attr("src", avatar4element.src);
  //   $("#grav5").attr("src", avatar5element.src);
   
  // });

  // When the signup button is clicked, we validate the email and password are not blank
  signUpForm.on("submit", function (event) {
    event.preventDefault();
    var userData = {
      username: userInput.val().trim(),
      email: emailInput.val().trim(),
      password: passwordInput.val().trim(),
      avatar: gravatar.url(user.email, { protocol: "https", d: avatarInput }),
    };
    if (!userData.username || !userData.email || !userData.password) {
      return;
    }
    // If we have an email and password, run the signUpUser function
    signUpUser(userData);
    userInput.val("");
    emailInput.val("");
    passwordInput.val("");
    avatarInput.val("");
  });
  // Does a post to the signup route. If successful, we are redirected to the members page
  // Otherwise we log any errors
  function signUpUser(email, password) {
    $.post("/api/signup", userData)
      .then(function (data) {
        window.location.replace("/dashboard.js");
        // If there's an error, handle it by throwing up a bootstrap alert
      })
      .catch(handleLoginErr);
  }

  function handleLoginErr(err) {
    $("#alert .msg").text(err.responseJSON);
    $("#alert").fadeIn(500);
  }
});
