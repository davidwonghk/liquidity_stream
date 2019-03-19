PORT = 3002;
TRACKER_HOST = 'http://localhost:3001'

const nocust = require("../nocust");


//--------------------------------------------------
// express app

const express = require("express");
const app = express();
const cors = require('cors')

app.use(cors());
app.use(express.static('public'));


app.get("/balance/:address", (req, res) => {
	const address = req.params.address;

	nocust.getBalance(address).then( (balance)=>res.json( balance ) );
});

app.get("/transfer", (req, res)=> {
	const {from, to, amount} = req.query;

	nocust.transfer(from, to, amount);

	res.json({done: true});
});


app.listen(PORT, () => {
	console.log("Server running on port "+PORT);
});


