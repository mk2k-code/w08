const express = require("express");
const router = express.Router();
const usersCtrl = require("../controllers/users");
const { handleErrorAsync } = require("../util/err");
const { isAuth } = require("../util/auth");

/* GET all users listing. */
router.get("/", function (req, res, next) {
	handleErrorAsync(usersCtrl.getUsers(req, res, next));
});

// 1.1.[POST]註冊會員
router.post("/sign_up", function (req, res, next) {
	handleErrorAsync(usersCtrl.signUp(req, res, next));
});

// 1.2.[POST]登入會員
router.post("/sign_in", function (req, res, next) {
	handleErrorAsync(usersCtrl.signIn(req, res, next));
});

// 1.3.[PATCH]重設密碼
router.patch("/changePassword", isAuth, function (req, res, next) {
	handleErrorAsync(usersCtrl.changePassword(req, res, next));
});

// 1.4.[GET]取得個人資料
router.get("/profile", isAuth, function (req, res, next) {
	handleErrorAsync(usersCtrl.getProfile(req, res, next));
});

// 1.5.[PATCH]更新個人資料
router.patch("/profile", isAuth, function (req, res, next) {
	handleErrorAsync(usersCtrl.updateProfile(req, res, next));
});

// 2.1.[POST]追蹤朋友
router.post("/:id/follow", isAuth, function (req, res, next) {
	handleErrorAsync(usersCtrl.following(req, res, next));
});

// 2.2.[DELETE]取消追蹤朋友
router.delete("/:id/unfollow", isAuth, function (req, res, next) {
	handleErrorAsync(usersCtrl.unFollowing(req, res, next));
});

// 2.3.[GET]取得個人按讚列表
router.get("/getLikes", isAuth, function (req, res, next) {
	handleErrorAsync(usersCtrl.getLikes(req, res, next));
});

// 2.4.[GET]取得個人追蹤名單
router.get("/following", isAuth, function (req, res, next) {
	handleErrorAsync(usersCtrl.getFollowing(req, res, next));
});

module.exports = router;
