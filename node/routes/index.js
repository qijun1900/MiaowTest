var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.json({ 
    message: 'Welcome to the API ,you successfully connected to the server!',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
