const Web3 = require('web3'); // Web3 1.0.0-beta.36 only for now
const BigNumber = require('bignumber.js');
const { NocustManager } = require('nocust-client');

// Setup web3 with Infura
const web3 = new Web3(new Web3.providers.HttpProvider('https://rinkeby.infura.io/'));


// Specify to which commit-chain we want to connect
const nocustManager = new NocustManager({
	rpcApi: web3,
	hubApiUrl: 'https://rinkeby.liquidity.network/',
	contractAddress: '0x7e9c7846a22d4D6a8Fde0B586Ab1860B00316611',
});


//--------------------------------------------------
//exports

exports.listenIncomingTransfer = async function(publicKey, privateKey, callback) {
	web3.eth.accounts.wallet.add(privateKey);

	await nocustManager.registerAddress(publicKey);

	nocustManager.subscribeToIncomingTransfer(
		publicKey, 
		(transfer) => callback(transfer.wallet.address, transfer.amount)
	);
}


