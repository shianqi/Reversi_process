## Reversi_process
用 NodeJS 将黑白棋对局的每一步对局情况保存成本地图片

接收的数据格式例如：
```
E6F4C3D6F5E7F6C6C5D3D7C4B6C7B5B4E3A5F8F3D8A6B3G5A4E8F7C8B8B7G4H5H3G3F2G2H6H7H4H2E2D1E1C2C1G6D2A3B2A1B1F1G7H8A2G8A7A8
```

```node.js
let drawChessboard = require('./drawChessboard');

router.post('/', function(req, res, next) {
    let chessString = req.body.str;
    drawChessboard.draw(chessString).then((path)=>{
        "use strict";
        res.send('<img src="' + path + '" />');
	});
});
```