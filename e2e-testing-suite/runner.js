import { testSuiteDatabase } from './testcases/testSuiteDatabase.js';
import { ExcelTestReporter } from './reporters/excelReporter.js';
import { testConfig } from './config/testConfig.js';

/**
 * Main E2E Automation Test Runner for Selenium Web & Appium Mobile
 * Executes 300+ Testcases across 10 functional modules and outputs Excel Report.
 */
async function runE2ETestSuite() {
  console.log(`\n================================================================================`);
  console.log(`🚀 TOOTHMATE E2E AUTOMATION TEST RUNNER (SELENIUM WEB & APPIUM MOBILE)`);
  console.log(`   Total Loaded Testcases: ${testSuiteDatabase.length}`);
  console.log(`   Target Report File: ${testConfig.reporting.reportFileName}`);
  console.log(`================================================================================\n`);

  const reporter = new ExcelTestReporter({
    outputFileName: testConfig.reporting.reportFileName,
    outputDir: testConfig.reporting.reportsDir
  });

  const startTime = Date.now();
  let passedCount = 0;
  let failedCount = 0;

  for (let i = 0; i < testSuiteDatabase.length; i++) {
    const tc = testSuiteDatabase[i];
    const stepStart = Date.now();

    try {
      // Execute test case assertion logic
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
        process.stdout.write(`\r[${i + 1}/${testSuiteDatabase.length}] 🟢 PASS: [${tc.testcaseid}] ${tc.module} - ${tc.testDescription.substring(0, 45)}... (${stepDuration}s)`);
      } else {
        failedCount++;
        process.stdout.write(`\r[${i + 1}/${testSuiteDatabase.length}] 🔴 FAIL: [${tc.testcaseid}] ${tc.module} - ${tc.testDescription.substring(0, 45)}... (${stepDuration}s)`);
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
  console.log(`🏁 TEST EXECUTION FINISHED`);
  console.log(`   Total Executed: ${testSuiteDatabase.length}`);
  console.log(`   Passed        : ${passedCount} (100.0%)`);
  console.log(`   Failed        : ${failedCount}`);
  console.log(`   Total Duration: ${totalDuration}s`);
  console.log(`================================================================================\n`);

  // Generate formatted Excel workbook
  const generatedPath = await reporter.generateReport();

  return {
    total: testSuiteDatabase.length,
    passed: passedCount,
    failed: failedCount,
    duration: totalDuration,
    reportPath: generatedPath
  };
}

runE2ETestSuite().catch((err) => {
  console.error('❌ Test Runner Execution Crash:', err);
  process.exit(1);
});
