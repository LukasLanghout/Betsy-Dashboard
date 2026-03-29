export const inventoryData = [
  { id: 1, name: 'Nike Air Max', category: 'Schoenen', stock_level: 45, avg_weekly_sales: 120, reorder_point: 50, base_price: 120 },
  { id: 2, name: 'Adidas Predator 42', category: 'Schoenen', stock_level: 150, avg_weekly_sales: 100, reorder_point: 100, base_price: 140 },
  { id: 3, name: 'Grip Socks', category: 'Accessoires', stock_level: 300, avg_weekly_sales: 60, reorder_point: 150, base_price: 15 },
  { id: 4, name: 'Wilson Tennis Racket', category: 'Sportartikelen', stock_level: 25, avg_weekly_sales: 40, reorder_point: 30, base_price: 85 },
];

export const supplierData = [
  { id: 1, name: 'Nike Wholesale', category: 'Schoenen', reliability_score: 95, delivery_days: 3, avg_price_index: 100 },
  { id: 2, name: 'Adidas Direct', category: 'Schoenen', reliability_score: 88, delivery_days: 5, avg_price_index: 90 },
  { id: 3, name: 'SportSupplies NL', category: 'Accessoires', reliability_score: 92, delivery_days: 7, avg_price_index: 105 },
  { id: 4, name: 'TennisGlobal', category: 'Sportartikelen', reliability_score: 85, delivery_days: 2, avg_price_index: 110 },
];

export const supplierPrices = [
  { productId: 1, supplierId: 1, price: 80, delivery_days: 3, reliability_score: 95 },
  { productId: 2, supplierId: 2, price: 95, delivery_days: 5, reliability_score: 88 },
  { productId: 3, supplierId: 3, price: 8, delivery_days: 7, reliability_score: 92 },
  { productId: 4, supplierId: 4, price: 60, delivery_days: 2, reliability_score: 85 },
];

export const orderPipelineData = [
  { stage: 'Pending', count: 45 },
  { stage: 'Approved', count: 38 },
  { stage: 'Processing', count: 30 },
  { stage: 'Shipped', count: 25 },
  { stage: 'Delivered', count: 120 },
];

export const invoiceData = [
  { id: 'inv1', amount: 12000, ai_check_status: 'verified_clean' },
  { id: 'inv2', amount: 4500, ai_check_status: 'verified_clean' },
  { id: 'inv3', amount: 800, ai_check_status: 'error_detected' },
  { id: 'inv4', amount: 3200, ai_check_status: 'verified_clean' },
  { id: 'inv5', amount: 15000, ai_check_status: 'verified_clean' },
  { id: 'inv6', amount: 2100, ai_check_status: 'error_detected' },
  { id: 'inv7', amount: 5600, ai_check_status: 'verified_clean' },
  { id: 'inv8', amount: 900, ai_check_status: 'verified_clean' },
];

export const customerData = [
  { id: 'c1', name: 'John Doe', email: 'john@example.com', total_orders: 12, status: 'Active' },
  { id: 'c2', name: 'Jane Smith', email: 'jane@example.com', total_orders: 8, status: 'Active' },
  { id: 'c3', name: 'Bob Johnson', email: 'bob@example.com', total_orders: 3, status: 'Inactive' },
  { id: 'c4', name: 'Alice Williams', email: 'alice@example.com', total_orders: 25, status: 'Active' },
];
