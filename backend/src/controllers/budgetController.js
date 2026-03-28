// backend/src/controllers/budgetController.js
import ExcelJS from 'exceljs';

export const generateBudgetSheet = async (req, res) => {
  try {
    const { income, rent, food, transport, misc } = req.body;
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Budget');
    
    worksheet.columns = [
      { header: 'Category', key: 'cat', width: 20 },
      { header: 'Amount', key: 'amt', width: 15 }
    ];

    worksheet.addRows([
      { cat: 'Income', amt: income },
      { cat: 'Rent', amt: rent },
      { cat: 'Food', amt: food },
      { cat: 'Transport', amt: transport },
      { cat: 'Misc', amt: misc }
    ]);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="budget.xlsx"');
    await workbook.xlsx.write(res);
    res.end();
  } catch (e) {
    res.status(500).send('Error');
  }
};