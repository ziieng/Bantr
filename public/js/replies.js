//initialization of emoji selector
tinymce.init({
  width: "500",
  selector: "textarea#postBody",
  plugins: "emoticons",
  toolbar: "emoticons",
  toolbar_location: "bottom",
  menubar: false
})

//click event for new post button
$("#newBuzz").on("click", function (event) {
  event.preventDefault();
  var newPost = {
    //get post text from the WYSIWYG editor
    body: tinymce.activeEditor.getContent({ format: "text" }),
    //get reply_to ID from the button
    reply: $(this).attr("data-id")
  };

  // Send the POST request.
  $.ajax("/api/buzz/", {
    type: "POST",
    dataType: "JSON",
    data: newPost
  })
    .then(
      //refresh page once it's done
      location.reload())
    .catch((err) => console.log(err));
});