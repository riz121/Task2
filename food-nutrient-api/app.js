require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const foodsRouter = require('./src/routes/food');
const FileRouter = require('./src/routes/import');

//const swaggerUi = require('swagger-ui-express');
//const swaggerSpec = require('./swagger');

const app = express();
const PORT = process.env.PORT || 5000;

// middlewares
app.use(cors());
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));

// routes
app.use('/foods', foodsRouter);
app.use('/file',FileRouter)
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// swagger
//app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Connect to MongoDB and start
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/fooddb';
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB:', MONGO_URI);
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('Mongo connection error', err);
    process.exit(1);
  });

module.exports = app;
