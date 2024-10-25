const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const indexRouter = require("./routes/index");
const app = express();

require("dotenv").config();

app.use(cors({
  origin: ['http://localhost:3000', 'https://shoppingmall-front.netlify.app'],
  credentials: true,
}));

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

app.use("/api", indexRouter);

const mongoURI = process.env.LOVAL_DB_ADDRESS;
mongoose
    .connect(mongoURI, {useNewUrlParser:true})
    .then(() => console.log("mongoose connected"))
    .catch((err) => console.log("DB Connection fail", err));

app.listen(process.env.PORT || 5000, ()=>{
    console.log("server on");
});