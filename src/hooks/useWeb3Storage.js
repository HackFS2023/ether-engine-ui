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
    console.log(res)
    const files = await res.files(); // Web3File[]
    let promises = [];
    for (const file of files) {
      new Promise((resolve,reject) => {
        console.log(`${file.cid} ${file.name} ${file.size}`);
        const url = window.URL.createObjectURL(file);
        const link = document.createElement('a');
        link.href = url;
        link.download = file.name;
        // Click the link to trigger the download
        link.click();
        // Clean up by revoking the URL
        window.URL.revokeObjectURL(url);
        resolve();

      })
    }
    await Promise.all(promises);
  },[client])

  return({
    client,
    store,
    get
  })

}
