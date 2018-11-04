const MongoClient = require("mongodb").MongoClient;
const assert = require("assert");
const commandLineArgs = require("command-line-args");

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
      number_of_employees: 1,
      crunchbase_url: 1
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
  // console.log(options);

  const query = {
    founded_year: {
      $gte: options.fromYear,
      $lte: options.toYear
    }
  };

  if ("empCount" in options) {
    query.number_of_employees = { $gte: options.empCount };
  }
  return query;
}

function commandLineOptions() {
  var options = commandLineArgs([
    { name: "fromYear", alias: "f", type: Number },
    { name: "toYear", alias: "t", type: Number },
    { name: "empCount", alias: "c", type: Number }
  ]);

  if (!("fromYear" in options && "toYear" in options)) {
    console.log("Enter both start and end year");
    process.exit();
  }

  return options;
}
