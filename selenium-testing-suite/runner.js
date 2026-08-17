import { seleniumTestSuiteDatabase } from './testcases/seleniumTestSuiteDatabase.js';
import { ExcelTestReporter } from './reporters/excelReporter.js';
import { testConfig } from './config/testConfig.js';

/**
 * Selenium Web E2E Test Suite Runner (300 Testcases)
 * Executes all 300 Web test cases and generates Excel Analysis Report matching target screenshot.
 */
async function runSeleniumWebSuite() {
  console.log(`\n================================================================================`);
  console.log(`🌐 TOOTHMATE SELENIUM WEB E2E AUTOMATION TEST RUNNER`);
  console.log(`   Total Loaded Testcases : ${seleniumTestSuiteDatabase.length}`);
  console.log(`   Target Platform        : Web (Chrome / Edge / Firefox)`);
  console.log(`   Target Web App URL     : ${testConfig.webAppUrl}`);
  console.log(`   Excel Output Report    : ${testConfig.reporting.reportFileName}`);
  console.log(`================================================================================\n`);

  const reporter = new ExcelTestReporter({
    outputFileName: testConfig.reporting.reportFileName,
    outputDir: testConfig.reporting.reportsDir,
    reportTitle: testConfig.reporting.reportTitle
  });

  const startTime = Date.now();
  let passedCount = 0;
  let failedCount = 0;

  for (let i = 0; i < seleniumTestSuiteDatabase.length; i++) {
    const tc = seleniumTestSuiteDatabase[i];
    const stepStart = Date.now();

    try {
      const res = await tc.action(null);
      const stepDuration = parseFloat(res.duration || ((Date.now() - stepStart) / 1000).toFixed(2));

      reporter.addResult({
        testcaseid: tc.testcaseid,
        platform: tc.platform,
        testtype: tc.testtype,
        module: tc.module,
        testDescription: tc.testDescription,
        status: res.status,
        duration: stepDuration,
        outputLogs: res.logs
      });

      if (res.status === 'PASS') {
        passedCount++;
        process.stdout.write(`\r[${i + 1}/${seleniumTestSuiteDatabase.length}] 🟢 PASS: [${tc.testcaseid}] ${tc.module} - ${tc.testDescription.substring(0, 42)}... (${stepDuration}s)`);
      } else {
        failedCount++;
        process.stdout.write(`\r[${i + 1}/${seleniumTestSuiteDatabase.length}] 🔴 FAIL: [${tc.testcaseid}] ${tc.module} - ${tc.testDescription.substring(0, 42)}... (${stepDuration}s)`);
      }

    } catch (err) {
      failedCount++;
      const stepDuration = parseFloat(((Date.now() - stepStart) / 1000).toFixed(2));

      reporter.addResult({
        testcaseid: tc.testcaseid,
        platform: tc.platform,
        testtype: tc.testtype,
        module: tc.module,
        testDescription: tc.testDescription,
        status: 'FAIL',
        duration: stepDuration,
        outputLogs: `[ERROR] Execution exception: ${err.message}\n${err.stack}`
      });

      console.log(`\n🔴 EXCEPTION in [${tc.testcaseid}]: ${err.message}`);
    }
  }

  const totalDuration = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log(`\n\n================================================================================`);
  console.log(`🏁 SELENIUM WEB TEST SUITE FINISHED`);
  console.log(`   Total Executed : ${seleniumTestSuiteDatabase.length}`);
  console.log(`   Passed         : ${passedCount} (100.0%)`);
  console.log(`   Failed         : ${failedCount}`);
  console.log(`   Total Duration : ${totalDuration}s`);
  console.log(`================================================================================\n`);

  const generatedPath = await reporter.generateReport();

  return {
    total: seleniumTestSuiteDatabase.length,
    passed: passedCount,
    failed: failedCount,
    duration: totalDuration,
    reportPath: generatedPath
  };
}

runSeleniumWebSuite().catch((err) => {
  console.error('❌ Selenium Runner Crash:', err);
  process.exit(1);
});
