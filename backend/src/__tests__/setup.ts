import { initI18n } from '../i18n';

// Initialize i18n before all tests
const setup = async () => {
  await initI18n();
};

void setup();
