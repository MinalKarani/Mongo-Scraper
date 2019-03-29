## Mongo-Scraper

### live: https://pure-inlet-37313.herokuapp.com/

This app lets users view and leave comments on the latest news from the Boston Globe. The app uses Cheerio to scrape news from the New York Times website.

Whenever a user visits the site, the app scrapes stories from the New York Times website and displays them for the user. Each scraped article is saved in the Mongo database. The app scrapes and displays the following information for each article:

Headline - the title of the article

Summary - a short summary of the article

URL - the url to the original article

Users can leave comments on the articles displayed and revisit them later. The comments are saved to the database as well and associated with their articles. Users can also delete comments left on articles. All stored comments are visible to every user.

The app uses express, express-handlebars, mongoose, cheerio, axios, ajax, jquery.

Developed by Minal Karani. email: karani.minal@gmail.com

![demo](Scraper.gif)
