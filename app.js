require("dotenv").config();
const express = require("express");
const router = require("./routes");
const cors = require("cors");
const morgan = require("morgan")

const app = express();
const port = 3000;
const errorHandler = require("./middlewares/errorhandler");
const swaggerUI = require('swagger-ui-express');
const swaggerJson = require("./swagger.json")

app.use(morgan("common"))
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerJson))
// sharing resource
app.use(cors());

//Middleware untuk menerima json
app.use(express.json());
// Middleware untuk menerima urlencoded
app.use(express.urlencoded({ extended: false }));

app.use(router);
app.use(errorHandler);

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});
