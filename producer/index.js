PORT = 3000;
PUBLIC_DIR = './public';
TRACKER_HOST = 'http://localhost:3001'
PUBLIC_KEY = '0x619B77cF3BAb703EffD17209CeD28866479e56ED';
PRIVATE_KEY = '0x3fd90538775a5ea09b25fb34fe5223ac53035e41977b1f825138ce49db25b3b3';
UNIT = 1;

//--------------------------------------------------
// database
const { listenIncomingTransfer } = require('./nocust');

const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('db.json');
const db = low(adapter);


db.defaults({'files': [], 'received':{}, 'served': {}}).write();

listenIncomingTransfer(PUBLIC_KEY, PRIVATE_KEY, (from, amount)=> {
	console.log('received ' + amount + ' from ' + from);
	let received = db.get('received')[from];
	if (received === undefined) received = 0;
	db.set('received.'+from, received + amount).write();
});


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

app.use(checkIsPaid);
app.use(express.static('public'));


function checkIsPaid(req, res, next) {
	const consumer = req.query.consumer;
	const served = db.get('served')[consumer] || 0;
	if ((db.get('received')[consumer] || 0) > served) {
		db.set('served.'+consumer, served + UNIT).write();
		return next();	
	}
 	else {
		console.log("Consumer " + consumer + " does not have enough fund");
	}
}

app.listen(PORT, () => {
	console.log("Server running on port "+PORT);
});


