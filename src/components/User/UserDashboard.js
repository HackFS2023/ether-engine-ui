import React, { useState, useEffect, useRef } from 'react';
import Modal from 'react-modal';
import useWeb3Storage from '../../hooks/useWeb3Storage';
import useNostr from '../../hooks/useNostr';
import useWeb3Modal from '../../hooks/useWeb3Modal';
import useEtherEngine from '../../hooks/useEtherEngine';

Modal.setAppElement('#root');

function Dashboard({ computations }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalInputsOpen, setModalInputsOpen] = useState(false);
  const [respEvent, setRespEvent] = useState();
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
    jobsCompleted, 
    jobsFailed,
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
    },
  });

  const [request, setRequest] = useState({
    title: '',
    description: ''
  });


  const handleChange = (e) => {
    setRequest({
      ...request,
      [e.target.name]: e.target.value
    })
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let files = [];
    for (let obj of dataRef.current) {
      files.push(new File([obj.buffer], obj.name));
    }
    const cid = await store(files);
    dataRef.current = [];
    await sendMessage(cid, request.title + " " + request.description);
    setModalOpen(false);
  };

  const handleSubmitCompute = async (e) => {
    e.preventDefault();
    await compute(dockerSpec, provider);
  }

  const handleReadDataRequest = (e) => {
    const files = e.target.files;
    dataRef.current = [];
    for (let file of files) {
      const reader = new FileReader();
      reader.onload = async function () {
        const obj = {
          name: file.name,
          buffer: arrayBuffer
        }
        var arrayBuffer = reader.result;
        dataRef.current = [...dataRef.current,];
        if (e.target.name === "changeSpec") {
          const buffer = obj.buffer;
          const name = obj.name;
          const files = [new File([buffer], name)];
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
  }, [dockerSpec])

  useEffect(() => {
    generateKeys();
  }, [])

  useEffect(() => {
    if (coinbase && provider && !etherEngine) {
      initiateContract(provider, netId);
    }
  }, [coinbase, provider, netId, etherEngine])

  const renderNewRequestModal = () => {
    return (
      <Modal
        isOpen={modalOpen}
        onRequestClose={() => setModalOpen(false)}
        contentLabel="New Request"
        style={{ overlay: { backgroundColor: 'rgba(255, 255, 255, 0.75)' }, content: { color: 'black' } }}
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
            <input type="file" name="script" onChange={(e) => { handleReadDataRequest(e) }} webkitdirectory directory multiple />
          </label>
          <button type="submit">Submit</button>
        </form>
        <button onClick={() => setModalOpen(false)}>Close</button>
      </Modal>
    )
  }

  const renderComputeModal = () => {
    return (
      <Modal
        isOpen={modalInputsOpen}
        onRequestClose={() => setModalInputsOpen(false)}
        contentLabel="Compute"
        style={{ overlay: { backgroundColor: 'rgba(255, 255, 255, 0.75)' }, content: { color: 'black' } }}
      >
        <h2>Compute</h2>
        <form onSubmit={handleSubmitCompute}>
          <label>Docker Spec:</label>
          <div style={{ autoflow: "auto", padding: "5px" }}>
            {dockerSpec}
          </div>
          <label>Data (optional):</label>
          <input type="file" name="changeSpec" onChange={handleReadDataRequest} />
          <button type="submit">Compute</button>
        </form>
        <button onClick={() => setModalInputsOpen(false)}>Close</button>
      </Modal>
    );
  }

  return (
    <div>
      <h1>Dashboard</h1>
      {!coinbase && !etherEngine &&
        <button onClick={async () => {
          try {
            await loadWeb3Modal();
          } catch (err) {
            console.log(err)
          }
        }}>Connect Wallet to Compute</button>
      }
      <div>
        <h2>Requested Computations</h2>
        {computations && computations.requested && computations.requested.map(comp => <div key={comp.id}>{comp.name}</div>)}
        {events && events.map(item => {
          if (item.tags.filter(tag => tag[0] === "pubkey" && tag[1] === keys.pk)) {
            return (
              <>
                <div>{item.content}</div>
                <div style={{ overflow: "auto", padding: "25px" }}>
                  {eventsResponses && eventsResponses.map(itemResp => {
                    if (itemResp.tags.filter(tag => tag[0] === 'e' && tag[1] === item.id && tag[3] === "reply")) {
                      const dockerTag = itemResp.tags.filter(tag => tag[0] === "docker-spec");
                      if (!dockerTag) return null;
                      return (
                        <>
                          <p>{itemResp.content}</p>
                          {etherEngine &&
                            <button onClick={async () => {
                              try {
                                setDockerSpec(dockerTag[0][1]);
                                setModalInputsOpen(true);
                              } catch (err) {
                                console.log(err)
                              }
                            }}>Compute</button>
                          }
                        </>
                      );
                    }
                  })}
                </div>
              </>
            );
          }
        })}
      </div>
      <div>
        <h2>Completed Computations</h2>
        {/* Display completed computations */}

        {
          jobsCompleted?.map(job => {
            return (<p><a href={`https://ipfs.io/ipfs/${job.result}`} target="_blank" rel="noreferrer" style={{textDecoration: "none"}}>{job.result}</a></p>);
          })
        }
        {
          jobsFailed?.map(job => {
            return (job.id);
          })
        }
      </div>
      <div>
        <h2>New Request</h2>
        <button onClick={() => setModalOpen(true)}>New Request</button>
      </div>
      {renderNewRequestModal()}
      {renderComputeModal()}
    </div>
  );
}

export default Dashboard;
