import { RepositoryFactoryHttp } from './infrastructure';

(async function () {
  const address = 'TBZN46UIU5BFLJI46VB4JTHHCE5EN2RFLR7NX3A';
  // Restから取得
  const repoHttp = new RepositoryFactoryHttp('testnet1.symbol-mikun.net');
  const listener = repoHttp.createWebSocketListener();
  await listener.open();
  // listener.registerNewBlock((newBlock) => {
  //   console.log('%o', newBlock);
  //   const n = newBlock as NewBlock;
  //   console.log(n.meta.generationHash);
  // });
  // listener.registerFinalizedBlock((finalizedBlock) => {
  //   console.log('%o', finalizedBlock);
  // });
  // listener.registerConfirmed(address, (res) => {
  //   console.log('%o', res);
  // });
  // listener.registerUnconfirmedAdded(address, (res) => {
  //   console.log('%o', res);
  // });
  // listener.registerUnconfirmedRemoved(address, (res) => {
  //   console.log('%o', res);
  // });
  listener.registerCosignature(address, (res) => {
    console.log('registerCosignature: %o', res);
  });
  listener.registerPartialAdded(address, (res) => {
    console.log('registerPartialAdded: %o', res);
    console.log('innerTransactions: %o', res.transaction.transactions);
  });
  listener.registerPartialRemoved(address, (res) => {
    console.log('registerPartialRemoved: %o', res);
  });
  listener.registerStatus(address, (res) => {
    console.log('registerStatus: %o', res);
  });
})();
