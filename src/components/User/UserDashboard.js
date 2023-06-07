import React, { useState,useEffect } from 'react';
import Modal from 'react-modal';

import useWeb3Storage from '../../hooks/useWeb3Storage'
import useNostr from '../../hooks/useNostr';

// Make sure to bind modal to your appElement (http://reactcommunity.org/react-modal/accessibility/)
Modal.setAppElement('#root');

function Dashboard({ computations }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalOpenResp, setModalOpenResp] = useState(false);
  const [respEvent,setRespEvent] = useState();
  const [cidResp, setCidResp] = useState();

  const [script, setScript] = useState();

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
    const obj = {
      title: request.title,
      description: request.description
    }
    const blob = new Blob([JSON.stringify(obj)], { type: 'application/json' })
    const files = [new File([blob], 'request_info.json')]
    const cid = await store(files);
    alert(cid)
    await sendMessage(cid,request.title);

    setModalOpen(false); // close the modal after submitting
  };
  const handleSubmitResp = async (e) => {
    e.preventDefault();
    // Call the function to submit the job
    // submitJob(jobData);
    const blob = new Blob([script], { type: 'application/json' })
    const files = [new File([blob], 'script.json')]
    const cid = await store(files);
    alert(cid)
    await sendResponse(cid,respEvent.id,respEvent.pubkey,cidResp);

    setModalOpen(false); // close the modal after submitting
  };

  useEffect(() => {
    generateKeys();
  },[])


  return (
    <div>
      <h1>Dashboard</h1>
      <div>
        <h2>Requested Computations</h2>
        {/* Display requested computations */}
        {computations && computations.requested.map(comp => <div key={comp.id}>{comp.name}</div>)}
        {
          events?.map(item => {
            return(<p>{item.content} <button onClick={() => {
              setRespEvent(item);
              setCidResp(item.tags.filter(tag => {
                if(tag[0] === 'ipfs-hash'){
                  return(tag)
                }

              })[0][1]);
              setModalOpenResp(true)
            }
            }>Send Script</button></p>)
          })
        }
      </div>
      <div>
        <h2>Completed Computations</h2>
        {/* Display completed computations */}
        {computations && computations.completed.map(comp => <div key={comp.id}>{comp.name}</div>)}
        {
          eventsResponses?.map(item => {
            return(<p>{item.content}</p>)
          })
        }
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
            Script File:
            <input type="text" name="script" value={script} onChange={(e) => {setScript(e.target.value)}} />
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
