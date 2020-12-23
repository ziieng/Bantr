//initialization of emoji selector
tinymce.init({
  width: "475",
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
      //on this page we're not replying to anything
      reply: null
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