import app from './app';

const PORT = parseInt(process.env.API_PORT || '3000', 10);

app.listen(PORT, () => {
  console.log(`[server] Vibe Money Book API running on http://localhost:${PORT}`);
  console.log(`[server] Environment: ${process.env.NODE_ENV || 'development'}`);
});
