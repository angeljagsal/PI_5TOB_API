const express = require("express");
const cors = require("cors");
const { driver } = require("./connection");

const app = express();
app.use(express.json());
app.use(cors());

const port = 3000;

app.listen(port, () => {
    console.log("Server running: http://localhost:" + port);
});
