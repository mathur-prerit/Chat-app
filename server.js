const express = require("express");
const cors = require("cors");
const path = require("path");
const keyFiles = require("./config/keys.js");
const mongoose = require("mongoose");
const socketIo = require("socket.io");
const http= require("http")

const app = express();
const server = http.createServer(app);
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(__dirname+"/public"));

//Importing Routes
const users = require("./routes/Users.js");
const messages = require("./routes/Messages.js");
const { isObject } = require("util");

//App Routes
app.get("/", (req, res) => {
  res.send("Welcome to Chat Application");
});

app.use("/api/users", users);
app.use("/api/chats",messages)

//DB Configuration
const db = keyFiles.mongoURI;

//Connecting To DB
mongoose
  .connect(db, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
  })
  .then((res) => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err.message);
  });
mongoose.connection.on("error", (err) => {
  console.log(err.message);
});
mongoose.connection.on("disconnected", (err) => {
  console.log("DB disconnected");
});

//Socket Configuration
const io=socketIo(server)

// Port Configuration
const port = process.env.PORT || 8080;
server.listen(port,()=>{
  console.log(`Server running at ${port}`);
});

io.on('connection', (socket) => {
  console.log("connection established");

  socket.on('joining',({name,room},callback)=>{
    console.log(name,room)

    let error =true

    if(error){
      callback({error:"Connection error. Reload"})
    }
  })

  socket.on('disconnect', () => {
    console.log('connection disconnected')
  });
});



