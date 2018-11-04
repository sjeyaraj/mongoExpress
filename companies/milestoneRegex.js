const MongoClient = require("mongodb").MongoClient;
const commandLineArgs = require("command-line-args");
const assert = require("assert");

const options = commandLineOptions();

MongoClient.connect(
  "mongodb://localhost:27017/crunchbase",
  { useNewUrlParser: true },
  (err, db) => {
    assert.equal(err, null);
    console.log("Successfully connected to MongoDB.");

    const query = queryDocument(options);
    console.log(query);
    const projectFields = projection(options);
    const cursor = db.collection("companies").find(query, projectFields);
    let numMatches = 0;

    cursor.forEach(
      doc => {
        numMatches += 1;
        console.log(doc);
      },
      err => {
        assert.equal(err, null);
        console.log("Given Query:" + JSON.stringify(query));
        console.log("Matching documents: " + numMatches);
        return db.close();
      }
    );
  }
);

function queryDocument(options) {
  console.log(options);
  const query = {};
  if ("overview" in options) {
    query.overview = { $regex: options.overview, $options: "i" };
  }
  if ("milestone" in options) {
    query["milestones.source_description"] = {
      $regex: options.milestone,
      $options: "i"
    };
  }
  return query;
}

function projection(options) {
  const projection = {
    _id: 0,
    name: 1,
    founded_year: 1
  };
  if ("overview" in options) {
    projection.overview = 1;
  }
  if ("milestone" in options) {
    projection["milestones.source_description"] = 1;
  }
  return projection;
}

function commandLineOptions() {
  var options = commandLineArgs([
    { name: "overview", alias: "o", type: String },
    { name: "milestone", alias: "m", type: String }
  ]);

  if (Object.keys(options).length < 1) {
    console.log("You should give overview or milestone parameter!");
    process.exit();
  }

  return options;
}
