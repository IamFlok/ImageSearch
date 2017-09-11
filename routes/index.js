var express = require('express');
var mongo = require('mongodb').MongoClient;
var router = express.Router();
var request = require('request');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

// GET call parameters
var url = "/api/imagesearch/:imgSearch*";

router.get(url, (req, res, next) => {
  var searchVal = req.params.imgSearch;
  var { offset } = req.query;

  // create a data which will be stored in the database
  var data = {
    term: searchVal,
    when: new Date()
  };

  updateToDatabase(data);
  loadImages(searchVal, offset);

  // image loading function uses Google API
  function loadImages(val, offset) {
      gUrl = "https://www.googleapis.com/customsearch/v1?";
      gKey =  process.env.API_KEY || "AIzaSyCV_3bYpOB4viJT_XQh-l_xpz0US-fpYyo";
      gCx = process.env.CX || "007092322407064976168:kp_btmhckyu";
      if (offset === undefined) {
        gPath = gUrl + "key=" + gKey + "&cx=" + gCx + "&searchType=image" + "&q=" + val;
      } else {
        gPath = gUrl + "key=" + gKey + "&cx=" + gCx + "&searchType=image&start=" + offset + "&q=" + val;
      }


      request(gPath, (error, response, body) => {
        if (error) throw error;

        var resultToJSON = [];
        var resultToReturn = [];

        if (response.statusCode == 200) {
          resultToJSON = JSON.parse(body).items;

          if (resultToJSON) {
            resultToJSON.forEach((result) => {
              resultToReturn.push({
                url: result.link,
                snippet: result.snippet,
                thumbnail: result.image.thumbnailLink,
                context: result.image.contextLink
              });
            });
            res.json(resultToReturn);
          } else {
            res.send("No data found");
          }
        } else res.send(response.statusCode);
      });
  };
});

// GET recent queries
var queryUrl = "/api/latest/imagesearch";

router.get(queryUrl, (req, res, next) => {
  mongo.connect(process.env.MONGODB_URI ||
    'mongodb://fccuser:fCcUsER61@ds131384.mlab.com:31384/freecodecamp',
    (err, db) => {
      if (err) throw err;
      db.collection('imgsearch').find({}, {
        _id: false,
        term: true,
        when: true
      }).limit(10).toArray((err, list) => {
        if (err) throw err;
        res.send(list);
        db.close();
      });
    });
});

// updates a passed object to the database
function updateToDatabase(obj) {
  mongo.connect(process.env.MONGODB_URI ||
    'mongodb://fccuser:fCcUsER61@ds131384.mlab.com:31384/freecodecamp',
    (err, db) => {
     if (err) throw err;
     db.collection('imgsearch').insert(obj, (err, data) => {
         if (err) throw err;
         console.log("Updated to database.");
         db.close();
     });
  });
};

module.exports = router;
