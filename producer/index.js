PORT = 3000;
PUBLIC_DIR = './public';
TRACKER_HOST = 'http://localhost:3001'
PUBLIC_KEY = '619B77cF3BAb703EffD17209CeD28866479e56ED';

//--------------------------------------------------
// database
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('db.json');
const db = low(adapter);

const uuid = require('uuid/v1');

db.defaults({'files': []}).write();

//--------------------------------------------------
// scan the "public" directory when startup
const fs = require('fs');
const request = require('request');
const ip = require("ip");

fs.readdir(PUBLIC_DIR, (err, files)=> {
	for (let f of files) {
		//register the file to tracker if not yet done before
		const path = '/' + f;
		const found = db.get('files').find({path}).value();
		if (!found) registerToTracker(path);
	}
});

function registerToTracker(path) {
	const uri = TRACKER_HOST+'/register/'+PUBLIC_KEY+'?path='+path;
	const headers = {
		'Content-Type': 'application/json',
		'x-forwarded-for': ip.address() +':' + PORT
	};

	request({method:'POST', headers, uri}, (err, res, body)=>{
		if (err) 
			return console.error(err);
		if (res.statusCode != 200)
			return console.warn("tracker register return " + res.statusCode);

		const {fileId} = JSON.parse(body);
		db.get('files')
		  .push({fileId, path})
		  .write();

		console.info("register " + path + " to tracker as " + fileId);
	});
}

//--------------------------------------------------
// express app

const express = require("express");
const app = express();

app.use(express.static('public'));


app.listen(PORT, () => {
	console.log("Server running on port "+PORT);
});

