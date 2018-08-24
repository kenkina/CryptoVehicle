/*
 * NB: since truffle-hdwallet-provider 0.0.5 you must wrap HDWallet providers in a 
 * function when declaring them. Failure to do so will cause commands to hang. ex:
 * ```
 * mainnet: {
 *     provider: function() { 
 *       return new HDWalletProvider(mnemonic, 'https://mainnet.infura.io/<infura-key>') 
 *     },
 *     network_id: '1',
 *     gas: 4500000,
 *     gasPrice: 10000000000,
 *   },
 */

/*
* #explanation:
*   etherCost = gas * gasPrice
    etherCost = 4712388 * (100 * 10^-9 ether)
    etherCost = 0.4712388 ether
*/

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*" // Match any network id
      // gas      - gas limit (d. 4712388)
      // gasPrice - gas price (d. 100000000000, 100 Shannon, 100 GWei, 100 nanoEther)
      // from     - from address (d. first from Ethereum client)
      // provider - web3 provider instance. If exists, ignore host and port
    }
  },
  solc: {
    optimizer: {
      enabled: true,
      runs: 500
    }
  }
};
