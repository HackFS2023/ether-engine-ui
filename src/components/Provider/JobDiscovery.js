import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import useNostr from '../../hooks/useNostr';
import { Accordion, AccordionSummary, AccordionDetails } from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

const JobDiscovery = () => {
  const { keys, generateKeys, sendMessage, sendResponse, events, eventsResponses } = useNostr();
  const [modalOpenResp, setModalOpenResp] = useState(false);
  const [respEvent, setRespEvent] = useState();
  const [cidResp, setCidResp] = useState();
  const [spec, setSpec] = useState();





  const [dockerImage, setDockerImage] = useState('');
  const [dockerEntrypoint, setDockerEntrypoint] = useState('');

  const [specCIDInput, setSpecCIDInput] = useState('');


  const [specPathInput, setSpecPathInput] = useState('');


  const [creatingDockerSpec, setCreatingDockerSpec] = useState(false);

// This is the style for the modal you may want to customize.
const modalStyle = {
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
  },
  content: {
    color: 'white',
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: '#282c34',
    border: 'none',
    borderRadius: '10px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
};


  const handleImageChange = (event) => {
    setDockerImage(event.target.value);
  }

  const handleEntrypointChange = (event) => {
    setDockerEntrypoint(event.target.value);
  }


  const handleCIDChange = (event) => {
    setSpecCIDInput(event.target.value);
  }

  const handlePathInputChange = (event) => {
    setSpecPathInput(event.target.value);
  }

  const handleUseSpec = () => {
    // Build the Docker spec object
    const newSpec = {
      "Engine":"Docker",
      "Verifier":"Noop",
      "Publisher":"Estuary",
      "PublisherSpec":{
        "Type":"Estuary"
      },
      "Docker":{
        "Image": dockerImage,
        "Entrypoint": dockerEntrypoint.split(','), // assuming the entrypoints are comma-separated
      },
      "Language":{"JobContext":{}},
      "Wasm":{"EntryModule":{}},
      "Resources":{"GPU":""},
      "Network":{"Type":"None"},
      "Timeout":1800,
      "inputs":[{
        "StorageSource":"IPFS",
        "Name":`ipfs://${specCIDInput}`,
        "CID":specCIDInput,
        "path":specPathInput
      }],
      "outputs":[{
        "StorageSource":"IPFS",
        "Name":"outputs",
        "path":"/outputs"
      }],
      "Deal":{"Concurrency":1}
    };


    setSpec(newSpec); // Update the spec state variable with the created spec

    // Toggle back to the form
    setCreatingDockerSpec(false);
  }

  useEffect(() => {
    generateKeys();
  }, []);

  const handleSubmitResp = async (e) => {
    e.preventDefault();
    await sendResponse(spec, respEvent.id, respEvent.pubkey, cidResp);
    setModalOpenResp(false);
  };

  const handleFileUpload = (e) => {
    const files = e.target.files;
    for (let file of files) {
      const reader = new FileReader();
      reader.onload = function() {
        try {
          const { Job } = JSON.parse(reader.result);
          setSpec(Job.Spec);
        } catch (err) {
          console.error(err);
        }
      };
      reader.readAsText(file);
    }
  }
  const renderJobs = () => (
    events?.map(item => (
      <React.Fragment key={item.id}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          margin: '20px',
          padding: '20px',
          boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2)',
          borderRadius: '5px',
          backgroundColor: 'white',
          color: 'black',
          width: '50%',
          overflow: 'auto',
          alignSelf: 'center'
        }}>
          {item.content}
          <button onClick={() => {
            setRespEvent(item);
            setCidResp(item.tags.find(tag => tag[0] === 'ipfs-hash')?.[1]);
            setModalOpenResp(true);
          }}>Send Script</button>
        </div>

          {eventsResponses?.filter(itemResp => itemResp.tags.find(tag => tag[0] === 'e' && tag[1] === item.id && tag[3] === "reply" && itemResp.pubkey === keys.pk))?.map(itemResp => {
            const dockerTag = itemResp.tags.find(tag => tag[0] === 'docker-spec');
            if (!dockerTag) return null;
            return (
              <Accordion key={itemResp.id} style={{
                  width: '80%',
                  margin: '20px'
              }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <p>{itemResp.content}</p>
                </AccordionSummary>
                <AccordionDetails>
                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  overflow: "auto",
                  padding: "25px",
                  boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2)',
                  borderRadius: '5px',
                  backgroundColor: 'white',
                  color: 'black',
                  width: '50%',
                  overflow: 'auto',
                  alignSelf: 'center'
                }}>

                  <React.Fragment>
                    <label>Docker Spec:</label>
                    <div style={{ overflow: "auto" }}>{dockerTag[1]}</div>
                  </React.Fragment>
                </div>
                </AccordionDetails>
              </Accordion>
            );
          })}
      </React.Fragment>
    ))
  );


  const renderModal = () => {
    if (creatingDockerSpec) {
      return (
        <Modal isOpen={modalOpenResp} onRequestClose={() => setModalOpenResp(false)} contentLabel="Create Docker Spec" style={modalStyle}>
          <h2>Create Docker Spec</h2>
          <label>
            Docker Image:
            <input type="text" onChange={handleImageChange} value={dockerImage} style={{ width: '100%', marginBottom: '10px' }} />
          </label>
          <label>
            Spec DATA path:
            <input type="text" onChange={handlePathInputChange} value={specPathInput} style={{ width: '100%', marginBottom: '10px' }} />
          </label>
          <label>
            Spec CID path:
            <input type="text" onChange={handleCIDChange} value={specCIDInput} style={{ width: '100%', marginBottom: '10px' }} />
          </label>
          <label>
            Docker Entrypoint (comma-separated):
            <input type="text" onChange={handleEntrypointChange} value={dockerEntrypoint} style={{ width: '100%', marginBottom: '10px' }} />
          </label>
          <button onClick={handleUseSpec}>Use Spec</button>
          <button onClick={() => setCreatingDockerSpec(false)}>Cancel</button>
        </Modal>
      );
    }

    return (
      <Modal isOpen={modalOpenResp} onRequestClose={() => setModalOpenResp(false)} contentLabel="Script Provider" style={modalStyle}>
        <h2>Submit Script</h2>
        <button onClick={() => setCreatingDockerSpec(true)}>Create Docker spec</button>
        <form onSubmit={handleSubmitResp}>
          <label>
            Docker Spec JSON:
            <input type="file" name="script" onChange={handleFileUpload} accept=".json" />
          </label>
          {spec && <div style={{ overflow: "auto", marginTop: '10px', marginBottom: '10px' }}>{JSON.stringify(spec)}</div>}
          <button type="submit" style={{marginRight: '10px'}}>Submit</button>
        </form>
        <button onClick={() => setModalOpenResp(false)}>Close</button>
      </Modal>
    );
  };


  return (
    <div>
      {renderJobs()}
      {renderModal()}
    </div>
  );
};

export default JobDiscovery;
