import path from 'path';

export const appiumConfig = {
  hostname: '127.0.0.1',
  port: 4723,
  path: '/',
  capabilities: {
    platformName: 'Android',
    'appium:deviceName': '392e84d5',
    'appium:platformVersion': '14.0',
    'appium:automationName': 'UiAutomator2',
    'appium:appPackage': 'com.toothmate.app',
    'appium:appActivity': 'com.toothmate.app.MainActivity',
    'appium:noReset': true,
    'appium:newCommandTimeout': 3600
  },
  reporting: {
    reportTitle: 'Detailed Mobile Appium E2E Test Execution Logs',
    reportFileName: 'Mobile_Appium_E2E_Test_Execution_Report.xlsx',
    reportsDir: path.resolve(process.cwd(), 'reports')
  }
};
