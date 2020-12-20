$("#newBuzz").on("click", function (event) {
    event.preventDefault();
    var newPost = {
      body: $.trim($("textarea#postBody").html()),
      reply: 0
    };

    // Send the POST request.
  $.ajax("/api/buzz/", {
      type: "POST",
    dataType: "JSONP",
    data: newPost
    }).then(
      function (response, err) {
        if (err) {
          console.log(err)
        } else {
        location.reload();
        }
      }
    );
  });