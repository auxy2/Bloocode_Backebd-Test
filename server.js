const express = require("express");
const mongoose = require("mongoose");
const bodyparser = require("body-parser");
const dotenv = require("dotenv");
const cors = require("cors");

const corsOptions = {
  origin: "*",
  methods: "*",
  allowedHeaders: "*",
};

const employeeRouter = require("./routes/employeeRoute");
const AppError = require("./utills/AppError");
const globalHerrorHandler = require("./controller/ErrorController");

const app = express();
const port = 8000;

dotenv.config({ path: "./config.env" });

const connectDB = async () => {
  console.log(process.env.DataBase_Url);
  try {
    const conn = await mongoose.connect(process.env.DataBase_Url, {
      family: 4,
      useNewUrlParser: true,
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.log(err.message);
    process.exit(1);
  }
};

app.use(cors());

app.use(express.json());

app.use(bodyparser.json());

app.use(bodyparser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.status(200).send("Welcome to my BLOOCDE TEST");
});

app.use("/Bloocode", employeeRouter);

app.all("*", (req, res, next) => {
  return next(
    new AppError(`cant find this ${req.originalUrl} on this server`, 404)
  );
});

app.use(globalHerrorHandler);

connectDB().then(() => {
  app.listen(port, () => {
    console.log(`App Runing on Port${port}`);
  });
});
