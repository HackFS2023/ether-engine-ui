import { useCallback,useMemo, useState } from "react";
import { ethers } from "ethers";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";



const providerOptions = {

  walletconnect: {
    package: WalletConnectProvider, // required
    options: {
      rpc:{
        314159: "https://filecoin-calibration.chainup.net/rpc/v1"
      }
    }
  },
};


const web3Modal = new Web3Modal({
  cacheProvider: true,
  providerOptions
});

function useWeb3Modal(config = {}) {
  const [provider, setProvider] = useState(new ethers.JsonRpcProvider("https://filecoin-calibration.chainup.net/rpc/v1"));
  const [coinbase, setCoinbase] = useState();
  const [netId , setNetId] = useState(314159);
  const [connecting , setConnecting] = useState();
  const [autoLoaded, setAutoLoaded] = useState(false);
  // Web3Modal also supports many other wallets.
  // You can see other options at https://github.com/Web3Modal/web3modal
  const logoutOfWeb3Modal = useCallback(
    async function () {
      await web3Modal.clearCachedProvider();
      setCoinbase();
      setNetId(314159);
      setProvider(new ethers.JsonRpcProvider("https://filecoin-calibration.chainup.net/rpc/v1"));
    },
    [],
  );
  // Open wallet selection modal.
  const loadWeb3Modal = useCallback(async () => {

    try{
      setConnecting(true)
      setAutoLoaded(true);
      const conn = await web3Modal.connect();
      const newProvider = new ethers.BrowserProvider(conn,"any");
      const signer = await newProvider.getSigner()
      const newCoinbase = await signer.getAddress();
      const {chainId} = await newProvider.getNetwork();
      setProvider(newProvider);
      setCoinbase(newCoinbase);
      setNetId(chainId);
      setConnecting(false);
      conn.on('accountsChanged', accounts => {
        const newProvider = new ethers.BrowserProvider(conn,"any");
        setProvider(newProvider)
        setCoinbase(accounts[0]);
      });
      conn.on('chainChanged', async chainId => {
        window.location.reload();
      });
      // Subscribe to provider disconnection
      conn.on("disconnect", async (error: { code: number; message: string }) => {
        logoutOfWeb3Modal();
      });
      conn.on("close", async () => {
        logoutOfWeb3Modal();
      });

      return;
    } catch(err){
      setConnecting(false)
      logoutOfWeb3Modal();
    }

  }, [logoutOfWeb3Modal]);




  // If autoLoad is enabled and the the wallet had been loaded before, load it automatically now.
  useMemo(() => {
    if (!autoLoaded && web3Modal.cachedProvider) {
      try{
        setAutoLoaded(true);
        loadWeb3Modal();
      } catch(err){
        logoutOfWeb3Modal();
      }
    }
  },[autoLoaded,loadWeb3Modal]);



  return({provider, loadWeb3Modal, logoutOfWeb3Modal,coinbase,netId,connecting});
}



export default useWeb3Modal;
