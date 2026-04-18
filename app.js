const express = require('express');
const app = express();
require('dotenv').config();

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./src/swagger');
const clientsRoutes = require('./src/routes/clients');
const accountsRoutes = require('./src/routes/accounts');
const transactionsRoutes = require('./src/routes/transactions');
const { errorHandler } = require('./src/middleware/validate');

const port = process.env.PORT || 3000;

app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
app.use('/api/v1/clients', clientsRoutes);
app.use('/api/v1/comptes', accountsRoutes);
app.use('/api/v1/transactions', transactionsRoutes);

app.get('/', (req, res) => res.json({ service: 'tp304 API', status: 'ok' }));

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
  console.log(`Swagger docs available at http://localhost:${port}/api-docs`);
});