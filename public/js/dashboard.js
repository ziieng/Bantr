tinymce.init({
  selector: "textarea#postBody",
  plugins: "emoticons",
  toolbar: "emoticons",
  toolbar_location: "bottom",
  menubar: false
})

$("#newBuzz").on("click", function (event) {
    event.preventDefault();
    var newPost = {
      body: tinymce.activeEditor.getContent(),
      reply: null,
      id: userId
    };

    // Send the POST request.
  $.ajax("/api/buzz/", {
      type: "POST",
    dataType: "JSON",
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