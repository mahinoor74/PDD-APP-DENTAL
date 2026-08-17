/**
 * Test Execution Configuration for Selenium Web & Appium Mobile
 */

export const testConfig = {
  web: {
    baseUrl: process.env.BASE_URL || 'http://localhost:5173',
    browser: 'chrome',
    headless: true,
    implicitWait: 5000,
    pageLoadTimeout: 15000
  },
  mobile: {
    appiumHost: '127.0.0.1',
    appiumPort: 4723,
    platformName: 'Android',
    automationName: 'UiAutomator2',
    deviceName: 'Android Device (CPH2487)',
    appPackage: 'com.toothmate.app',
    appActivity: '.MainActivity'
  },
  reporting: {
    reportFileName: 'Web_Selenium_E2E_Test_Execution_Report.xlsx',
    reportsDir: './reports'
  }
};
