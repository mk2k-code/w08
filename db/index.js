const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });
// require("dotenv").config({ path: __dirname + "/../.env" });

// 連接資料庫
console.log(`server port : ${process.env.PORT}`);
// const DB = "mongodb://localhost:27017/fb";
const DB = process.env.DATABASE.replace("<password>", process.env.DATABASE_PASSWORD);

mongoose
	.connect(DB)
	.then(() => {
		console.log("資料庫連線成功");
	})
	.catch((error) => {
		console.log(error);
	});
