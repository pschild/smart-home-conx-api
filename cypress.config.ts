import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    reporter: 'junit',
    reporterOptions: {
      toConsole: true,
    },
    screenshotOnRunFailure: false,
  },
});
