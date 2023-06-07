import React, { useState,useEffect,useCallback } from 'react';

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

  return({
    client,
    store
  })

}
