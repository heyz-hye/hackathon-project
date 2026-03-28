package com.com.yourproject.communityapp;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.CrossOrigin;
import java.io.ByteArrayOutputStream;
import java.io.IOException;

@RestController
@RequestMapping("/api/budget")
@CrossOrigin(origins = "http://localhost:3000")
public class BudgetController {

    @PostMapping("/download")
    public ResponseEntity<byte[]> generateBudgetFile(@RequestBody BudgetRequest request) {
        
        try (Workbook workbook = new XSSFWorkbook(); 
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("My Budget Plan");

            // Header Row
            Row headerRow = sheet.createRow(0);
            headerRow.createCell(0).setCellValue("Category");
            headerRow.createCell(1).setCellValue("Amount ($)");

            // Data Rows
            int rowNum = 1;
            addRow(sheet, rowNum++, "Monthly Income", request.monthlyIncome());
            addRow(sheet, rowNum++, "Target Rent", request.targetRent());
            addRow(sheet, rowNum++, "Groceries", request.groceries());
            addRow(sheet, rowNum++, "Transportation", request.transportation());
            addRow(sheet, rowNum++, "Other Expenses", request.otherExpenses());

            // Calculate Remaining Balance
            double totalExpenses = request.targetRent() + request.groceries() + request.transportation() + request.otherExpenses();
            double balance = request.monthlyIncome() - totalExpenses;
            
            Row balanceRow = sheet.createRow(rowNum + 1);
            balanceRow.createCell(0).setCellValue("Remaining Balance");
            balanceRow.createCell(1).setCellValue(balance);

            // Write to output stream
            workbook.write(out);

            // Set up headers to trigger a file download in the browser
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
            headers.setContentDispositionFormData("attachment", "Community_Budget_Plan.xlsx");

            return new ResponseEntity<>(out.toByteArray(), headers, HttpStatus.OK);

        } catch (IOException e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Quick helper method to keep the code clean
    private void addRow(Sheet sheet, int rowNum, String category, double amount) {
        Row row = sheet.createRow(rowNum);
        row.createCell(0).setCellValue(category);
        row.createCell(1).setCellValue(amount);
    }
}