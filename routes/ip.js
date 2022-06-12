var express = require("express");
var router = express.Router();
const fetch = require("cross-fetch");

/* GET Dyno Web App external ip address. */
router.get("/", async function (req, res, next) {
	const url = "https://api.ipify.org?format=json";
	const myHost = "vast-lake-28740.herokuapp.com";
	console.log(req.socket.remoteAddress);
	console.log(req.socket.localAddress);
	fetch(url)
		.then((response) => response.json())
		.then((data) => {
			console.log(data);
			res.status(200).json({
				host: myHost,
				ip: data.ip,
			});
		})
		.catch((error) => console.log(error, 2));
});

module.exports = router;
