tinymce.init({
  selector: "textarea#postBody",
  plugins: "emoticons lists",
  toolbar: "emoticons | bold italic strikethrough | numlist bullist advlist | removeformat",
  toolbar_location: "bottom",
  menubar: false
})

$("#newBuzz").on("click", function (event) {
    event.preventDefault();
    var newPost = {
      body: tinymce.activeEditor.getContent(),
      reply: null
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