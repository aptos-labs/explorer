export const getAptosWallet = () => {
  return "aptos" in window;
};

export const isWalletConnected = async () => {
  try {
    return window.aptos && (await window.aptos.isConnected());
  } catch (error) {
    console.log(error);
  }
};

export const connectToWallet = async () => {
  try {
    return await window.aptos.connect();
  } catch (error) {
    console.log(error);
  }
};

export const getAccountAddress = async () => {
  try {
    return await window.aptos.account();
  } catch (error) {
    console.log(error);
  }
};
