import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';

/**
 * Custom Excel Reporter for Appium Mobile E2E Test Execution Logs
 * Matches exact layout, header styling, status colors, and schema of target screenshot.
 */
export class ExcelTestReporter {
  constructor(options = {}) {
    this.outputFileName = options.outputFileName || 'Mobile_Appium_E2E_Test_Execution_Report.xlsx';
    this.outputDir = options.outputDir || path.resolve(process.cwd(), 'reports');
    this.reportTitle = options.reportTitle || 'Detailed Mobile Appium E2E Test Execution Logs';
    this.testResults = [];
  }

  addResult(result) {
    this.testResults.push({
      testcaseid: result.testcaseid,
      platform: result.platform || 'Mobile (Android Appium)',
      testtype: result.testtype || 'Mobile Appium Native E2E',
      module: result.module,
      testDescription: result.testDescription,
      status: result.status, // PASS or FAIL
      duration: typeof result.duration === 'number' ? result.duration.toFixed(2) : result.duration,
      outputLogs: result.outputLogs || '[INFO] Native step completed successfully.'
    });
  }

  async generateReport() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'ToothMate Appium Mobile QA Automation Framework';
    workbook.lastModifiedBy = 'Appium-WebdriverIO Node.js Suite';
    workbook.created = new Date();

    // ─────────────────────────────────────────────────────────────
    // SHEET 1: Detailed Mobile Appium E2E Test Execution Logs
    // ─────────────────────────────────────────────────────────────
    const logSheet = workbook.addWorksheet('Detailed Mobile Appium Logs', {
      views: [{ showGridLines: true }]
    });

    // Title Row (Row 1)
    logSheet.mergeCells('A1:H1');
    const titleCell = logSheet.getCell('A1');
    titleCell.value = this.reportTitle;
    titleCell.font = { name: 'Segoe UI', size: 14, bold: true, color: { argb: 'FF000000' } };
    titleCell.alignment = { vertical: 'middle', horizontal: 'left' };
    logSheet.getRow(1).height = 32;

    // Header Row (Row 3)
    const headers = [
      'testcaseid',
      'platform',
      'testtype',
      'module',
      'test description',
      'status',
      'duration',
      'erroes/outputlogs'
    ];

    const headerRow = logSheet.getRow(3);
    headerRow.height = 28;

    headers.forEach((headerText, index) => {
      const cell = headerRow.getCell(index + 1);
      cell.value = headerText;
      cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF0D5C5B' } // Deep Teal background matching screenshot
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FF0A4645' } },
        bottom: { style: 'medium', color: { argb: 'FF0A4645' } },
        left: { style: 'thin', color: { argb: 'FF0A4645' } },
        right: { style: 'thin', color: { argb: 'FF0A4645' } }
      };
    });

    // Populate Data Rows starting from Row 4
    let currentRowIndex = 4;

    this.testResults.forEach((test) => {
      const row = logSheet.getRow(currentRowIndex);
      row.height = 38;

      row.getCell(1).value = test.testcaseid;
      row.getCell(2).value = test.platform;
      row.getCell(3).value = test.testtype;
      row.getCell(4).value = test.module;
      row.getCell(5).value = test.testDescription;
      row.getCell(6).value = test.status;
      row.getCell(7).value = parseFloat(test.duration);
      row.getCell(8).value = test.outputLogs;

      // Alignments
      row.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' };
      row.getCell(2).alignment = { vertical: 'middle', horizontal: 'center' };
      row.getCell(3).alignment = { vertical: 'middle', horizontal: 'center' };
      row.getCell(4).alignment = { vertical: 'middle', horizontal: 'left' };
      row.getCell(5).alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
      row.getCell(6).alignment = { vertical: 'middle', horizontal: 'center' };
      row.getCell(7).alignment = { vertical: 'middle', horizontal: 'right' };
      row.getCell(8).alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };

      // Borders and fonts
      for (let c = 1; c <= 8; c++) {
        row.getCell(c).font = { name: 'Segoe UI', size: 9 };
        row.getCell(c).border = {
          top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
        };
      }

      // Status Green / Red Fill
      const statusCell = row.getCell(6);
      if (test.status === 'PASS') {
        statusCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE2F0D9' } // Light green fill matching screenshot
        };
        statusCell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FF276A3C' } };
      } else {
        statusCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFCE4D6' } // Light red fill
        };
        statusCell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FFC00000' } };
      }

      currentRowIndex++;
    });

    // Column Widths
    logSheet.getColumn(1).width = 16; // testcaseid
    logSheet.getColumn(2).width = 24; // platform
    logSheet.getColumn(3).width = 26; // testtype
    logSheet.getColumn(4).width = 30; // module
    logSheet.getColumn(5).width = 48; // test description
    logSheet.getColumn(6).width = 14; // status
    logSheet.getColumn(7).width = 14; // duration
    logSheet.getColumn(8).width = 65; // erroes/outputlogs

    // ─────────────────────────────────────────────────────────────
    // SHEET 2: Executive Mobile Analytics Dashboard
    // ─────────────────────────────────────────────────────────────
    const summarySheet = workbook.addWorksheet('Mobile Executive Dashboard', {
      views: [{ showGridLines: true }]
    });

    summarySheet.mergeCells('A1:F1');
    const summaryTitle = summarySheet.getCell('A1');
    summaryTitle.value = 'ToothMate Mobile Appium E2E Automation Analytics';
    summaryTitle.font = { name: 'Segoe UI', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
    summaryTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0D5C5B' } };
    summaryTitle.alignment = { vertical: 'middle', horizontal: 'center' };
    summarySheet.getRow(1).height = 32;

    const totalTests = this.testResults.length;
    const totalPass = this.testResults.filter(t => t.status === 'PASS').length;
    const totalFail = this.testResults.filter(t => t.status === 'FAIL').length;
    const passPercentage = totalTests > 0 ? ((totalPass / totalTests) * 100).toFixed(1) : 0;
    const avgDuration = totalTests > 0 
      ? (this.testResults.reduce((acc, t) => acc + parseFloat(t.duration), 0) / totalTests).toFixed(2)
      : 0;

    summarySheet.mergeCells('A3:C3');
    summarySheet.getCell('A3').value = 'Mobile Test Execution KPI Overview';
    summarySheet.getCell('A3').font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: 'FF0D5C5B' } };

    const kpiData = [
      ['Total Appium Mobile Test Cases Executed', totalTests],
      ['Total Passed (PASS)', totalPass],
      ['Total Failed (FAIL)', totalFail],
      ['Overall Mobile Pass Rate', `${passPercentage}%`],
      ['Average Execution Time per Mobile Step (s)', `${avgDuration}s`]
    ];

    kpiData.forEach((row, i) => {
      const r = summarySheet.getRow(4 + i);
      r.getCell(1).value = row[0];
      r.getCell(2).value = row[1];
      r.getCell(1).font = { name: 'Segoe UI', size: 10, bold: true };
      r.getCell(2).font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FF0F5132' } };
      r.getCell(1).border = { bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } } };
      r.getCell(2).border = { bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } } };
    });

    summarySheet.getColumn(1).width = 38;
    summarySheet.getColumn(2).width = 20;

    const reportFilePath = path.join(this.outputDir, this.outputFileName);
    await workbook.xlsx.writeFile(reportFilePath);
    console.log(`\n📊 APPIUM MOBILE EXCEL REPORT GENERATED AT:\n   ${reportFilePath}\n`);
    return reportFilePath;
  }
}
