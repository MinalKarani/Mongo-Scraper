

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

  $.ajax({
    method: "GET",
    url: "/articles/" + articleNo,
  })
    // With that done, add the note information to the page
    .then(function(data) {
     console.log(data);
     $("#note-container").empty();
     for (var i = 0; i < data.notes.length; i++) 
     {
      
        $("#note-container").append("<p>"+ data.notes[i].title + "<button class='btn btn-danger closeNote' attrId=" + data.notes[i]._id + "  articleId=" + articleNo + ">X</button></p");
    }
    //If there are no notes added for article
    if (data.notes.length===0) {
      $("#note-container").append("<p>No Notes for this article yet.</p><br><br>");
    }
      
    });

});

//Delete notes for Article Route /deletenote/noteId/articleId
$(document).on("click", ".closeNote", function() {
var noteId   = $(this).attr("attrId");
var articleId = $(this).attr("articleId");

$.ajax({
  method: "POST",
  url: "/deletenote/" + $(this).attr("articleId") + "/" + $(this).attr("attrId")
  
})
  // With that done, 
  .then(function(data) {
    console.log(data);
    $('#notesModal').toggle();
    location.reload();

  });
});

//on Click of Save Note button, POST request to server route /articles/articleId
//body of request contains title of note
$(document).on("click", "#saveNote", function() {
  
  var thisId = $(this).attr("articleNo");
  console.log(thisId);
    
  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data:{
      // Value taken from note textarea
      title:$("#title").val()
    }
  })
    // With that done, add the note information to the page
    .then(function(data) {
     
      console.log(data);
      $("#title").val("");
      //$("#notesModal").toggle();

    });
   
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


