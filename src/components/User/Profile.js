import React, { useState, useEffect,useCallback } from 'react';
import { useAuth, useIsAuthenticated, usePolybase } from "@polybase/react";


import useWeb3Modal from '../../hooks/useWeb3Modal';
import useNostr from '../../hooks/useNostr';



const Profile = () => {


  const [convId,setConvId] = useState();

  const polybase = usePolybase();
  const { auth: polyAuth, state: polyState, loading: polyLoading } = useAuth();
  const [isLoggedIn, loading] = useIsAuthenticated();

  const {
    keys,
    generateKeys,
    loadKeys
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

  useEffect(() => {
    if (polyState && polyState.type === 'metamask'
     && !polyLoading) {
      console.log('loadKeys called');
      (async () => {
        await loadKeys(polybase, polyState.userId);
      })();
    }
  }, [polybase, polyState, polyLoading]);

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
            await polyAuth.signIn();
          } catch (err) {
            console.log(err)
          }
        }}>Connect Wallet to Show Info</button> :
        <div style={{ margin: '20px 0' }}>
          <h4>Wallet</h4>
          <p>Address: {coinbase}</p>
        </div>
      }
    </div>
  );


};

export default Profile;
