import { useState,useEffect,useCallback } from 'react';

import { Web3Storage } from 'web3.storage'


export default function useWeb3Storage(){

  const [client,setClient] = useState();

  useEffect(() => {
    const newClient = new Web3Storage({ token: process.env.REACT_APP_WEB3_STORAGE });
    setClient(newClient);
  },[]);

  const store = useCallback(async (files) => {
    const cid = await client.put(files)
    console.log('stored files with cid:', cid)
    return cid
  },[client]);

  const get = useCallback(async (cid) => {
    const res = await client.get(cid); // Web3Response
    const files = await res.files(); // Web3File[]
    for (const file of files) {
      console.log(`${file.cid} ${file.name} ${file.size}`);
    }
  },[client])

  return({
    client,
    store,
    get
  })

}
