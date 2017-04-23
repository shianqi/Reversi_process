let express = require('express');
let fs = require('fs');
let path = require('path');
let DrawChessboard = require('./drawChessboard');
let router = express.Router();
let drawChessboard = new DrawChessboard();

/* GET users listing. */
router.post('/', function(req, res, next) {
	let chessString = req.body.str;
	let ImgUrl = drawChessboard.draw(chessString);
  	ImgUrl.then((path)=>{
  		"use strict";
		res.send('<img src="' + path + '" />');
	});
});

module.exports = router;
