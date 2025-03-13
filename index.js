require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const { userRouter } = require("./routes/user");

const app = express();

mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log("CONNECTED TO MONGO"))
    .catch(err => console.error("MONGO CONNECTION ERROR:", err));

app.use(express.json());
app.use("/api/user",userRouter);

app.listen(3000);