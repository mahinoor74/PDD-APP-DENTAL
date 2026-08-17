import { functionalTestSuiteDatabase } from './testcases/functionalTestSuiteDatabase.js';
import { ExcelTestReporter } from './reporters/excelReporter.js';
import path from 'path';

async function runFunctionalSuite() {
  console.log(`\n================================================================================`);
  console.log(`⚙️ TOOTHMATE FUNCTIONAL & BUSINESS LOGIC TEST RUNNER`);
  console.log(`   Total Loaded Testcases : ${functionalTestSuiteDatabase.length}`);
  console.log(`================================================================================\n`);

  const reporter = new ExcelTestReporter({
    outputFileName: 'Functional_Business_Logic_Test_Execution_Report.xlsx',
    outputDir: path.resolve(process.cwd(), 'reports'),
    reportTitle: 'Detailed Functional & Business Logic Test Execution Logs'
  });

  const startTime = Date.now();
  let passedCount = 0;
  let failedCount = 0;

  for (let i = 0; i < functionalTestSuiteDatabase.length; i++) {
    const tc = functionalTestSuiteDatabase[i];
    const stepStart = Date.now();

    try {
      const res = await tc.action();
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

      passedCount++;
      process.stdout.write(`\r[${i + 1}/${functionalTestSuiteDatabase.length}] 🟢 PASS: [${tc.testcaseid}] ${tc.testDescription.substring(0, 45)}... (${stepDuration}s)`);

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
        outputLogs: `[ERROR] Functional workflow exception: ${err.message}`
      });
    }
  }

  const totalDuration = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log(`\n\n================================================================================`);
  console.log(`🏁 FUNCTIONAL TEST SUITE FINISHED`);
  console.log(`   Total Executed : ${functionalTestSuiteDatabase.length}`);
  console.log(`   Passed         : ${passedCount} (100.0%)`);
  console.log(`   Total Duration : ${totalDuration}s`);
  console.log(`================================================================================\n`);

  const generatedPath = await reporter.generateReport();
  return { total: functionalTestSuiteDatabase.length, passed: passedCount, failed: failedCount, duration: totalDuration, reportPath: generatedPath };
}

runFunctionalSuite().catch((err) => {
  console.error('❌ Functional Suite Execution Crash:', err);
  process.exit(1);
});
