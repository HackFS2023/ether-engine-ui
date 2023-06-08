import React, { useState,useEffect,useCallback,useRef } from 'react';
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

  const version = 'hackfs2023-v1';
  const eventsRef = useRef([]);
  const [events,setEvents] = useState([]);
  const eventsRespRef = useRef([]);
  const [eventsResponses,setEventsResponses] = useState([]);
  const [keys,setKeys] = useState();
  const pool = new SimplePool()

  const relays = [
   'wss://eden.nostr.land',
   'wss://relay2.nostrchat.io',
   'wss://nostr.fmt.wiz.biz',
   'wss://relay.damus.io',
   'wss://relay.snort.social',
 ];



 useEffect(() => {
   const sub = pool.sub(
     relays,
     [
       {
         kinds: [42],
         '#t': [version],
       }
     ]
   )

   sub.on('event', event => {
     // this will only be called once the first time the event is received
     console.log((event))
     event.tags.map(tag => {
       if(tag[0] === "ipfs-hash"){
         eventsRef.current = [...eventsRef.current,event];
         setEvents(eventsRef.current);
       }
       if(tag[0] === "docker-hub-url"){
         eventsRespRef.current = [...eventsRespRef.current,event];
         setEventsResponses(eventsRespRef.current);
       }
     })
   });

 },[])

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
       ['e','aaae1107707fe85e56991fc1b690b52cb7104624ad4db66d8ded9b0bfe838cc2','','root'],
       ['t', version],
       ['ipfs-hash',cid],
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

 const sendResponse = useCallback(async (url,id,pubkey,cidDescription) => {
   if(!keys) return
   const event = {
     kind: 42,
     pubkey: keys.pk,
     created_at: Math.floor(Date.now() / 1000),
     tags: [
       ['e',id,'','root'],
       ['e', id, '', 'reply'],
       ['p',pubkey],
       ['t', version],
       ['docker-hub-url',url]
     ],
     content: `Script at ${url} for request for data at ${cidDescription}`
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
   sendResponse,
   events,
   eventsResponses
 });
}
