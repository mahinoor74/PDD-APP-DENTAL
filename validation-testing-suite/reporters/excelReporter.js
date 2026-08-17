import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';

export class ExcelTestReporter {
  constructor(options = {}) {
    this.outputFileName = options.outputFileName || 'Validation_Security_Test_Execution_Report.xlsx';
    this.outputDir = options.outputDir || path.resolve(process.cwd(), 'reports');
    this.reportTitle = options.reportTitle || 'Detailed Validation, Security & Input Sanitization Test Execution Logs';
    this.testResults = [];
  }

  addResult(result) {
    this.testResults.push({
      testcaseid: result.testcaseid,
      platform: result.platform || 'API & Form Security',
      testtype: result.testtype || 'Validation & Security Test',
      module: result.module,
      testDescription: result.testDescription,
      status: result.status,
      duration: typeof result.duration === 'number' ? result.duration.toFixed(2) : result.duration,
      outputLogs: result.outputLogs || '[INFO] Input validation and sanitization rule passed.'
    });
  }

  async generateReport() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'ToothMate Validation & Security QA Engine';
    workbook.created = new Date();

    const logSheet = workbook.addWorksheet('Detailed Validation Logs', { views: [{ showGridLines: true }] });

    logSheet.mergeCells('A1:H1');
    const titleCell = logSheet.getCell('A1');
    titleCell.value = this.reportTitle;
    titleCell.font = { name: 'Segoe UI', size: 14, bold: true };
    titleCell.alignment = { vertical: 'middle', horizontal: 'left' };
    logSheet.getRow(1).height = 32;

    const headers = ['testcaseid', 'platform', 'testtype', 'module', 'test description', 'status', 'duration', 'erroes/outputlogs'];
    const headerRow = logSheet.getRow(3);
    headerRow.height = 28;

    headers.forEach((h, i) => {
      const cell = headerRow.getCell(i + 1);
      cell.value = h;
      cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0D5C5B' } };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    let rIndex = 4;
    this.testResults.forEach((t) => {
      const row = logSheet.getRow(rIndex);
      row.height = 36;
      row.getCell(1).value = t.testcaseid;
      row.getCell(2).value = t.platform;
      row.getCell(3).value = t.testtype;
      row.getCell(4).value = t.module;
      row.getCell(5).value = t.testDescription;
      row.getCell(6).value = t.status;
      row.getCell(7).value = parseFloat(t.duration);
      row.getCell(8).value = t.outputLogs;

      for (let c = 1; c <= 8; c++) {
        row.getCell(c).font = { name: 'Segoe UI', size: 9 };
        row.getCell(c).border = {
          top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
        };
      }

      const statusCell = row.getCell(6);
      if (t.status === 'PASS') {
        statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2F0D9' } };
        statusCell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FF276A3C' } };
      } else {
        statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFCE4D6' } };
        statusCell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FFC00000' } };
      }
      rIndex++;
    });

    logSheet.getColumn(1).width = 16;
    logSheet.getColumn(2).width = 24;
    logSheet.getColumn(3).width = 28;
    logSheet.getColumn(4).width = 28;
    logSheet.getColumn(5).width = 45;
    logSheet.getColumn(6).width = 14;
    logSheet.getColumn(7).width = 14;
    logSheet.getColumn(8).width = 65;

    const reportFilePath = path.join(this.outputDir, this.outputFileName);
    await workbook.xlsx.writeFile(reportFilePath);
    return reportFilePath;
  }
}
