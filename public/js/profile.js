$("#change-buds").on("click", function (event) {

  if (action == "add") {
    var newFollowReq = {
      addId: $(this).attr("data-id")
      };
  $.ajax("/api/followReq/", {
      method: "POST",
      data: newFollowReq
    }).then(
      function() {
        $("#change-buds").attr("data-action", "remove")
        $("#change-buds").html("already buds!")
      })
      .catch((err) => console.log(err));;
  } else {
  var removeFollowReq = {
    remId: $(this).attr("data-id")
  };
  $.ajax("/api/removeReq/", {
    method: "POST",
    data: removeFollowReq
  }).then(
    function () {
      $("#change-buds").attr("data-action", "add")
      $("#change-buds").html("<b>+</b> bud")
    })
    .catch((err) => console.log(err));
  }
});