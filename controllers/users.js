const User = require("../models/modUser");
const Post = require("../models/modPost");
// const ObjectId = require("mongoose").Types.ObjectId;
// const headers = require("../util/httpHeader");
// const { errorHandle, resWriteData } = require("../util/httpMsg");
// const jwt = require("jsonwebtoken");
const { appError } = require("../util/err");
const { jwtToken } = require("../util/auth");
const validator = require("validator");
const bcrypt = require("bcryptjs");


const users = {
	/* GET all users listing. */
	async getUsers(req, res, next) {
		const users = await User.find().select("+email");
		res.status(200).json({
			status: "success",
			data: users,
		});
	},

	// 1.1.[POST]註冊會員
	async signUp(req, res, next) {
		let { name, email, password, confirmPassword } = req.body;
		// 欄位內容不可為空白
		if (!name || !email || !password || !confirmPassword) {
			return next(appError("400", "人生可以留白，欄位內容不可為空白！", next));
		}
		// 密碼一致性檢查
		if (password !== confirmPassword) {
			return next(appError("400", "密碼不一致！", next));
		}
		// 密碼 6 碼以上
		if (!validator.isLength(password, { min: 6 })) {
			return next(appError("400", "密碼字數低於 6 碼", next));
		}
		// 是否為 Email
		if (!validator.isEmail(email)) {
			return next(appError("400", "Email 格式不正確", next));
		}
		// Email 是否已註冊過
		const hadEmail = await User.findOne({ email });
		if (hadEmail) {
			return next(appError(400, "此Email已註冊過，請改用其他email註冊!", next));
		}
		// 加密密碼
		password = await bcrypt.hash(req.body.password, 12);
		const newUser = await User.create({
			name,
			email,
			password,
		});
		jwtToken(newUser, 201, res);
	},

	// 1.2.[POST]登入會員，並發給 Token:jwtToken
	async signIn(req, res, next) {
		const { email, password } = req.body;
		if (!email || !password) {
			return next(appError(400, "人生可以留白，帳號密碼不可為空白", next));
		}
		// 是否為 Email
		if (!validator.isEmail(email)) {
			return next(appError("400", "Email 格式不正確", next));
		}
		const user = await User.findOne({ email }).select("+password");
		if (!user) {
			return next(appError(400, "無此帳號，您尚未註冊!", next));
		}
		const auth = await bcrypt.compare(password, user.password);
		if (!auth) {
			return next(appError(400, "密碼錯誤", next));
		}
		jwtToken(user, 200, res);
	},

	// 1.3.[PATCH]重設密碼
	async changePassword(req, res, next) {
		const { password, confirmPassword } = req.body;
		if (password !== confirmPassword) {
			return next(appError("400", "密碼不一致，請重新輸入!", next));
		}
		// 密碼 6 碼以上
		if (!validator.isLength(password, { min: 6 })) {
			return next(appError("400", "密碼字數低於 6 碼", next));
		}
		newPassword = await bcrypt.hash(password, 12);

		const user = await User.findByIdAndUpdate(req.user.id, {
			password: newPassword,
		});
		jwtToken(user, 200, res);
	},

	// 1.4.[GET]取得個人資料
	async getProfile(req, res, next) {
		const user = await User.findOne({ _id: req.user.id }).select("+email");
		res.status(200).json({
			status: "success",
			data: user,
		});
	},

	// 1.5.[PATCH]更新個人資料
	async updateProfile(req, res, next) {
		const { name, email, photo } = req.body;
		if (!name || !email) {
			return next(appError("400", "姓名與郵件欄位不可為空白！", next));
		}
		// check Email 格式
		if (!validator.isEmail(email)) {
			return next(appError("400", "Email 格式不正確", next));
		}
		// Email 是否已註冊過
		const hadEmail = await User.findOne({ email }).select("+email");
		if (hadEmail._id.toString() !== req.user.id && hadEmail.email === email) {
			return next(appError(400, "此Email已經註冊過，請改用其他email!", next));
		}
		const userInfo = await User.findByIdAndUpdate(req.user.id, {
			name: name,
			email: email,
			photo: photo,
		}).select("+email");
		// console.log(userInfo);
		res.status(200).json({
			status: "success",
			data: userInfo,
		});
	},

	// 2.1.[POST]追蹤朋友
	async following(req, res, next) {
		if (req.params.id === req.user.id) {
			return next(appError(401, "您無法追蹤自己", next));
		}

		await User.updateOne(
			{
				_id: req.user.id,
				"following.user": { $ne: req.params.id },
			},
			{
				$addToSet: { following: { user: req.params.id } },
			}
		);
		await User.updateOne(
			{
				_id: req.params.id,
				"followers.user": { $ne: req.user.id },
			},
			{
				$addToSet: { followers: { user: req.user.id } },
			}
		);
		res.status(200).json({
			status: "success",
			message: "您已成功追蹤！",
		});
	},

	// 2.2.[DELETE]取消追蹤朋友
	async unFollowing(req, res, next) {
		if (req.params.id === req.user.id) {
			return next(appError(401, "您無法取消追蹤自己", next));
		}
		await User.updateOne(
			{
				_id: req.user.id,
			},
			{
				$pull: { following: { user: req.params.id } },
			}
		);
		await User.updateOne(
			{
				_id: req.params.id,
			},
			{
				$pull: { followers: { user: req.user.id } },
			}
		);
		res.status(200).json({
			status: "success",
			message: "您已成功取消追蹤！",
		});
	},

	// 2.3.[GET]取得個人按讚列表
	async getLikes(req, res, next) {
		const likeList = await Post.find({
			likes: { $in: [req.user.id] },
		}).populate({
			path: "user",
			select: "name _id",
		});
		res.status(200).json({
			status: "success",
			likeList,
		});
	},

	// 2.4.[GET]取得個人追蹤名單
	async getFollowing(req, res, next) {
		const user = await User.findById(req.user.id).populate({
			path: "following.user",
			select: "name photo",
		});
		const followingList = user.following;
		res.status(200).json({
			status: "success",
			followingList,
		});
	},
};

module.exports = users;
