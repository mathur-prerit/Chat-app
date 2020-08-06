import React, { useState, useEffect, useRef, useMemo } from "react";
import Webcam from "react-webcam";
import io from "socket.io-client";
import queryString from "query-string";
import { ENDPOINT } from "../../config/config.js";
import PhotoCamera from "@material-ui/icons/PhotoCamera";
import CallIcon from "@material-ui/icons/Call";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import IconButton from "@material-ui/core/IconButton";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";

let socket;
const VideoCall = (props) => {
  const [calling, setCalling] = useState(false);
  const webcamRef = useRef(null);
  const incomingVideoRef = useRef(null);
  const [cameraFace, setCameraFace] = useState("user");
  const [hasCamera, setHasCamera] = useState(true);
  const [open, setOpen] = useState(true);
  const [callUsers, setCallUsers] = useState({
    caller: "",
    receiver: "",
  });

  const query = queryString.parse(props.location.search);
  useEffect(() => {
    socket = io(process.env.baseURL || ENDPOINT);
    setCallUsers({ ...callUsers, caller: query.user });
  }, []);

  const changeCamera = (e) => {
    e.preventDefault();
    if (cameraFace !== "user") {
      setCameraFace("user");
    } else if (cameraFace !== "environment") {
      setCameraFace("environment");
    }
  };
  const noCameraFound = (e) => {
    e.preventDefault();
    setHasCamera(false);
  };

  const handleClickOpen = (e) => {
    e.preventDefault();
    setOpen(true);
  };

  const handleClose = (e) => {
    e.preventDefault();
    setOpen(false);
  };

  const connectCall = (e) => {
    setCalling(true);
    setOpen(false);
  };

  const callUser = () => {
    if (calling) {
      // incomingVideoRef.current.srcObject = new MediaStream(
      //   webcamRef.current.stream);
      console.log(new MediaStream(
          webcamRef.current.stream))
      let data = {
        users: callUsers,
        socket: socket.id,
        stream: new MediaStream(webcamRef.current.stream),
      };
      socket.emit("calling", data, () => {
        console.log("video sent");
      });
    }
  };

  useMemo(() => {
    return callUser();
  }, [calling, incomingVideoRef, webcamRef, cameraFace]);

  // useEffect(() => {
  //   socket.on("receiveCall", (data) => {
  //     incomingVideoRef.current.srcObject=data
  //   });
  // }, []);

  // const disconnectCall = React.useCallback(() => {
  //   mediaRecorderRef.current.stop();
  //   setCalling(false);
  // }, [mediaRecorderRef, webcamRef, setCalling]);

  const videoConstraints = {
    // width: 1280,
    // height: 720,
    facingMode: cameraFace,
  };

  const dialogBox = (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="form-dialog-title"
    >
      <DialogTitle id="form-dialog-title">User Name</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Enter the user name you want to connect
        </DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          id="name"
          label="User Name"
          value={callUsers.receiver}
          fullWidth
          onChange={(e) => {
            setCallUsers({ ...callUsers, receiver: e.target.value });
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Cancel
        </Button>
        <Button onClick={connectCall} color="secondary">
          Call
        </Button>
      </DialogActions>
    </Dialog>
  );

  if (hasCamera) {
    return (
      <div>
        <Webcam
          audio={true}
          mirrored={true}
          onUserMediaError={noCameraFound}
          forceScreenshotSourceSize={true}
          videoConstraints={videoConstraints}
          ref={webcamRef}
        />
        <IconButton
          color="primary"
          aria-label="switch camera"
          onClick={changeCamera}
        >
          <PhotoCamera />
        </IconButton>
        <IconButton
          color="secondary"
          aria-label="call"
          onClick={handleClickOpen}
        >
          <CallIcon />
        </IconButton>
        {dialogBox}
        <video ref={incomingVideoRef} autoPlay></video>
      </div>
    );
  } else {
    return <div>No camera Found</div>;
  }
};

export default VideoCall;
