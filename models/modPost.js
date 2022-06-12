const mongoose = require("mongoose");
// Schema 守門員
const postSchema = new mongoose.Schema(
	{
		// - content：貼文內容
		// - image：貼文圖片
		// - createdAt：發文時間
		// - user：貼文姓名
		// - likes：按讚數

		// - tags：貼文標籤
		// - type：貼文種類[fan(粉絲)、group(社團)]
		// - comments：留言數

		content: {
			type: String,
			required: [true, "Content 未填寫"],
		},
		image: {
			type: String,
			default: "",
		},
		createAt: {
			type: Date,
			default: Date.now,
			select: false,
		},
		user: {
			type: mongoose.Schema.ObjectId,
			ref: "user",
			required: [true, "貼文 ID 未填寫"],
		},
		likes: [
			{ 
				type: mongoose.Schema.ObjectId, 
				ref: 'User' 
			}
		],
	},
	{ 
		versionKey: false,
		toJSON: { virtuals: true },
		toObject: { virtuals: true }
	}
);

postSchema.virtual('comments', {
	ref: 'Comment',
	foreignField: 'post',
	localField: '_id'
});

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
