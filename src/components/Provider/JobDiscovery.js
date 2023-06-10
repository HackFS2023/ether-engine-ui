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
        <div>
          {item.content}
          <button onClick={() => {
            setRespEvent(item);
            setCidResp(item.tags.find(tag => tag[0] === 'ipfs-hash')?.[1]);
            setModalOpenResp(true);
          }}>Send Script</button>
        </div>
        <div style={{ padding: '25px' }}>
          {eventsResponses?.filter(itemResp => itemResp.tags.find(tag => tag[0] === 'e' && tag[1] === item.id && tag[3] === "reply" && itemResp.pubkey === keys.pk))?.map(itemResp => {
            const dockerTag = itemResp.tags.find(tag => tag[0] === 'docker-spec');
            if (!dockerTag) return null;
            return (
              <Accordion key={itemResp.id}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <p>{itemResp.content}</p>
                </AccordionSummary>
                <AccordionDetails>
                <div style={{ display: "flex", flexDirection: "column", overflow: "auto", padding: "25px" }}>
                  <React.Fragment>
                    <label>Docker Spec:</label>
                    <div style={{ overflow: "auto" }}>{dockerTag[1]}</div>
                  </React.Fragment>
                </div>
                </AccordionDetails>
              </Accordion>
            );
          })}
        </div>
      </React.Fragment>
    ))
  );

  const renderModal = () => {
    return(
      <Modal
        isOpen={modalOpenResp}
        onRequestClose={() => setModalOpenResp(false)}
        contentLabel="Script Provider"
        style={{
          overlay: {
            backgroundColor: 'rgba(255, 255, 255, 0.75)',
          },
          content: {
            color: 'black',
          },
        }}
      >
        <h2>Submit Script</h2>
        <form onSubmit={handleSubmitResp}>
          <label>
            Docker Spec JSON:
            <input type="file" name="script" onChange={handleFileUpload} accept=".json" />
          </label>
          {spec && <div style={{ overflow: "auto" }}>{JSON.stringify(spec)}</div>}
          <button type="submit">Submit</button>
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
