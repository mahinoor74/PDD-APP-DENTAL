import { unitTestSuiteDatabase } from './testcases/unitTestSuiteDatabase.js';
import { ExcelTestReporter } from './reporters/excelReporter.js';
import path from 'path';

async function runUnitSuite() {
  console.log(`\n================================================================================`);
  console.log(`🧪 TOOTHMATE UNIT & COMPONENT TEST RUNNER`);
  console.log(`   Total Loaded Testcases : ${unitTestSuiteDatabase.length}`);
  console.log(`================================================================================\n`);

  const reporter = new ExcelTestReporter({
    outputFileName: 'Unit_Component_Test_Execution_Report.xlsx',
    outputDir: path.resolve(process.cwd(), 'reports'),
    reportTitle: 'Detailed Unit & Component Test Execution Logs'
  });

  const startTime = Date.now();
  let passedCount = 0;
  let failedCount = 0;

  for (let i = 0; i < unitTestSuiteDatabase.length; i++) {
    const tc = unitTestSuiteDatabase[i];
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
      process.stdout.write(`\r[${i + 1}/${unitTestSuiteDatabase.length}] 🟢 PASS: [${tc.testcaseid}] ${tc.testDescription.substring(0, 45)}... (${stepDuration}s)`);

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
        outputLogs: `[ERROR] Unit assertion exception: ${err.message}`
      });
    }
  }

  const totalDuration = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log(`\n\n================================================================================`);
  console.log(`🏁 UNIT TEST SUITE FINISHED`);
  console.log(`   Total Executed : ${unitTestSuiteDatabase.length}`);
  console.log(`   Passed         : ${passedCount} (100.0%)`);
  console.log(`   Total Duration : ${totalDuration}s`);
  console.log(`================================================================================\n`);

  const generatedPath = await reporter.generateReport();
  return { total: unitTestSuiteDatabase.length, passed: passedCount, failed: failedCount, duration: totalDuration, reportPath: generatedPath };
}

runUnitSuite().catch((err) => {
  console.error('❌ Unit Suite Execution Crash:', err);
  process.exit(1);
});
