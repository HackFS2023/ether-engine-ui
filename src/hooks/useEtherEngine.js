import { useEffect, useState,useCallback } from "react";
import { ethers } from "ethers";


import abis from "../contracts/abis";
import addresses from "../contracts/addresses";

function useEtherEngine() {

  const [etherEngine, setEtherEngine] = useState();


  const fetchPastEvents = useCallback(async (provider,etherEngine) => {
    if(!etherEngine) return;
    const currentBlock = await provider.getBlockNumber();
    const pastEvents = await etherEngine.queryFilter(
      "JobCompleted",
      currentBlock - 50,
      currentBlock
    );
    const pastEventsFailed = await etherEngine.queryFilter(
      "JobFailed",
      currentBlock - 50,
      currentBlock
    );
    const completedJobs = pastEvents.map(event => ({ id: event.args[0], result: event.args[1] }));
    const failedJobs = pastEventsFailed.map(event => ({ id: event.args[0] }));
    return({
      completed: completedJobs,
      failed: failedJobs
    })
  },[etherEngine])

  const subscribeToEvents = useCallback(async (jobsCompleted,setJobsCompleted,jobsFailed,setJobsFailed) => {
    etherEngine.on("JobCompleted", async (jobId, result) => {
      setJobsCompleted(jobsCompleted => [
        ...jobsCompleted,
        { id: jobId, result: result }
      ]);
    });

    etherEngine.on("JobFailed", async jobId => {
      setJobsFailed(jobsFailed => [
        ...jobsFailed,
        { id: jobId }
      ]);
    });
  },[etherEngine])

  const initiateContract = async (provider,netId) => {
    let newEtherEngine
    // Calibration
    if (netId === 314159) {
      newEtherEngine = new ethers.Contract(addresses.etherEngine.calibration, abis.etherEngine, provider);
    }
    setEtherEngine(newEtherEngine);

    fetchPastEvents(provider,newEtherEngine);
    return () => {
      newEtherEngine.removeAllListeners();
    };
  }

  const compute = async (specStr,provider) => {
    const signer = await provider.getSigner();
    // Hyperspace
    const priorityFee = (await provider.getFeeData()).maxPriorityFeePerGas;

    const etherEngineWithSinger = etherEngine.connect(signer);
    const tx = await etherEngineWithSinger.runJob(specStr,{
      value: ethers.parseEther("0.1"),
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
