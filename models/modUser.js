const mongoose = require("mongoose");
// Schema 守門員
const userSchema = new mongoose.Schema(
	{
		// - name：會員名稱
		// - email：會員郵箱  *** unique
		// - photo：會員大頭貼
		// - sex：會員姓別
		// - password：會員密碼
		// - createdAt：會員註冊日期
		// - followers：會員 的粉絲		(別人追蹤我)
		// - following：會員 追蹤的帳號	 (我追蹤別人)

		name: {
			type: String,
			required: [true, "請輸入您的名字"],
		},
		email: {
			type: String,
			required: [true, "請輸入您的 Email"],
			unique: true,
			lowercase: true,
			select: false,
		},
		photo: String,		// avatar
		sex: {
			type: String,
			enum: ["male", "female"],
		},
		password: {
			type: String,
			required: [true, "請輸入密碼"],
			minlength: 6,
			select: false,
		},
		createdAt: {
			type: Date,
			default: Date.now,
			select: false
		},
		followers: [
			{
				user: { 
					type: mongoose.Schema.ObjectId, 
					ref: 'user' 
				},
				createdAt: {
				type: Date,
				default: Date.now
				}
			}
		],
		following: [
			{
				user: { 
					type: mongoose.Schema.ObjectId, 
					ref: 'user' 
				},
				createdAt: {
				type: Date,
				default: Date.now
				}
			}
		]
	},
	{ versionKey: false }
);
// User
const User = mongoose.model("user", userSchema);

module.exports = User;
