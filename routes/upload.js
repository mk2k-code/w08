const express = require("express");
const router = express.Router();
const uploadCtrl = require("../controllers/upload");
const { handleErrorAsync } = require("../util/err");
const { isAuth } = require("../util/auth");
const checkImage = require("../util/checkImage");

router.post("/", isAuth, checkImage, function (req, res, next) {
	handleErrorAsync(uploadCtrl.uploadImage(req, res, next));
});

module.exports = router;
