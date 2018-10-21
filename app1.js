const express = require("express"),
  app = express(),
  engines = require("consolidate"),
  MongoClient = require("mongodb").MongoClient,
  assert = require("assert"),
  bodyParser = require("body-parser");

app.engine(".html", engines.nunjucks);
app.set("view engine", "html");
app.set("views", __dirname + "/views");
app.use(bodyParser.urlencoded({ extended: true }));

//Handler for internal server errors
function errorHandler(err, req, res, next) {
  console.error(err.message);
  console.error(err.stack);
  res.status(500);
  res.render("error_template", { error: err });
}

MongoClient.connect(
  "mongodb://localhost:27017/",
  { useNewUrlParser: true },
  (err, client) => {
    const db = client.db("video");
    assert.equal(null, err);
    console.log("Connected to MongoDB");

    app.get("/", (req, res, next) => {
      res.render("add_movie", {});
    });

    app.post("/add_movie", (req, res, next) => {
      var title = req.body.title;
      var year = req.body.year;
      var imdb = req.body.imdb;
      if (title == " " || year == " " || imdb == " ") {
        next("Please provide an entry for all fields.");
      } else {
        db.collection("movies").insertOne(
          { 'title': title, 'year': year, 'imdb': imdb },
          (err, result) => {
            assert.equal(null, err);
            console.log(err);
            res.send("Document inserted with _id: " + result.insertedId);
          }
        );
      }
    });

    app.get("/movies", (req, res) => {
      db.collection("movies")
        .find({})
        .toArray((err, docs) => {
          res.render("movies", { movies: docs });
        });
    });
    app.use(errorHandler);

    const server = app.listen(3000, () => {
      const port = server.address().port;
      console.log("Server Started at:", port);
    });
  }
);
