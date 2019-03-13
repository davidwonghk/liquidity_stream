const Web3 = require('web3'); // Web3 1.0.0-beta.36 only for now
const BigNumber = require('bignumber.js');
const { NocustManager } = require('nocust-client');

// Setup web3 with Infura const web3 = new Web3(new Web3.providers.HttpProvider('https://rinkeby.infura.io/'));

const BOB_PUB = '0x209f4DD8B4eDaE7636AE6190eA2f2971957D8307';
const ALICE_PUB = '0x619B77cF3BAb703EffD17209CeD28866479e56ED';
const BOB_PRIV = '0x6f62ae95be8a602d1358ca272b025b5b8bb625612657842eb23834118ca0021a';
const ALICE_PRIV = '0x3fd90538775a5ea09b25fb34fe5223ac53035e41977b1f825138ce49db25b3b3';

web3.eth.accounts.wallet.add(BOB_PRIV);
web3.eth.accounts.wallet.add(ALICE_PRIV);


// Specify to which commit-chain we want to connect
const nocustManager = new NocustManager({
	rpcApi: web3,
	hubApiUrl: 'https://rinkeby.liquidity.network/',
	contractAddress: '0x7e9c7846a22d4D6a8Fde0B586Ab1860B00316611',
});



async function sendToAlice() {
	// Register an address with the commit-chain
	await nocustManager.registerAddress(BOB_PUB);
	await nocustManager.registerAddress(ALICE_PUB);

	// Send some fETH on the commit-chain to Alice	
	const txId = await nocustManager.sendTransaction({
			from: BOB_PUB,
			to: ALICE_PUB,
			// 0.00 fEther in Wei as BigNumber. 
			//amount: (new BigNumber(0.00)).shiftedBy(-18),
			amount: '1'		//FIXME: will throw InSufficient Fund Exception
	 });
	console.log("Transfer to Alice sent ! Transaction ID: ", txId);

}


async function waitFromAlice() {
    // Register an address to be used with the LQD manager
    const incomingTransferEventEmitter = await nocustManager.registerAddress(ALICE_PUB);

    // Trigger a log upon an incoming transfer
    incomingTransferEventEmitter.on('IncomingTransfer', (transfer) => {
        console.log(`Alice is receiving a transfer of	${transfer.amount} wei from ${transfer.wallet.address}`);
    });
}


/**
 * To make transfers, you need to have NOCUST funds. 
 */
async function fundNocust() {
    await nocustManager.deposit(
        BOB_PUB,                       // Account from which to make a deposit (its private key needs to be in the Web3 instance)
        web3.utils.toWei('0.1','ether'), // Amount to deposit
        web3.utils.toWei('10','gwei'),   // Gas price, 10 Gwei
        150000                         // Gas Limit
    );
}


async function main() {
    //waitFromAlice();
    //await fundNocust();   //run this only once!
    await sendToAlice();
}

main();

