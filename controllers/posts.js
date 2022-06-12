const Post = require("../models/modPost");
const Comment = require("../models/modComment");
// const User = require("../models/modUser");
const validator = require("validator");
const { appError } = require("../util/err");

const posts = {
	//  3.1.[GET]取得所有貼文
	async getPosts(req, res, next) {
		const timeSort = req.query.timeSort == "asc" ? "createdAt" : "-createdAt";
		const q = req.query.q !== undefined ? { content: new RegExp(req.query.q) } : {};
		const post = await Post.find(q)
			.populate({
				path: "user",
				select: "name photo",
			})
			.populate({
				path: "comments",
				select: "comment user",
			})
			.sort(timeSort);
		// res.send('respond with a resource');
		res.status(200).json({
			post,
		});
	},

	//  3.2.[GET]取得單一貼文
	async getPost(req, res, next) {
		const _id = req.params.id;
		// const user_id = req.user.id;
		if (validator.isMongoId(_id)) {
			const post = await Post.findById(_id)
				.populate({
					path: "user",
					select: "name photo",
				})
				.populate({
					path: "comments",
					select: "comment user",
				});
			if (post) {
				res.status(200).json({
					post,
				});
			} else {
				return appError(400, "無貼文", next);
			}
		} else {
			return appError(400, "貼文 id格式錯誤，請重新輸入", next);
		}
	},

	//  3.3.[POST]新增貼文
	async postPost(req, res, next) {
		const user_id = req.user.id;
		const { content, image } = req.body;
		if (content) {
			const newPost = await Post.create({
				user: user_id,
				content: content,
				image: image || "",
			});
			res.status(200).json({
				post: newPost,
			});
		} else {
			return appError(400, "人生可以空白, 貼文不可空白!", next);
		}
	},

	//  **** 刪除所有貼文
	async delPosts(req, res, next) {
		const posts = await Post.deleteMany({});
		res.status(200).json({
			post: posts,
		});
	},

	//  **** 刪除自己的貼文
	async delPost(req, res, next) {
		const post_id = req.params.id;
		const user_id = req.user.id;
		let post;
		if (validator.isMongoId(post_id)) {
			post = await Post.findById(post_id);
		} else {
			return appError(400, "貼文id格式錯誤，請重新輸入", next);
		}
		if (!post) {
			return appError(400, "無此貼文ID", next);
		}
		// console.log(post.user.toString() , user_id)
		//  只能刪自己的貼文
		if (post.user.toString() === user_id) {
			const del_post = await Post.findByIdAndDelete(post_id);
			res.status(200).json({
				post: del_post,
			});
			console.log("貼文刪除成功");
		} else {
			return appError(400, "貼文非本人所張貼，無法刪除", next);
		}
	},

	//  **** 修改自己的貼文
	async patchPost(req, res, next) {
		const post_id = req.params.id;
		const user_id = req.user.id;
		let post;
		const { user, content, image } = req.body;
		if (validator.isMongoId(post_id)) {
			post = await Post.findById(post_id);
		} else {
			return appError(400, "貼文id格式錯誤，請重新輸入", next);
		}
		if (!post) {
			return appError(400, "無此貼文，請重新輸入", next);
		}
		//  只能修改自己的貼文
		if (post.user.toString() === user_id) {
			if (content) {
				const result = await Post.findByIdAndUpdate(post_id, {
					content: content,
					image: image,
				});
				res.status(200).json({
					post: result,
				});
				console.log("修改成功");
			} else {
				return appError(400, "人生可以空白, 貼文不可空白!", next);
			}
		} else {
			return appError(400, "非本人所張貼之貼文，無法修改", next);
		}
	},

	//  3.4.[POST]新增一則貼文的讚
	async like(req, res, next) {
		const _id = req.params.id;
		// 檢查貼文id格式
		if (!validator.isMongoId(_id)) {
			return appError(400, "貼文id格式錯誤，請重新輸入", next);
		}
		// 檢查是否已按讚
		const post = await Post.findById( _id);
		// console.log("1: " + post.likes.includes(req.user.id) + " 2: " + req.user.id)
		if (post.likes.includes(req.user.id)) {
			return appError(400, "已經按讚了，別再按了!", next);
		} 
		const result = await Post.findOneAndUpdate({ _id }, { $addToSet: { likes: req.user.id } });
		res.status(201).json({
			status: "success",
			postId: _id,
			userId: req.user.id,
			result,
		})
	},

	//  3.5.[DELETE]取消一則貼文的讚
	async unLike(req, res, next) {
		const _id = req.params.id;
		// 檢查貼文id格式
		if (!validator.isMongoId(_id)) {
			return appError(400, "貼文id格式錯誤，請重新輸入", next);
		}
		// 檢查是否已按讚
		const post = await Post.findById( _id);
		// console.log("1: " + post.likes.includes(req.user.id) + " 2: " + req.user.id)
		if (!post.likes.includes(req.user.id)) {
			return appError(400, "沒按讚，要如何取消？別再按了!", next);
		} 
		const result = await Post.findOneAndUpdate({ _id }, { $pull: { likes: req.user.id } });
		res.status(201).json({
			status: "success",
			postId: _id,
			userId: req.user.id,
			result,
		});			

	},

	//  3.6.[POST]新增一則貼文的留言
	async postCommet(req, res, next) {
		const user = req.user.id;
		const post = req.params.id;
		const { comment } = req.body;
		if (!validator.isMongoId(post)) {
			return appError(400, "貼文id格式錯誤，請重新輸入", next);
		}
		if (comment) {
			const newComment = await Comment.create({
				post,
				user,
				comment,
			});
			res.status(201).json({
				status: "success",
				data: {
					comments: newComment,
				},
			});
		} else {
			return appError(400, "人生可以空白，留言不可空白!", next);
		}

	},
	//  3.7.[GET]取得個人所有貼文列表
	async getPostByUser(req, res, next) {
		const user = req.params.id;
		if (!validator.isMongoId(user)) {
			return appError(400, "User id格式錯誤，請重新輸入", next);
		}
		const posts = await Post.find({ user }).populate({
			path: "comments",
			select: "comment user",
		});

		res.status(200).json({
			status: "success",
			results: posts.length,
			posts,
		});
	},

	//  **** 查詢自己的所有貼文
	async getPostByUser2(req, res, next) {
		const user_id = req.user.id;
		if (validator.isMongoId(user_id)) {
			const post = await Post.find({ user: user_id })
				.populate({
					path: "user",
					select: "name photo ",
				})
				.populate({
					path: "comments",
					select: "comment user",
				});
			if (post) {
				res.status(200).json({
					post,
				});
			} else {
				return appError(400, "無貼文", next);
			}
		} else {
			return appError(400, "User id格式錯誤，請重新輸入", next);
		}
	},
};

module.exports = posts;
