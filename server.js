var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = process.env.PORT || 3000;

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));
var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Connect to the Mongo DB
var databaseUri = 'mongodb://localhost/mongoHeadlines';

if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI);
} else {
  mongoose.connect(databaseUri, { useNewUrlParser: true });
}


// Routes

// Route for getting all Articles from the db
app.get("/", function(req, res) {
  // Grab every document in the Articles collection
  db.Article.find({saved:false})
    .then(function(dbArticle) {
      
      //If no articles in db
      if(dbArticle.length===0)
      {
        res.render("index");
      }
      else{
        var hbsObject={
          data:dbArticle,
          isArticle:true,
          isSaved:false

        }
      // If we were able to successfully find Articles, send them back to the client
      res.render("index",hbsObject);
      }
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// A GET route for scraping the echoJS website
app.get("/scrape", function(req, res) {
  // First, we grab the body of the html with axios
  axios.get("https://www.nytimes.com/section/world").then(function(response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);
    
    // Now, we grab every h2 within an article tag, and do the following:
    $("li a").each(function(i, element) {
      
      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this)
        .children("h2")
        .text();
      result.link = $(this)
        .attr("href");
      result.summary = $(this)
          .children("p")
          .text();
      result.imag = $(this)
          .children("img")
          .attr("src");
      //result.image.contentType = "jpg";
      // Create a new Article using the `result` object built from scraping
      db.Article.create(result)
        .then(function(dbArticle) {
          // View the added result in the console
          console.log(dbArticle);
          res.redirect("/");
        })
        .catch(function(err) {
          // If an error occurred, log it
          console.log("Error");
          });
      
    })
 
    // Send a message to the client
    var hbsObject={
      scraped:true
    }
        
  }).catch(function(err) {
    // If an error occurred, log it
    console.log("Error");
  });
});

//Route to clear scrape
app.get("/clearScrape", function(req, res) {
  db.Article.remove({}, function (err, doc) {
    if (err) {
      console.log(err);
    } else {
      console.log('removed all articles');
    }
  });
});

// Route for getting saved Articles from the db
app.get("/saved", function(req, res) {
  // Grab every document in the Articles collection
  db.Article.find({saved:true})
    .then(function(dbArticle) {

      //If no saved Articles in db
      if(dbArticle.length===0)
      {
        res.render("index");
      }
      else{
        var hbsObject={
          data:dbArticle,
          isArticle:true,
          isSaved:true
        }
      // If we were able to successfully find Articles, send them back to the client
      res.render("savedArticles",hbsObject);
      }
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Article.findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("notes")
    .then(function(dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
    res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  db.Note.create(req.body)
    .then(function(dbNote) {
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.Article.findOneAndUpdate({ _id: req.params.id },{$push: { notes: dbNote._id }}, { new: true });
    })
    .then(function(dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for deleting/updating an Article's associated Note
app.post("/deletenote/:id/:noteid", function(req, res) {
  // Create a new note and pass the req.body to the entry
  db.Note.findByIdAndDelete(req.params.noteid)
    .then(function(dbNote) {
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.Article.findOneAndUpdate({ _id: req.params.id },{$pull: { notes: dbNote._id }}, { new: true });
    })
    .then(function(dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});



// Mark an article as saved
app.put("/save/:id", function (req, res) {


  db.Article.findOneAndUpdate({ _id: req.params.id }, { "saved": true }, { new: true })


    .then(function (dbArticle) {
      // View the updated result in the console
      console.log(dbArticle);
      res.send("Successfully saved");
    })
    .catch(function (err) {
      // If an error occurred, log it
      console.log(err);
      res.send("Error occurred saving article");
    });

});

//delete Article
app.delete("/delete/:id", function (req, res) {


  db.Article.findOneAndUpdate({ _id: req.params.id }, { "saved": false }, { new: true })


    .then(function (dbArticle) {
      
      //res.redirect("/saved");
    })
    .catch(function (err) {
      // If an error occurred, log it
      console.log(err);
      res.send("Error occurred deleting article");
    });

});

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});