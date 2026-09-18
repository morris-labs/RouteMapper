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
  const status = err.status ?? err.statusCode ?? 500;
  const message = status >= 500 ? 'Internal server error' : err.message;
  res.status(status).json({ error: 'internal_error', message });
});

// nginx is the only thing that should reach this process; bind to loopback
// so a security group change or a second app on the box can't expose it.
app.listen(port, '127.0.0.1', () => {
  console.log(`RouteMapper server listening on http://127.0.0.1:${port}`);
});
