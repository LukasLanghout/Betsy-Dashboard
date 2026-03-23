
const products = [
  { name: 'Nike Air Max', monthly: [107, 74, 120, 113, 119, 119, 209, 103, 176, 186, 199, 247] },
  { name: 'Adidas Predator 42', monthly: [74, 55, 85, 95, 91, 101, 141, 74, 129, 126, 135, 176] },
  { name: 'Grip Socks', monthly: [49, 32, 54, 51, 47, 48, 74, 38, 60, 67, 70, 84] },
  { name: 'Wilson Tennis Racket', monthly: [40, 28, 42, 37, 38, 40, 60, 27, 54, 53, 50, 59] }
];

const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

let sql = 'DELETE FROM "public"."sales_data";\n';
let id = 1;

for (let m = 0; m < 12; m++) {
  const month = m + 1;
  const days = daysInMonth[m];
  
  for (let d = 1; d <= days; d++) {
    const date = `2025-${month.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
    
    products.forEach(p => {
      const monthlyTotal = p.monthly[m];
      const base = Math.floor(monthlyTotal / days);
      const remainder = monthlyTotal % days;
      
      // Distribute remainder to the first 'remainder' days of the month
      let dailySales = base + (d <= remainder ? 1 : 0);
      
      if (dailySales > 0) {
        sql += `INSERT INTO "public"."sales_data" ("id", "date", "product_name", "sales") VALUES ('${id++}', '${date}', '${p.name}', '${dailySales}');\n`;
      }
    });
  }
}

require('fs').writeFileSync('sales_data.sql', sql);
console.log('SQL generated in sales_data.sql');
