import React, { useState, useEffect, useRef, useMemo } from 'react';
import Modal from 'react-modal';
import useWeb3Storage from '../../hooks/useWeb3Storage';
import useNostr from '../../hooks/useNostr';
import useWeb3Modal from '../../hooks/useWeb3Modal';
import useEtherEngine from '../../hooks/useEtherEngine';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  List,
  ListItem,
  ListItemText,
  Paper,
  TextField,
  Typography,
  Link,
  Accordion, AccordionSummary, AccordionDetails
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { makeStyles } from '@material-ui/core/styles';


// Material UI styles
const useStyles = makeStyles((theme) => ({
  root: {
    '& > *': {
      margin: theme.spacing(1),
    },
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
}));


const dialogStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    overflow: 'auto',
    maxHeight: '70%',
    maxWidth: '80%',
  }
};



Modal.setAppElement('#root');


function Dashboard({ computations }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalInputsOpen, setModalInputsOpen] = useState(false);
  const [respEvent, setRespEvent] = useState();
  const [cidResp, setCidResp] = useState();
  const [dockerSpec, setDockerSpec] = useState();
  const dockerSpecRef = useRef();
  const dataRef = useRef([]);

  const [jobsCompleted,setJobsCompleted] = useState([]);
  const [jobsFailed,setJobsFailed] = useState([]);

  const classes = useStyles();


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
        dataRef.current = [...dataRef.current,arrayBuffer];
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

  useMemo(async () => {
    if(etherEngine && provider){
      const currentBlock = await provider.getBlockNumber();
      const pastEvents = await etherEngine.queryFilter(
        "JobCompleted",
        currentBlock - 300,
        currentBlock
      );
      const pastEventsFailed = await etherEngine.queryFilter(
        "JobFailed",
        currentBlock - 300,
        currentBlock
      );
      const newCompletedJobs = pastEvents.map(event => ({ id: event.args[0], result: event.args[1] }));
      const newFailedJobs = pastEventsFailed.map(event => ({ id: event.args[0] }));
      setJobsCompleted(newCompletedJobs)

      etherEngine.on("JobCompleted", async (jobId, result) => {
        setJobsCompleted([
          ...jobsCompleted,
          { id: jobId, result: result }
        ]);
      });

      etherEngine.on("JobFailed", async jobId => {
        setJobsFailed(jobsFailed => [
          ...jobsFailed,
          { id: jobId }
        ]);
      });
    }
  },[etherEngine,provider])

  const renderNewRequestModal = () => {
    return (
      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        scroll="paper"
        aria-labelledby="scroll-dialog-title"
        aria-describedby="scroll-dialog-description"
        fullWidth={true}
        maxWidth="md"
        style={dialogStyles}
      >
        <DialogTitle id="scroll-dialog-title">Create New Request</DialogTitle>
        <DialogContent dividers={true}>
          <form onSubmit={handleSubmit}>
            <TextField label="Title" name="title" value={request.title} onChange={handleChange} fullWidth />
            <TextField label="Description" name="description" value={request.description} onChange={handleChange} fullWidth />
            <input type="file" name="script" onChange={(e) => { handleReadDataRequest(e) }} webkitdirectory directory multiple />
            <Button type="submit" color="primary">Submit</Button>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalOpen(false)} color="secondary">Close</Button>
        </DialogActions>
      </Dialog>
    )
  }

  const renderComputeModal = () => {
    return (
      <Dialog
        open={modalInputsOpen}
        onClose={() => setModalInputsOpen(false)}
        scroll="paper"
        aria-labelledby="scroll-dialog-title"
        aria-describedby="scroll-dialog-description"
        fullWidth={true}
        maxWidth="md"
        style={dialogStyles}
      >
        <DialogTitle id="scroll-dialog-title">Compute</DialogTitle>
        <DialogContent dividers={true}>
          <form onSubmit={handleSubmitCompute}>
            <TextField label="Docker Spec" value={dockerSpec} fullWidth disabled multiline />
            <input type="file" name="changeSpec" onChange={handleReadDataRequest} />
            <Button type="submit" color="primary">Compute</Button>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalInputsOpen(false)} color="secondary">Close</Button>
        </DialogActions>
      </Dialog>
    );
  }
  return (
    <Container maxWidth="md" style={{ marginTop: "20px" }}>
      <Typography variant="h2" align="center">
        Dashboard
      </Typography>
      <Button
      variant="contained"
      color="primary"
      onClick={() => setModalOpen(true)}
    >
      Create New Request
    </Button>
      <Grid container spacing={3} style={{ marginTop: "20px" }}>
        <Grid item xs={12}>
          {!coinbase && !etherEngine &&
            <Button
              variant="contained"
              color="primary"
              onClick={async () => {
                try {
                  await loadWeb3Modal();
                } catch (err) {
                  console.log(err)
                }
              }}
            >
              Connect Wallet to Compute
            </Button>
          }
        </Grid>

        <Grid container item spacing={2} xs={12}>
          <Grid item md={6} xs={12}>
            <Paper style={{ height: '50vh', overflow: 'auto' }}>
              <Typography variant="h4" align="center">
                Requested Computations
              </Typography>
              {events && events.map(renderEvent)}
            </Paper>
          </Grid>

          <Grid item md={6} xs={12}>
            <Paper style={{ height: '50vh', overflow: 'auto' }}>
              <Typography variant="h4" align="center">
                Completed Computations
              </Typography>
              <List>
                {
                  jobsCompleted?.map(job => {
                    return (
                      <ListItem>
                        <ListItemText>
                          <Link href={`https://ipfs.io/ipfs/${job.result}`} target="_blank" rel="noreferrer">
                            {job.result}
                          </Link>
                        </ListItemText>
                      </ListItem>
                    );
                  })
                }
                {
                  jobsFailed?.map(job => {
                    return (
                      <ListItem>
                        <ListItemText>
                          {job.id}
                        </ListItemText>
                      </ListItem>
                    );
                  })
                }
              </List>
            </Paper>
          </Grid>
        </Grid>
      </Grid>
      <div>
      {events && events.map(item => {
        if (item.pubkey === keys.pk) {
          return (
            <>
              <div>{item.content}</div>
              <div style={{ overflow: "auto", padding: "25px" }}>
                {eventsResponses && eventsResponses.map(itemResp => {
                  if (itemResp.tags.filter(tag => tag[0] === 'e' && tag[1] === item.id && tag[3] === "reply")[0]) {
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
      {renderNewRequestModal()}
      {renderComputeModal()}
    </Container>
  );




  function renderEvent(item) {
    if (item.pubkey === keys.pk) {
        const contentArr = item.content.split(' : ');
        const title = contentArr[0];
        const description = contentArr[1];

        return (
            <Card style={{ marginBottom: '10px' }}>
                <CardHeader title={title} />
                <CardContent>
                    <Typography variant="body2" color="textSecondary" component="p">{description}</Typography>


                      {eventsResponses && eventsResponses.map(itemResp => {
                        if (itemResp.tags.filter(tag => tag[0] === 'e' && tag[1] === item.id && tag[3] === "reply")[0]) {
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
                </CardContent>
            </Card>
        );
    }
}


}

export default Dashboard;
