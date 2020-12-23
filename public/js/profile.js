//click event for add/remove Bud button
$("#change-buds").on("click", function (event) {
  let action = $("#change-buds").attr("data-action")
  //if it's set to "add", send add request
  if (action == "add") {
    var newFollowReq = {
      //take user ID from button
      addId: $(this).attr("data-id")
      };
  $.ajax("/api/followReq/", {
      method: "POST",
      data: newFollowReq
    }).then(
      function() {
        //switch state of button to "remove"
        $("#change-buds").attr("data-action", "remove")
        $("#change-buds").html("already buds!")
      })
      .catch((err) => console.log(err));;
  } else {
    //if it's not set to "add", send remove request
  var removeFollowReq = {
    //take user ID from button
    remId: $(this).attr("data-id")
  };
  $.ajax("/api/removeReq/", {
    method: "POST",
    data: removeFollowReq
  }).then(
    function () {
      //switch state of button to "add"
      $("#change-buds").attr("data-action", "add")
      $("#change-buds").html("<b>+</b> bud")
    })
    .catch((err) => console.log(err));
  }
});