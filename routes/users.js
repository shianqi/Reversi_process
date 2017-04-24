let express = require('express');
let fs = require('fs');
let path = require('path');
let drawChessboard = require('./drawChessboard');
let router = express.Router();


/* GET users listing. */
router.post('/', function(req, res, next) {
	let chessString = req.body.str;
	drawChessboard.draw(chessString).then((path)=>{
  		"use strict";
		res.send('<img src="' + path + '" />');
	});
});

module.exports = router;
