/**
 * generate_sql.js
 *
 * Genereert een SQL-bestand met dagelijkse verkoopdata voor 2025.
 * Gebruik: node generate_sql.js
 * Output: sales_data.sql
 *
 * FIX: 'id' is verwijderd uit de INSERT; Supabase/Postgres beheert dit zelf
 * via een SERIAL/BIGSERIAL kolom. Een hardcoded id veroorzaakt conflicts als
 * de tabel al rijen bevat.
 */

const products = [
  { name: 'Nike Air Max',        monthly: [107, 74, 120, 113, 119, 119, 209, 103, 176, 186, 199, 247] },
  { name: 'Adidas Predator 42',  monthly: [ 74, 55,  85,  95,  91, 101, 141,  74, 129, 126, 135, 176] },
  { name: 'Grip Socks',          monthly: [ 49, 32,  54,  51,  47,  48,  74,  38,  60,  67,  70,  84] },
  { name: 'Wilson Tennis Racket',monthly: [ 40, 28,  42,  37,  38,  40,  60,  27,  54,  53,  50,  59] },
];

// Rekening houden met schrikkeljaar 2024; 2025 is geen schrikkeljaar
const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

const rows = [];

for (let m = 0; m < 12; m++) {
  const month = m + 1;
  const days  = daysInMonth[m];

  for (let d = 1; d <= days; d++) {
    const date = `2025-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

    for (const p of products) {
      const monthlyTotal = p.monthly[m];
      const base         = Math.floor(monthlyTotal / days);
      const remainder    = monthlyTotal % days;

      // Verdeel de rest over de eerste 'remainder' dagen van de maand
      const dailySales = base + (d <= remainder ? 1 : 0);

      if (dailySales > 0) {
        // Let op: geen 'id' kolom → DB genereert dit automatisch
        rows.push(
          `('${date}', '${p.name}', ${dailySales})`
        );
      }
    }
  }
}

// Gebruik één grote INSERT voor betere performance
const sql = [
  'DELETE FROM "public"."sales_data";',
  '',
  'INSERT INTO "public"."sales_data" ("date", "product_name", "sales") VALUES',
  rows.map((r, i) => `  ${r}${i < rows.length - 1 ? ',' : ';'}`).join('\n'),
].join('\n');

require('fs').writeFileSync('sales_data.sql', sql, 'utf8');
console.log(`✅ sales_data.sql gegenereerd met ${rows.length} rijen.`);
