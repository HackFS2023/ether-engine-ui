import { useEffect, useState } from "react";
import { ethers } from "ethers";


import abis from "../contracts/abis";
import addresses from "../contracts/addresses";

function useEtherEngine() {

  const [etherEngine, setEtherEngine] = useState();


  const initiateContract = async (provider,netId) => {
    let newEtherEngine
    // Calibration
    alert(netId)
    if (netId === 314159) {
      newEtherEngine = new ethers.Contract(addresses.etherEngine.calibration, abis.etherEngine, provider);
      alert(netId)
    }
    setEtherEngine(newEtherEngine);
  }

  const compute = async (specStr,provider) => {
    const signer = await provider.getSigner();
    // Hyperspace
    const priorityFee = (await provider.getFeeData()).maxPriorityFeePerGas;

    const etherEngineWithSinger = etherEngine.connect(signer);
    const tx = await etherEngineWithSinger.runJob(specStr,{
      value: ethers.parseEther("0.03"),
      maxPriorityFeePerGas: priorityFee
    });

    await tx.wait();
  }


  return({
    etherEngine,
    initiateContract,
    compute
  });
}



export default useEtherEngine;
