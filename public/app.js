// Grab the articles as a json
//$.getJSON("/articles", function(data) {
//  console.log("Succsess");
//});

$.getJSON("/saved", function(data) {
  console.log("Saved Articles");
});

$(document).on("click", ".save", function() {
  var thisId = $(this).attr("attrId");
  $.ajax({
    method: "PUT",
    url: "/save/" + thisId
  })
    // With that done, add the note information to the page
    .then(function(data) {
      console.log(data);
    });
    location.reload();
});

$(document).on("click", ".delete", function() {
  var thisId = $(this).attr("attrId");
  $.ajax({
    method: "DELETE",
    url: "/delete/" + thisId
  })
    // With that done, add the note information to the page
    .then(function(data) {
      console.log(data);
    });
    location.reload();
});

//opens Modal to save Notes for 'articleNo'
$(document).on("click", ".comment", function() {
var articleNo = $(this).attr("attrId")
  $("#articleNo").text("Notes for article: " + articleNo);
  
  $("#saveNote").attr("articleNo", articleNo);
  $('#notesModal').show();

});

//on Click of Save Note button
$(document).on("submit", "#saveNote", function(event) {
  event.preventDefault();
  
  var thisId = $(this).attr("articleNo");
  console.log(thisId);
  var notes={
    // Value taken from note textarea
    note:$("#note").val.trim(),
  };
  
  $.ajax({
    method: "POST",
    url: "/savenote/" + thisId,
    data:notes
  })
    // With that done, add the note information to the page
    .then(function(data) {
      console.log(data);
    });
    location.reload();
});

$(document).on("click", "#scrape", function() {
  
  $.ajax({
    method: "GET",
    url: "/scrape"
  })
    // With that done, add the note information to the page
    .then(function(err) {
      console.log(err);
    });

});

$(document).on("click", "#scrapeClear", function() {
  
  $.ajax({
    method: "GET",
    url: "/clearScrape"
  })
    // With that done, add the note information to the page
    .then(function(err) {
      console.log(err);
    });

});

// Whenever someone clicks a p tag
$(document).on("click", "p", function() {
  // Empty the notes from the note section
  $("#notes").empty();
  // Save the id from the p tag
  var thisId = $(this).attr("data-id");

  // Now make an ajax call for the Article
  $.ajax({
    method: "GET",
    url: "/articles/" + thisId
  })
    // With that done, add the note information to the page
    .then(function(data) {
      console.log(data);
      // The title of the article
      $("#notes").append("<h2>" + data.title + "</h2>");
      // An input to enter a new title
      $("#notes").append("<input id='titleinput' name='title' >");
      // A textarea to add a new note body
      $("#notes").append("<textarea id='bodyinput' name='body'></textarea>");
      // A button to submit a new note, with the id of the article saved to it
      $("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");

      // If there's a note in the article
      if (data.note) {
        // Place the title of the note in the title input
        $("#titleinput").val(data.note.title);
        // Place the body of the note in the body textarea
        $("#bodyinput").val(data.note.body);
      }
    });
});

// When you click the savenote button
$(document).on("click", "#savenote", function() {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {
      // Value taken from title input
      title: $("#titleinput").val(),
      // Value taken from note textarea
      body: $("#bodyinput").val()
    }
  })
    // With that done
    .then(function(data) {
      // Log the response
      console.log(data);
      // Empty the notes section
      $("#notes").empty();
    });
  
});
