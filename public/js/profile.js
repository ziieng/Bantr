$("#follow-buds").on("click", function(event) {
    var newFollowReq = {
        id: $(this).attr("data-id")
      };
    $.ajax("/api/followReq", {
      method: "POST",
      data: newFollowReq
    }).then(
      function() {
        location.reload();
      }
    );
  });