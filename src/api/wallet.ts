export const getAptosWallet = () => {
  if ('aptos' in window) {
    return window.aptos;
  } else {
    return false;
  }
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