$("#follow-buds").on("click", function(event) {
    var newFollowReq = {
      addId: $(this).attr("data-id")
      };
  $.ajax("/api/followReq/", {
      method: "POST",
      data: newFollowReq
    }).then(
      function() {
        location.reload();
      }
    );
  });

$("#remove-buds").on("click", function (event) {
  var removeFollowReq = {
    remId: $(this).attr("data-id")
  };
  $.ajax("/api/removeReq/", {
    method: "POST",
    data: removeFollowReq
  }).then(
    function () {
      location.reload();
    }
  );
});