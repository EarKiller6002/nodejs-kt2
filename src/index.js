const express = require('express');
const path = require('path');
const config = require('./config');
const logger = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');
const productRoutes = require('./routes/products');

const app = express();

app.use(express.json());

app.use(logger);

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/products', productRoutes);

app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`Сервер запущен на порту ${config.port} в режиме ${config.env}`);
});
