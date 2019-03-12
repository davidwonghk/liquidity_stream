PORT = 3001;

//--------------------------------------------------
// database
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('db.json');
const db = low(adapter);

const uuid = require('uuid/v4');

//{fileId: {publicKey, ip, path}}
db.defaults({"contents":[]})
  .write();


//--------------------------------------------------
// express app

const express = require("express");
const app = express();


app.listen(PORT, () => {
	console.log("Server running on port "+PORT);
});

app.post("/register/:producer", (req, res, next) => {
	const publicKey = req.params.producer;
	const path = req.query.path;
	const ip = getIp(req); 
	const fileId = uuid();
	const lastUpdated = new Date().getTime();

	db.get("contents")
	  .push({fileId, publicKey, ip, path, lastUpdated})
	  .write();

	res.json({fileId, publicKey, ip, path});
});

app.get("/list", (req, res, next) => {
	const ret = db.get('contents').reduce( (res, {fileId, ip, path})=> {
		res[fileId]="http://"+ip+path;
		return res
	}, {});

	res.json(ret);
});


function getIp(req) {
	const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	if (ip.substr(0, 7) == "::ffff:") return ip.substr(7);
	return ip;
}

