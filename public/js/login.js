//this doc was provided by starter code, only addition is the demoLogin function.

$(document).ready(function() {
  // Getting references to our form and inputs
  var loginForm = $("form.login");
  var emailInput = $("#email-input");
  var passwordInput = $("#password-input");
  var demoLogin = $("#demoLink")

  // When the form is submitted, we validate there's an email and password entered
  loginForm.on("submit", function(event) {
    event.preventDefault();
    var userData = {
      email: emailInput.val().trim(),
      password: passwordInput.val().trim()
    };

    if (!userData.email || !userData.password) {
      return;
    }

    // If we have an email and password we run the loginUser function and clear the form
    loginUser(userData.email, userData.password);
    emailInput.val("");
    passwordInput.val("");
  });

  // created a "panopticon" account to view all the seed data posts without logging in
  demoLogin.on("click", function () {
    loginUser("view@all.com", "demo");
  })

  // loginUser does a post to our "api/login" route and if successful, redirects us the the members page
  function loginUser(email, password) {
    $.post("/api/login", {
      email: email,
      password: password
    })
      .then(function() {
        window.location.replace("/dashboard");
        // If there's an error, log the error
      })
      .catch(function(err) {
        console.log(err);
      });
  }

});
