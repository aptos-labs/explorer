export const getAptosWallet = () => {
  return 'aptos' in window;
}

export const isWalletConnected = async () => {
  return window.aptos && await window.aptos.isConnected();
}

export const connectToWallet = async () => {
  return await window.aptos.connect();
}

export const getAccountAddress = async () => {
  return await window.aptos.account();
}