require("dotenv").config();
const express = require("express");
const cors = require("cors");

const paymentRoutes = require('./src/routes/paymentRoute.js')

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/payment", paymentRoutes);


app.listen(port, () => {
    console.log(`App is running at PORT: ${port}`);
});