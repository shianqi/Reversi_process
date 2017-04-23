let path = require('path');
let Canvas = require('canvas');
let fs = require('fs');
let archiver = require('archiver');
/**
 * Created by killer on 17-4-22.
 */
let DrawChessboard = function(){
	"use strict";
	this.chessString = "";

	this.margin_left = 43;
	this.margin_right = 42;
	this.margin_top = 43;
	this.margin_bottom = 42;
	this.gird_size = 64;

	this.path = '';

	this.size_x = this.margin_left + this.gird_size*8 + this.margin_right;
	this.size_y = this.margin_top + this.gird_size*8 + this.margin_bottom;

	this.canvas = new Canvas(this.size_x, this.size_y);
	this.ctx = this.canvas.getContext('2d');

	this.chessboard_img = {
		chess_write: {
			write: null,
			write_last: null
		},
		chess_black: {
			black: null,
			black_last: null
		},
		chessboard: {
			empty: null,
			left: [],
			right: [],
			top: null,
			bottom: null
		}
	};
	this.turnBlack = true;
	this.lastPosition = {
		x: 0,
		y: 0
	};
	this.chess = new Array(8);
	for(let i=0;i<8;i++){
		this.chess[i] = new Array(8);
		for(let j=0;j<8;j++){
			this.chess[i][j] = 0;
		}
	}
	this.initChessboard();
};

DrawChessboard.prototype.getImg = function(imgPath){
	"use strict";
	return new Promise((resolve, reject)=>{
		fs.readFile(imgPath, function(err, squid){
			if (err) {console.log(err);reject();}
			let img = new Canvas.Image;
			img.src = squid;
			resolve(img);
		});
	});
};

DrawChessboard.prototype.saveImg = function(name){
	"use strict";
	return new Promise((resolve, reject)=>{
		let imgData = this.canvas.toDataURL();
		let base64Data = imgData.replace(/^data:image\/\w+;base64,/, "");
		let dataBuffer = new Buffer(base64Data, 'base64');

		fs.writeFile(this.path + '/' + name + ".png",dataBuffer, function (err) {
			if(err) reject(err);
			resolve();
		})
	});
};

DrawChessboard.prototype.createDir = function(){
	"use strict";
	return new Promise((resolve, reject)=>{
		this.path = '/home/killer/canvas-img/' + (new Date()).valueOf();
		fs.mkdir(this.path,(err)=>{
			if(err) reject(err);
			resolve();
		})
	})
};

/**
 * 加载棋盘所用图片
 * @returns {Promise.<void>}
 */
DrawChessboard.prototype.initChessboard = async function(){
	"use strict";
	try {
		let imgPath  = path.resolve(__dirname,'../public/img/w63.png');
		this.chessboard_img.chess_write.write = await this.getImg(imgPath);

		imgPath  = path.resolve(__dirname,'../public/img/wl63.png');
		this.chessboard_img.chess_write.write_last = await this.getImg(imgPath);

		imgPath  = path.resolve(__dirname,'../public/img/b63.png');
		this.chessboard_img.chess_black.black = await this.getImg(imgPath);

		imgPath  = path.resolve(__dirname,'../public/img/bl63.png');
		this.chessboard_img.chess_black.black_last = await this.getImg(imgPath);

		imgPath  = path.resolve(__dirname,'../public/img/e63.png');
		this.chessboard_img.chessboard.empty = await this.getImg(imgPath);

		imgPath  = path.resolve(__dirname,'../public/img/u597x43.png');
		this.chessboard_img.chessboard.top = await this.getImg(imgPath);

		imgPath  = path.resolve(__dirname,'../public/img/d597x42.png');
		this.chessboard_img.chessboard.bottom = await this.getImg(imgPath);

		for(let i = 0;i<8;i++){
			imgPath = path.resolve(__dirname,`../public/img/l${i+1}_43x64.png`);
			this.chessboard_img.chessboard.left.push(await this.getImg(imgPath));
		}

		for(let i = 0;i<8;i++){
			imgPath = path.resolve(__dirname,`../public/img/r${i+1}_42x64.png`);
			this.chessboard_img.chessboard.right.push(await this.getImg(imgPath));
		}
	}catch (err){
		console.log('img init wrong');
	}
};

/**
 * 绘制棋盘
 */
DrawChessboard.prototype.drawChessboard = function(){
	"use strict";
	this.ctx.drawImage(this.chessboard_img.chessboard.top,0,0);
	this.ctx.drawImage(this.chessboard_img.chessboard.bottom,0,this.margin_top+this.gird_size*8);
	this.chessboard_img.chessboard.left.forEach((item,index)=>{
		this.ctx.drawImage(item,0,this.margin_top+this.gird_size*index);
	});
	this.chessboard_img.chessboard.right.forEach((item,index)=>{
		this.ctx.drawImage(item,this.margin_left+this.gird_size*8,this.margin_top+this.gird_size*index);
	});
};

DrawChessboard.prototype.init = function(){
	"use strict";
	this.turnBlack = true;
	this.chess = new Array(8);
	for(let i=0;i<8;i++){
		this.chess[i] = new Array(8);
		for(let j=0;j<8;j++){
			this.chess[i][j] = 0;
		}
	}
};

/**
 * 绘制图片入口
 * @param chessString 棋谱字符串
 * @returns {String} 图片
 */
DrawChessboard.prototype.draw = async function (chessString) {
	"use strict";
	this.init();
	try {
		await this.createDir();
	} catch (err){
		console.log('create file error!');
	}

	this.chessString = chessString;
	this.drawChessboard();
	let chessArray = this.chessString.split('');


	this.computeChess('D','5');
	this.computeChess('D','4');
	this.computeChess('E','4');
	this.computeChess('E','5');

	let length = chessArray.length/2;
	for(let i=0;i<length;i++){
		this.computeChess(chessArray[i*2],chessArray[i*2+1]);
		this.drawChess();
		try{
			await this.saveImg(i);
		}catch (err){
			console.log(err);
		}
	}

	return this.canvas.toDataURL();
};

DrawChessboard.prototype.recoverChess = function(x_shift,y_shift){
	"use strict";
	let state = false;
	let x = this.lastPosition.x;
	let y = this.lastPosition.y;
	let now = this.turnBlack ? 1 : 2;
	while(true){
		x += x_shift;
		y += y_shift;
		if(x>7||y>7||x<0||y<0){
			break;
		}
		if(this.chess[y][x]===now){
			state = true;
			break;
		}else if(this.chess[y][x]===0){
			break;
		}
	}
	if(state){
		x = this.lastPosition.x;
		y = this.lastPosition.y;
		while(true){
			x += x_shift;
			y += y_shift;
			if(x>7||y>7||x<0||y<0){
				break;
			}
			if(this.chess[y][x]===now){
				break;
			}else if(this.chess[y][x]===0){
				break;
			}else{
				this.chess[y][x] = now;
			}
		}
	}
};

DrawChessboard.prototype.computeChess = function(x_String,y_String){
	let x = x_String.charCodeAt(0)-65;
	let y = +y_String-1;
	let now = this.turnBlack ? 1 : 2;
	this.lastPosition.x = x;
	this.lastPosition.y = y;
	this.chess[y][x] = now;
	//--检测八个方向的棋盘
	this.recoverChess(-1,-1);
	this.recoverChess(-1,0);
	this.recoverChess(-1,1);
	this.recoverChess(0,-1);
	this.recoverChess(0,1);
	this.recoverChess(1,-1);
	this.recoverChess(1,0);
	this.recoverChess(1,1);
	//--
	this.turnBlack = !this.turnBlack;
};

DrawChessboard.prototype.drawChess = function () {
	"use strict";
	for(let i=0;i<8;i++){
		for(let j=0;j<8;j++){
			if(this.chess[i][j]===2){
				this.ctx.drawImage(this.chessboard_img.chess_write.write,this.margin_left+this.gird_size*j,this.margin_top+this.gird_size*i);
			}else if(this.chess[i][j]===1){
				this.ctx.drawImage(this.chessboard_img.chess_black.black,this.margin_left+this.gird_size*j,this.margin_top+this.gird_size*i);
			}else{
				this.ctx.drawImage(this.chessboard_img.chessboard.empty,this.margin_left+this.gird_size*j,this.margin_top+this.gird_size*i);
			}
			if(this.chess[this.lastPosition.y][this.lastPosition.x]===2){
				this.ctx.drawImage(
					this.chessboard_img.chess_write.write_last,
					this.margin_left+this.gird_size*this.lastPosition.x,
					this.margin_top+this.gird_size*this.lastPosition.y
				);
			}else{
				this.ctx.drawImage(
					this.chessboard_img.chess_black.black_last,
					this.margin_left+this.gird_size*this.lastPosition.x,
					this.margin_top+this.gird_size*this.lastPosition.y
				);
			}
		}
	}
};

module.exports = DrawChessboard;