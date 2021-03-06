$(document).ready(function () {
  //set up popover for Gravatar reference
  $(function () {
    $('[data-toggle="popover"]').popover()
  })
  // Getting references to our form and inputs
  let signUpForm = $("form.signup");
  let emailInput = $("#email-input");
  let passwordInput = $("#password-input");
  let userInput = $("#username-input");
  
  //populate avatar choices with user's email when email field changes
  $("#email-input").change(function () {
    let email = $("#email-input").val().trim();
    $.post("api/grav/", { "email": email }, (reply) => {
      $("#grav1").attr("src", reply.av1 + "&s=100");
      $("#grav2").attr("src", reply.av2 + "&s=100");
      $("#grav3").attr("src", reply.av3 + "&s=100");
      $("#grav4").attr("src", reply.av4 + "&s=100");
      $("#grav5").attr("src", reply.av5 + "&s=100");
    })
  });

  //click event for selecting an avatar
  $(".avChoice").on("click", function (event) {
    $(".avActive").removeClass("avActive");
    $(this).addClass("avActive")
  })

  // When the signup button is clicked, we validate the email, username, and password are not blank
  signUpForm.on("submit", function (event) {
    event.preventDefault();
    let selIcon = $(".avActive").attr("src")
    var userData = {
      username: userInput.val().trim(),
      email: emailInput.val().trim(),
      password: passwordInput.val().trim(),
      avatar: selIcon.slice(0, -6),
    };
    if (!userData.username || !userData.email || !userData.password) {
      return;
    }
    // If we have all the data, run the signUpUser function
    signUpUser(userData);
    userInput.val("");
    emailInput.val("");
    passwordInput.val("");
    avatarInput.val("");
  });
  // Does a post to the signup route. If successful, we are redirected to the members page
  // Otherwise we log any errors
  function signUpUser(userData) {
    $.post("/api/signup", userData)
      .then(function (data) {
        //on success, continue to dashboard
        window.location.replace("/dashboard");
      })
      // If there's an error, handle it by throwing up a bootstrap alert
      .catch(handleLoginErr);
  }
  //populattes alert with error
  function handleLoginErr(err) {
    $("#alert .msg").text(err.responseJSON);
    $("#alert").fadeIn(500);
  }
});
