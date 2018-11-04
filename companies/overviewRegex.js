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
    const projection = {
      _id: 1,
      name: 1,
      founded_year: 1,
      overview: 1
    };
    const cursor = db.collection("companies").find(query, projection);
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
  return query;
}

function commandLineOptions() {
  var options = commandLineArgs([
    { name: "overview", alias: "o", type: String }
  ]);

  if (!("overview" in options)) {
    console.log("Enter overview terms to search");
    process.exit();
  }

  return options;
}
