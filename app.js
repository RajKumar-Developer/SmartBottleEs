const express = require("express");
var btSerial = new (require("bluetooth-serial-port").BluetoothSerialPort)();
const http = require("http");
const socketIO = require("socket.io");
const path = require("path");
// const noble = require("noble");
// const noble = require("noble-uwp");

const cors = require("cors");

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = socketIO(server);

const port = process.env.PORT || 3000;
// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));

// Connect to the Bluetooth module
btSerial.on("found", function (address, name) {
  if (name === "HC-05") {
    // Replace with your Bluetooth module name
    btSerial.findSerialPortChannel(address, function (channel) {
      btSerial.connect(
        address,
        channel,
        function () {
          console.log("Bluetooth connection established");

          btSerial.on("data", function (buffer) {
            const data = buffer.toString("utf-8").trim();
            // console.log(data);
            const waterLevel = parseFloat(data);
            //  console.log("Received water level:", waterLevel);

            // Emit the data to connected clients
            io.emit("waterLevel", waterLevel);
          });
        },
        function () {
          console.log("Cannot connect");
        }
      );

      // Close the connection when you're ready
      btSerial.close();
    });
  }
});
btSerial.inquire();
// Start the server
server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
