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
  const [modalInputsOpen, setModalInputsOpen] = useState(false);

  const [respEvent,setRespEvent] = useState();
  const [cidResp, setCidResp] = useState();
  const [dockerSpec, setDockerSpec] = useState();
  const dockerSpecRef = useRef();
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
    dataRef.current = [];
    await sendMessage(cid,request.title + " " + request.description);

    setModalOpen(false); // close the modal after submitting
  };


  const handleSubmitCompute = async (e) => {
    e.preventDefault();
    alert(dockerSpec)
    await compute(dockerSpec,provider);
  }

  const handleReadDataRequest = (e) => {
    console.log(e.target.files);
    const files = e.target.files;
    dataRef.current = [];
    for(let file of files){
      const reader = new FileReader();
      reader.onload = async function(){
        const obj = {
          name: file.name,
          buffer: arrayBuffer
        }
        var arrayBuffer = reader.result;
        dataRef.current = [...dataRef.current,];
        console.log(arrayBuffer.byteLength);
        if(e.target.name === "changeSpec"){
          // submitJob(jobData);
          const buffer = obj.buffer;
          const name = obj.name;
          const files = [new File([buffer],name)];
          alert(dockerSpecRef.current)

          const cid = await store(files);
          let newSpec = JSON.parse(dockerSpecRef.current);
          newSpec.Docker.Entrypoint[2] = `/${name}`
          newSpec.inputs[0][`CID`] = cid;
          newSpec.inputs[0][`Name`] = `ipfs://${cid}`;
          newSpec.inputs[0][`path`] = `/${name}`;
          setDockerSpec(JSON.stringify(newSpec));


        }
      };
      reader.readAsArrayBuffer(file);
    }

  }

  useEffect(() => {
    dockerSpecRef.current = dockerSpec;
  },[dockerSpec])

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
                                  setDockerSpec(dockerTag[0][1]);
                                  setModalInputsOpen(true);
                                  //await compute(dockerTag[0][1],provider)
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
        isOpen={modalInputsOpen}
        onRequestClose={() => setModalInputsOpen(false)}
        contentLabel="Compute"
        style={{
          overlay: {
            backgroundColor: 'rgba(255, 255, 255, 0.75)', // Change this to the color of your webpage
          },
          content: {
            color: 'black', // Change this to the text color of your webpage
          },
        }}
      >
        <h2>Compute</h2>
        <form onSubmit={handleSubmitCompute}>
          <label>
            Docker Spec
          </label>
          <div style={{autoflow: "auto",padding: "5px"}}>
          {
            dockerSpec
          }
          </div>
          <label>
            Data (optional):
            <input type="file" name="changeSpec" onChange={handleReadDataRequest} />
          </label>

          {/* Add more input fields as necessary */}
          <button type="submit">Compute</button>
        </form>
        <button onClick={() => setModalInputsOpen(false)}>Close</button>
      </Modal>
    </div>
  );
}

export default Dashboard;
