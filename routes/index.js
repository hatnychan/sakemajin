var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  if (process.env.DATABASE_URL && req.headers['x-forwarded-proto'] === 'http') {
    res.writeHead(404, {'Content-Type': 'text/plain; charset=utf-8'});
    res.end('ページがみつかりません');
  } else {
    res.render('index', {});
  }
});

module.exports = router;
