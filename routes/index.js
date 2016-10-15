var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express', activeNav: 'home' });
});

/* GET Pies On Map - HighCharts. */
router.get('/piemaphc', function(req, res, next) {
    res.render('piesonmaphc', { title: 'Express', activeNav: 'piemaphc' });
});

/* GET Hello World page. */
router.get('/helloworld', function(req, res) {
    res.render('helloworld', { title: 'Hello, World!' });
});

/* GET Userlist page. */
router.get('/userlist', function(req, res) {
    var db = req.db;
    console.log(db.User);
    console.log(User);
});

module.exports = router;