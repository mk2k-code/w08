const { appError } = require("../util/err");
const sizeOf = require("image-size");
const { ImgurClient } = require("imgur");

const upload = {
	async uploadImage(req, res, next) {
		if (!req.files) {
			return next(appError(400, "尚未提供任何上傳檔案資料", next));
		}
		// 會由 middleware:checkImage 交給 resErrorProd 處理 --> err.code === 'LIMIT_FILE_SIZE'
		if (req.files[0]?.size > 2 * 1024 * 1024) {
			return next(appError(400, "圖檔過大，檔案超過2MB.....!", next));
		}
		// const dimensions = sizeOf(req.files[0].buffer);
		// if (dimensions.width !== dimensions.height) {
		// 	return next(appError(400, "圖片長寬不符合 1:1 尺寸。", next));
		// }
		const client = new ImgurClient({
			clientId: process.env.IMGUR_CLIENTID,
			clientSecret: process.env.IMGUR_CLIENT_SECRET,
			refreshToken: process.env.IMGUR_REFRESH_TOKEN,
		});
		const response = await client.upload({
			image: req.files[0].buffer.toString("base64"),
			type: "base64",
			album: process.env.IMGUR_ALBUM_ID,
		});
		res.status(200).json({
			status: "success",
			imgUrl: response.data.link,
		});
	},
};
module.exports = upload;
