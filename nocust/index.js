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

const BOB_PRIV = '0x6f62ae95be8a602d1358ca272b025b5b8bb625612657842eb23834118ca0021a';
const ALICE_PRIV = '0x3fd90538775a5ea09b25fb34fe5223ac53035e41977b1f825138ce49db25b3b3';

web3.eth.accounts.wallet.add(BOB_PRIV);
web3.eth.accounts.wallet.add(ALICE_PRIV);


//--------------------------------------------------
//exports


//listen on incoming transfer in nocust network
exports.listen = async function(publicKey, privateKey, callback) {
	web3.eth.accounts.wallet.add(privateKey);

	await nocustManager.registerAddress(publicKey);

	nocustManager.subscribeToIncomingTransfer(
		publicKey, 
		(transfer) => callback(transfer.wallet.address, transfer.amount)
	);
}


//transfer between two nocust accounts
exports.transfer = async function(from, to, amount) {

	// Register an address with the commit-chain
	await nocustManager.registerAddress(from);
	await nocustManager.registerAddress(to);

	amount = amount.toString();

	// Send some fETH on the commit-chain to Alice	
	const txId = await nocustManager.sendTransaction({ from, to, amount });

	console.log("Transfer to Alice sent ! Transaction ID: ", txId);
}


//deposit to nocust network
exports.deposit = async function(publicKey, privateKey, ether) {
	web3.eth.accounts.wallet.add(privateKey);

    await nocustManager.deposit(
        publicKey,                       // Account from which to make a deposit (its private key needs to be in the Web3 instance)
        web3.utils.toWei(ether.toString(),'ether'), // Amount to deposit
        web3.utils.toWei('10','gwei'),   // Gas price, 10 Gwei
        150000                         // Gas Limit
    );
}


exports.getBalance = async function(address) {
	const nocust = await nocustManager.getNocustBalance(address);
	const onChain = await nocustManager.getOnChainBalance(address);
	return { nocust, onChain };
}
