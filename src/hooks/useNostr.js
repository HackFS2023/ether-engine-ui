import React, { useState,useEffect,useCallback } from 'react';
import {
  nip19,
  generatePrivateKey,
  getPublicKey,
  SimplePool,
  getEventHash,
  getSignature,
  validateEvent,
  verifySignature,
} from 'nostr-tools'


export default function useNostr(){


  const [events,setEvents] = useState([]);
  const [keys,setKeys] = useState();
  const pool = new SimplePool()

  const relays = [
   'wss://eden.nostr.land',
   'wss://relay2.nostrchat.io',
   'wss://nostr.fmt.wiz.biz',
   'wss://relay.damus.io',
   'wss://nostr-pub.wellorder.net',
   'wss://relay.nostr.info',
   'wss://offchain.pub',
   'wss://nos.lol',
   'wss://brb.io',
   'wss://relay.snort.social',
   'wss://relay.current.fyi',
   'wss://nostr.relayer.se',
 ];



  const sub = pool.sub(
    relays,
    [
      {
        kinds: [42],
        '#e': ['08e076f673280b93475a8c53f3d17774cd351d192393be0b8f92d56093deb6e1'],
        '#t': ['hackfs2023'],
      }
    ]
  )

  sub.on('event', event => {
    // this will only be called once the first time the event is received
    event.tags.map(tag => {
      if(tag[0] === "ipfs-hash"){
        const newEvents = [...events,event];
        setEvents(newEvents);
      }
    })
  });

 // Use signature of known string to generate same sk with ethereum wallet;
 const generateKeys = async () => {

   let sk = localStorage.getItem('nostr-sk');
   if(!sk){
     sk = generatePrivateKey();
   }
   localStorage.setItem('nostr-sk',sk);
   let nsec = nip19.nsecEncode(sk)
   let {type, data} = nip19.decode(nsec);
   let pk = getPublicKey(sk)
   let npub = nip19.npubEncode(pk)
   const newKeys = {
     pk: pk,
     npub: npub,
     sk: sk
   };
   setKeys(newKeys);
   return({
     pk: pk,
     npub: npub,
     sk: sk
   });
 }



 const sendMessage = useCallback(async (cid,title) => {
   if(!keys) return
   const event = {
     kind: 42,
     pubkey: keys.pk,
     created_at: Math.floor(Date.now() / 1000),
     tags: [
       ['e','08e076f673280b93475a8c53f3d17774cd351d192393be0b8f92d56093deb6e1','wss://relay2.nostrchat.io','root'],
       ['t', 'hackfs2023'],
       ['ipfs-hash',cid]
     ],
     content: `New request at ${cid} : ${title}`
   }
   event.id = getEventHash(event)
   event.sig = getSignature(event, keys.sk);
   console.log(event)
   let pubs = pool.publish(relays, event)
   pubs.on('ok', (res) => {
     console.log(res);
   });
   pubs.on('failed', (relay,reason) => {
     //this.shooting = false;
     console.log(`failed to publish to ${relay} ${reason}`)
   })
 },[keys]);


 return({
   keys,
   generateKeys,
   sendMessage,
   events
 });
}
