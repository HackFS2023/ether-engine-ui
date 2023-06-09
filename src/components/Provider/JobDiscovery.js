import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import useNostr from '../../hooks/useNostr';

// Job Discovery Section
const JobDiscovery = () => {
  const {
    keys,
    generateKeys,
    sendMessage,
    sendResponse,
    events,
    eventsResponses
  } = useNostr();
  // Retrieve job list from API
  const [jobs, setJobs] = useState([]);

  const [modalOpenResp, setModalOpenResp] = useState(false);
  const [respEvent,setRespEvent] = useState();
  const [cidResp, setCidResp] = useState();
  const [spec, setSpec] = useState();

  useEffect(() => {
    // Fetch jobs from API
    // setJobs(response)
  }, []);
  useEffect(() => {
    generateKeys();
  },[])
  const handleSubmitResp = async (e) => {
    e.preventDefault();
    // Call the function to submit the job
    // submitJob(jobData);
    await sendResponse(spec,respEvent.id,respEvent.pubkey,cidResp);

    setModalOpenResp(false); // close the modal after submitting
  };

  return (
    <div>
      {/* Display jobs here */}
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
            Docker Spec JSON:
            <label>
              Data:
              <input type="file" name="script" onChange={(e) => {
                console.log(e.target.files);
                const files = e.target.files;
                for(let file of files){
                  const reader = new FileReader();
                  reader.onload = function(){
                    const newSpec = JSON.parse(reader.result).Job.Spec;
                    setSpec(newSpec);
                  };
                  reader.readAsText(file);
                }
              }} accept=".json"/>
            </label>
          </label>
          {/* Add more input fields as necessary */}
          {
            spec &&
            <div overflow="auto">{JSON.stringify(spec)}</div>
          }
          <button type="submit">Submit</button>
        </form>
        <button onClick={() => setModalOpenResp(false)}>Close</button>
      </Modal>
    </div>
  );
}

export default JobDiscovery;
