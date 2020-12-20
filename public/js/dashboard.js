$("#button-addon2").on("submit", function(event) {
    event.preventDefault();
    var newPost = {
      post: $("#post-on-wall").val().trim()
    };

    // Send the POST request.
    $.ajax("/api/post", {
      type: "POST",
      data: newPost
    }).then(
      function() {
        console.log("created new plan");
        location.reload();
      }
    );
  });