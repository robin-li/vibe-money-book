import app from './app';
import { initI18n } from './i18n';

const PORT = parseInt(process.env.API_PORT || '3000', 10);

async function start() {
  await initI18n();
  app.listen(PORT, () => {
    console.log(`[server] Vibe Money Book API running on http://localhost:${PORT}`);
    console.log(`[server] Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

start().catch((err) => {
  console.error('[server] Failed to start:', err);
  process.exit(1);
});
