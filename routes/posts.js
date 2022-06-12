const express = require("express");
const router = express.Router();
const postsCtrl = require("../controllers/posts");
const { handleErrorAsync } = require("../util/err");
const { isAuth } = require("../util/auth");

//  3.1.[GET]取得所有貼文
router.get("/", function (req, res, next) {
	handleErrorAsync(postsCtrl.getPosts(req, res, next));
});

//  3.2.[GET]取得單一貼文
router.get("/getpost/:id", function (req, res, next) {
	handleErrorAsync(postsCtrl.getPost(req, res, next));
});

//  3.3.[POST]新增貼文
router.post("/", isAuth, function (req, res, next) {
	handleErrorAsync(postsCtrl.postPost(req, res, next));
});

//  **** 刪除所有的貼文
router.delete("/", isAuth, function (req, res, next) {
	handleErrorAsync(postsCtrl.delPosts(req, res, next));
});

//  **** 刪除自己的貼文
router.delete("/:id", isAuth, function (req, res, next) {
	handleErrorAsync(postsCtrl.delPost(req, res, next));
});

//  **** 修改自己的貼文
router.patch("/:id", isAuth, function (req, res, next) {
	handleErrorAsync(postsCtrl.patchPost(req, res, next));
});

//  3.4.[POST]新增一則貼文的讚
router.post("/:id/like", isAuth, function (req, res, next) {
	handleErrorAsync(postsCtrl.like(req, res, next));
});

//  3.5.[DELETE]取消一則貼文的讚
router.delete("/:id/like", isAuth, function (req, res, next) {
	handleErrorAsync(postsCtrl.unLike(req, res, next));
});

//  3.6.[POST]新增一則貼文的留言
router.post("/:id/comment", isAuth, function (req, res, next) {
	handleErrorAsync(postsCtrl.postCommet(req, res, next));
});

//  3.7.[GET]取得個人所有貼文列表
router.get("/user/:id", isAuth, function (req, res, next) {
	handleErrorAsync(postsCtrl.getPostByUser(req, res, next));
});

//  **** 查詢自己的所有貼文
router.get("/get_posts_by_user", isAuth, function (req, res, next) {
	handleErrorAsync(postsCtrl.getPostByUser2(req, res, next));
});

module.exports = router;
