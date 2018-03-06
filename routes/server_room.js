'use strict';
const express = require('express');
const router = express.Router();

router.post('/', function(req, res, next) {
  if (process.env.DATABASE_URL && req.headers['x-forwarded-proto'] === 'http') {
    res.writeHead(404, {'Content-Type': 'text/plain; charset=utf-8'});
    res.end('ページがみつかりません');
  } else {
    res.render('room', {
      userName: req.body.userName,
      character: req.body.character,
    });
  }
});

// router.post('/', function(req, res, next) {
//   res.send(`hello ${req.body.userName}`);
// });

module.exports = router;
