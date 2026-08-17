import path from 'path';

export const testConfig = {
  webAppUrl: 'http://localhost:5173',
  browser: 'chrome',
  headless: false,
  implicitWaitMs: 10000,
  reporting: {
    reportTitle: 'Detailed Web Selenium E2E Test Execution Logs',
    reportFileName: 'Web_Selenium_E2E_Test_Execution_Report.xlsx',
    reportsDir: path.resolve(process.cwd(), 'reports')
  }
};
