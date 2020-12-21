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
      body: tinymce.activeEditor.getContent({ format: "text" }),
      reply: null
    };

    // Send the POST request.
  $.ajax("/api/buzz/", {
      type: "POST",
    dataType: "JSON",
    data: newPost
  })
    .then(
      location.reload())
    .catch((err) => console.log(err));
  });