export const inventoryData = [
  { id: 1, name: 'Laptop Pro X', category: 'Electronics', stock_level: 45, avg_weekly_sales: 12, reorder_point: 50, base_price: 1200 },
  { id: 2, name: 'Wireless Mouse', category: 'Accessories', stock_level: 150, avg_weekly_sales: 30, reorder_point: 100, base_price: 25 },
  { id: 3, name: 'Ergonomic Chair', category: 'Furniture', stock_level: 12, avg_weekly_sales: 5, reorder_point: 20, base_price: 350 },
  { id: 4, name: 'USB-C Hub', category: 'Accessories', stock_level: 80, avg_weekly_sales: 25, reorder_point: 50, base_price: 45 },
  { id: 5, name: '27" Monitor', category: 'Electronics', stock_level: 18, avg_weekly_sales: 8, reorder_point: 25, base_price: 400 },
];

export const supplierData = [
  { id: 's1', name: 'TechCorp', category: 'Electronics', reliability_score: 95, delivery_days: 3, avg_price_index: 100 },
  { id: 's2', name: 'GlobalSupplies', category: 'Accessories', reliability_score: 88, delivery_days: 5, avg_price_index: 90 },
  { id: 's3', name: 'OfficeFurnish', category: 'Furniture', reliability_score: 92, delivery_days: 7, avg_price_index: 105 },
  { id: 's4', name: 'FastElectronics', category: 'Electronics', reliability_score: 85, delivery_days: 2, avg_price_index: 110 },
];

export const supplierPrices = [
  { productId: 1, supplierId: 's1', price: 1150, delivery_days: 3, reliability_score: 95 },
  { productId: 1, supplierId: 's4', price: 1200, delivery_days: 2, reliability_score: 85 },
  { productId: 3, supplierId: 's3', price: 340, delivery_days: 7, reliability_score: 92 },
  { productId: 5, supplierId: 's1', price: 390, delivery_days: 3, reliability_score: 95 },
  { productId: 5, supplierId: 's4', price: 410, delivery_days: 2, reliability_score: 85 },
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
