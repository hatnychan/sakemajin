'use strict';
const express = require('express');
const router = express.Router();

router.post('/', function(req, res, next) {
  res.render('room', {
    userName: req.body.userName,
    character: req.body.character,
  });
});

// router.post('/', function(req, res, next) {
//   res.send(`hello ${req.body.userName}`);
// });

module.exports = router;
