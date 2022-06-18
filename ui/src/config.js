const contractName = "picasarts.testnet";
 
module.exports = function getConfig() {
  let config = {
    networkId: "testnet",
    nodeUrl: "https://rpc.testnet.near.org",
    // walletUrl: 'http://localhost:1234',
    walletUrl: "https://wallet.testnet.near.org",
    helperUrl: "https://helper.testnet.near.org",
    contractName
  };
  return config;
};
