import React, { useState,useEffect,useRef } from 'react';
import Modal from 'react-modal';

import useWeb3Storage from '../../hooks/useWeb3Storage'
import useNostr from '../../hooks/useNostr';
import useWeb3Modal from '../../hooks/useWeb3Modal';
import useEtherEngine from '../../hooks/useEtherEngine';

// Make sure to bind modal to your appElement (http://reactcommunity.org/react-modal/accessibility/)
Modal.setAppElement('#root');

function Dashboard({ computations }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalOpenResp, setModalOpenResp] = useState(false);
  const [respEvent,setRespEvent] = useState();
  const [cidResp, setCidResp] = useState();
  const [script, setScript] = useState();

  const dataRef = useRef([]);

  const {
    client,
    store
  } = useWeb3Storage();
  const {
    keys,
    generateKeys,
    sendMessage,
    sendResponse,
    events,
    eventsResponses
  } = useNostr();

  const {
    coinbase,
    netId,
    provider,
    loadWeb3Modal
  } = useWeb3Modal();

  const {
    etherEngine,
    initiateContract,
    compute,
  } = useEtherEngine();

  const [jobData, setJobData] = useState({
    APIVersion: 'V1beta1',
    ClientID: '',
    Spec: {
      engine: '',
      verifier: '',
      publisher: '',
      docker: {
        image: '',
        entrypoint: [],
      },
      // Add the rest of the fields as necessary
    },
  });

  const [request,setRequest] = useState({
    title: '',
    description: ''
  });


  const handleChange = (e) => {
    // Update the jobData state with the new value
    /*
    setJobData({
      ...jobData,
      [e.target.name]: e.target.value,
    });
    */
    setRequest({
      ... request,
      [e.target.name] : e.target.value
    })
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Call the function to submit the job
    // submitJob(jobData);
    let files = [];
    for(let obj of dataRef.current){
      files.push(new File([obj.buffer],obj.name));
    }
    const cid = await store(files);
    alert(cid)
    await sendMessage(cid,request.title + " " + request.description);

    setModalOpen(false); // close the modal after submitting
  };
  const handleSubmitResp = async (e) => {
    e.preventDefault();
    // Call the function to submit the job
    // submitJob(jobData);

    await sendResponse(script,respEvent.id,respEvent.pubkey,cidResp);

    setModalOpen(false); // close the modal after submitting
  };

  useEffect(() => {
    generateKeys();
  },[])
  useEffect(() => {
    if(coinbase && provider && !etherEngine){
      initiateContract(provider,netId);
    }
  },[coinbase,provider,netId,etherEngine])

  return (
    <div>
      <h1>Dashboard</h1>

      {
        !coinbase && !etherEngine &&
        <button onClick={async () => {
          try{
            await loadWeb3Modal();
          } catch(err){
            console.log(err)
          }
        }}>Connect Wallet to Compute</button>
      }
      <div>
        <h2>Requested Computations</h2>
        {/* Display requested computations */}
        {computations && computations.requested.map(comp => <div key={comp.id}>{comp.name}</div>)}
        {
          events?.map(item => {
            if(item.tags.filter(tag => tag[0] === "pubkey" && tag[1] === keys.pk)){

              return(
                <>
                <div>{item.content}</div>
                <div style={{overflow: "auto",padding: "25px"}}>
                {
                  eventsResponses?.map(itemResp => {
                        if(itemResp.tags.filter(tag => tag[0] === 'e' && tag[1] === item.id && tag[3] === "reply")){
                          const dockerTag = itemResp.tags.filter(tag => tag[0] === "docker-spec");
                          if(!dockerTag) return
                          return (
                            <>
                            <p>{itemResp.content}</p>
                            <label>Docker Spec</label>
                            <div style={{overflow: "auto"}}>{dockerTag[0][1]}</div>
                            {
                              etherEngine &&
                              <button onClick={async () => {
                                try{

                                  await compute(dockerTag[0][1],provider)
                                } catch(err){
                                  console.log(err)
                                }
                              }}>Compute</button>
                            }
                            </>
                          );
                        }
                  })
                }
                </div>
                </>
              );
            }
          })
        }
      </div>
      <div>
        <h2>Completed Computations</h2>
        {/* Display completed computations */}
      </div>
      <div>
        <h2>New Request</h2>
        <button onClick={() => setModalOpen(true)}>New Request</button>
      </div>

      <Modal
        isOpen={modalOpen}
        onRequestClose={() => setModalOpen(false)}
        contentLabel="New Request"
        style={{
          overlay: {
            backgroundColor: 'rgba(255, 255, 255, 0.75)', // Change this to the color of your webpage
          },
          content: {
            color: 'black', // Change this to the text color of your webpage
          },
        }}
      >
        <h2>Create New Request</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Title
            <input type="text" name="title" value={request.title} onChange={handleChange} />
          </label>
          <label>
            Description:
            <input type="text" name="description" value={request.description} onChange={handleChange} />
          </label>
          <label>
            Data:
            <input type="file" name="script" onChange={(e) => {
              console.log(e.target.files);
              const files = e.target.files;
              for(let file of files){
                const reader = new FileReader();
                reader.onload = function(){
                  var arrayBuffer = reader.result;
                  dataRef.current = [...dataRef.current,{
                    name: file.name,
                    buffer: arrayBuffer
                  }];
                  console.log(arrayBuffer.byteLength);
                };
                reader.readAsArrayBuffer(file);
              }
            }}  webkitdirectory directory multiple/>
          </label>
          {/* Add more input fields as necessary */}
          <button type="submit">Submit</button>
        </form>
        <button onClick={() => setModalOpen(false)}>Close</button>
      </Modal>
      <Modal
        isOpen={modalOpenResp}
        onRequestClose={() => setModalOpenResp(false)}
        contentLabel="Script Provider"
        style={{
          overlay: {
            backgroundColor: 'rgba(255, 255, 255, 0.75)', // Change this to the color of your webpage
          },
          content: {
            color: 'black', // Change this to the text color of your webpage
          },
        }}
      >
        <h2>Submit Script</h2>
        <form onSubmit={handleSubmitResp}>
          <label>
            Docker Image URL:
            <input type="text" name="script" onChange={(e) => {setScript(e.target.value)}}/>
          </label>
          {/* Add more input fields as necessary */}
          <button type="submit">Submit</button>
        </form>
        <button onClick={() => setModalOpenResp(false)}>Close</button>
      </Modal>
    </div>
  );
}

export default Dashboard;
