var express = require('express');
var mongo = require('mongodb').MongoClient;
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

// GET call parameters
var url = "/api/imagesearch/:imgSearch*";

router.get(url, (req, res, next) => {
  var searchVal = req.params.imgSearch;
  var { offset } = req.query;

  console.log("searchVal: " + searchVal);

  var data = {
    term: searchVal,
    when: new Date()
  };

  updateToDatabase(data);

  res.send(data);
});

// GET recent queries
var queryUrl = "/api/latest/imagesearch/";

router.get(queryUrl, (req, res, next) => {
  mongo.connect(process.env.MONGODB_URI ||
    'mongodb://fccuser:fCcUsER61@ds131384.mlab.com:31384/freecodecamp',
    (err, db) => {
      if (err) throw err;
      var col = db.collection('imgsearch');

      col.find({}, {
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

// helper function, updates passed object to database
function updateToDatabase(obj) {
  mongo.connect(process.env.MONGODB_URI ||
    'mongodb://fccuser:fCcUsER61@ds131384.mlab.com:31384/freecodecamp',
    (err, db) => {
     if (err) throw err;
     var col = db.collection('imgsearch');

     col.insert(obj, (err, data) => {
         if (err) throw err;
         console.log("Updated to database.");
         db.close();
     });
  });
};


module.exports = router;
