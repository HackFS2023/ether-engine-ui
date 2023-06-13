import React, { useState, useEffect,useCallback } from 'react';

import useWeb3Modal from '../../hooks/useWeb3Modal';
import useNostr from '../../hooks/useNostr';
/** Import Orbis SDK */
import { Orbis } from "@orbisclub/orbis-sdk";

/** Initialize the Orbis class object */
const orbis = new Orbis();


const Profile = () => {


  const [convId,setConvId] = useState();

  const {
    keys,
    generateKeys
  } = useNostr();

  const {
    coinbase,
    netId,
    provider,
    loadWeb3Modal
  } = useWeb3Modal();

  useEffect(() => {
    generateKeys();
  }, [])

  const saveNostrKeys = useCallback(async() => {
    const res = await orbis.connect({
      provider: window.ethereum,
      lit: true
    });
    //await orbis.connectLit(window.ethereum);
    console.log(res);
    let { data, error } = await orbis.getConversations({
      did: res.did,
      context: "nostr-keys"
    });
    console.log(data);
    let conversationId;
    if(data?.length === 0){
      const resConversation = await orbis.createConversation({
        recipients: [res.did],
        name: "hackfs2023",
        description: "Save nostr keys using orbis",
        context: "nostr-keys"
      });
      conversationId = resConversation.doc;
    } else {
      conversationId = data[0].stream_id
    }
    const dataMsg = await orbis.getMessages(conversationId);
    let resMessage = dataMsg.data;
    console.log(resMessage);
    await orbis.isConnected();
//    if(resMessage.length === 0){
      let resMessageSend = await orbis.sendMessage({
        conversation_id: conversationId,
        body: JSON.stringify(keys)
      });
      const dataMsgs = await orbis.getMessages(conversationId);
      resMessage = dataMsgs.data;
//    }
    setConvId(conversationId)
  },[keys])

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'Arial, sans-serif', color: 'white' }}>
      <h2 style={{ borderBottom: '1px solid #ddd' }}>Profile</h2>
      <div style={{ margin: '20px 0' }}>
        <h4>Nostr Key</h4>
        <p>public key: {keys?.pk}</p>
        <p>npub: {keys?.npub}</p>
        <p>sk: {keys?.sk}</p>
        <p style={{ fontSize: '0.8em' }}>
          <small>Use your SK to import profile at any nostr client</small>
        </p>
        <p style={{ fontSize: '0.8em' }}>
          <small>Some Nostr Clients: <a href="https://snort.social/" target="_blank" style={{ color: '#1678c2' }}>Snort Social</a>,<a href="https://iris.to/" target="_blank" style={{ color: '#1678c2' }}>Iris</a>,<a href="https://www.nostrchat.io/channel/aaae1107707fe85e56991fc1b690b52cb7104624ad4db66d8ded9b0bfe838cc2" target="blank" style={{ color: '#1678c2' }}>Nostr Chat</a></small>
        </p>
      </div>
      {
        !coinbase ?
        <button style={{ padding: '10px 20px', backgroundColor: '#1678c2', color: 'white', border: 'none', borderRadius: '5px' }} onClick={async () => {
          try {
            await loadWeb3Modal();
          } catch (err) {
            console.log(err)
          }
        }}>Connect Wallet to Show Info</button> :
        <div style={{ margin: '20px 0' }}>
          <h4>Wallet</h4>
          <p>Address: {coinbase}</p>
          <button style={{ padding: '10px 20px', backgroundColor: '#1678c2', color: 'white', border: 'none', borderRadius: '5px' }} onClick={saveNostrKeys}>Save NOSTR private key using Orbis</button>
          <p style={{ fontSize: '0.8em' }}>
            <small>Orbis encrypted messages: <a href="https://docs.useorbis.com/sdk/methods/conversations/createConversation" target="_blank" style={{ color: '#1678c2' }}>Orbis SDK</a> private message</small>
          </p>
          {
            convId &&
            <p>Check private message at <a href={`https://app.orbis.club/messages/${convId}`} target="_blank" style={{ color: '#1678c2' }}>Orbis Club</a> and stream at <a href={`https://cerscan.com/mainnet/stream/${convId}`} target="_blank" style={{ color: '#1678c2' }}>Cerscan</a></p>
          }
        </div>
      }
    </div>
  );
  
  
};

export default Profile;
