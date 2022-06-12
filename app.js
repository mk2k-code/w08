// 1. router
// 2. modul 資料 模型
// 3. view  視圖 使用者看到的畫面(前端)
// 4. controller 控制器 商業邏輯 (callback function)
//  MVC
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");

// 載入路由
const indexRouter = require("./routes/index");
const ipRouter = require("./routes/ip");
const postsRouter = require("./routes/posts");
const usersRouter = require("./routes/users");
const uploadRouter = require('./routes/upload');
const cors = require("cors");
require("./db");
const app = express();
// 程式出現重大錯誤時
process.on('uncaughtException', err => {
	// 記錄錯誤下來，等到服務都處理完後，停掉該 process
	  console.error('Uncaughted Exception！')
	  console.error(err);
	  process.exit(1);
  });

app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// 1st level router
app.use("/", indexRouter);
app.use("/ip", ipRouter);
app.use("/posts", postsRouter);
app.use("/users", usersRouter);
app.use("/upload", uploadRouter)

// 404 router 錯誤
app.use((req, res, next) => {
	res.status(404).json({
		status: "error",
		message: "無此路由"
	});
});

// express 錯誤處理
// 自己設定的 err 錯誤 
// Production環境錯誤
const resErrorProd = (err, res) => {
	if (err.isOperational) {
	res.status(err.statusCode).json({
		message: err.message
	});
	} else if (err.type === "entity.parse.failed"){
		res.status(400).json({
			status: 'error',
			message: '(app)JSON 格式錯誤，請再次確認JSON Formate!'
		})
	} else if (err.code === 'MISSING_FIELD_NAME'){ 
		res.status(400).json({
			status: 'error',
			message: '系統錯誤:未提供上傳檔案路徑 !'
		})
	} else if (err.code === 'LIMIT_FILE_SIZE'){ 
		res.status(400).json({
			status: 'error',
			message: '系統錯誤:檔案超過2MB，不給傳!別搞掛系統!!'
		})
	} else {
		// log 紀錄
		console.error('出現重大錯誤', err);
		console.error(err.type)
		// 送出罐頭預設訊息
		res.status(500).json({
			status: 'error',
			message: '系統錯誤，請洽系統管理員'
		});
	}
};
// dev環境錯誤
const resErrorDev = (err, res) => {
res.status(err.statusCode).json({
	message: err.message,
	error: err,
	stack: err.stack
});
};

// 錯誤處理
app.use(function(err, req, res, next) {
	console.log("env:" + process.env.NODE_ENV)
// dev
err.statusCode = err.statusCode || 500;
if (process.env.NODE_ENV == "dev") {
	return resErrorDev(err, res);
} 
// prod
if (err.name === 'ValidationError'){
	err.message = "資料欄位未填寫正確，請重新輸入！"
	err.isOperational = true;
	return resErrorProd(err, res)
}
resErrorProd(err, res)
});

// 未捕捉到的 catch 
process.on('unhandledRejection', (err, promise) => {
console.error('未捕捉到的 rejection：', promise, '原因：', err);
// console.error(err.name);
// console.error(err.message);
// console.error(err.stack);
process.exit(1);
});

module.exports = app;
