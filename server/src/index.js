import express from 'express';
import cors from 'cors';
import healthRouter from './routes/health.js';
import autocompleteRouter from './routes/autocomplete.js';
import routeRouter from './routes/route.js';

const app = express();
const port = Number(process.env.PORT) || 3001;

if (!process.env.GOOGLE_SERVER_KEY) {
  console.error('GOOGLE_SERVER_KEY is not set. Add it to server/.env.');
  process.exit(1);
}

app.use(cors());
app.use(express.json());

app.use('/api/health', healthRouter);
app.use('/api/autocomplete', autocompleteRouter);
app.use('/api/route', routeRouter);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'internal_error', message: err.message });
});

app.listen(port, () => {
  console.log(`RouteMapper server listening on http://localhost:${port}`);
});
