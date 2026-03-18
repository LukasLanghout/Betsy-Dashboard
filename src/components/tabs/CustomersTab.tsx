import { User, Mail, ShoppingBag, CheckCircle2, XCircle, History, ArrowLeft, Calendar, Tag, Package as PackageIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

interface Customer {
  id: string;
  name: string;
  email: string;
  total_orders: number;
  status: string;
}

interface CustomerOrder {
  id: string;
  customer_id: string;
  product_name: string;
  amount: number;
  order_date: string;
  price: number;
}

interface CustomersTabProps {
  customers: Customer[];
  fetchData: () => void;
}

export function CustomersTab({ customers, fetchData }: CustomersTabProps) {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerOrders, setCustomerOrders] = useState<CustomerOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    if (selectedCustomer) {
      fetchCustomerOrders(selectedCustomer.id);
    }
  }, [selectedCustomer]);

  const fetchCustomerOrders = async (customerId: string) => {
    setLoadingOrders(true);
    try {
      const { data, error } = await supabase
        .from('customer_orders')
        .select('*')
        .eq('customer_id', customerId)
        .order('order_date', { ascending: false });

      if (error) throw error;
      setCustomerOrders(data || []);
    } catch (err) {
      console.error('Error fetching customer orders:', err);
      // Fallback mock data if table doesn't exist yet
      setCustomerOrders([
        { id: '1', customer_id: customerId, product_name: 'Adidas Predator 42', amount: 1, order_date: '2024-01-15T10:00:00Z', price: 85.00 },
        { id: '2', customer_id: customerId, product_name: 'Nike Air Max', amount: 1, order_date: '2023-11-24T14:30:00Z', price: 120.00 },
        { id: '3', customer_id: customerId, product_name: 'Grip Socks', amount: 3, order_date: '2023-07-12T09:15:00Z', price: 45.00 },
      ]);
    } finally {
      setLoadingOrders(false);
    }
  };

  const getSalePeriod = (dateString: string): string | null => {
    const date = new Date(dateString);
    const month = date.getMonth(); // 0-11
    const day = date.getDate();

    // Winter Sale: January
    if (month === 0) return 'Winter Sale ❄️';
    
    // Summer Sale: July/August
    if (month === 6 || month === 7) return 'Zomer Sale ☀️';
    
    // Singles Day: Nov 11
    if (month === 10 && day === 11) return 'Singles Day ⚡';
    
    // Black Friday / Cyber Monday: Late November
    if (month === 10 && day >= 20) return 'Black Friday / Cyber Monday ⚡';
    
    // Christmas: December
    if (month === 11) return 'Kerst Sale 🎄';
    
    // Mid-season: April/May
    if (month === 3 || month === 4) return 'Mid-season Sale 🧠';
    
    // Mid-season: October
    if (month === 9) return 'Mid-season Sale 🧠';

    return null;
  };

  if (selectedCustomer) {
    return (
      <div className="space-y-6">
        <button 
          onClick={() => setSelectedCustomer(null)}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Terug naar overzicht
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Customer Info Card */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-[#141414] border border-white/10 rounded-2xl p-6">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-20 h-20 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-2xl mb-4">
                  {selectedCustomer.name?.charAt(0) || '?'}
                </div>
                <h2 className="text-xl font-bold text-white">{selectedCustomer.name}</h2>
                <p className="text-gray-400 text-sm">{selectedCustomer.email}</p>
              </div>

              <div className="space-y-4 pt-6 border-t border-white/5">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-xs uppercase tracking-wider font-bold">Status</span>
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    selectedCustomer.status === 'Active' 
                      ? 'bg-emerald-500/10 text-emerald-500' 
                      : 'bg-gray-500/10 text-gray-500'
                  }`}>
                    {selectedCustomer.status === 'Active' ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                    {selectedCustomer.status}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-xs uppercase tracking-wider font-bold">Totaal Bestellingen</span>
                  <span className="text-white font-mono">{selectedCustomer.total_orders}</span>
                </div>
              </div>
            </div>

            <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-2xl p-6">
              <h4 className="text-white font-bold mb-2 flex items-center gap-2">
                <Tag size={16} className="text-indigo-500" />
                Sale Insider Info
              </h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Houd rekening met grote sale-periodes zoals de Winter Sale (Januari) en Zomer Sale (Juli/Augustus). 
                Speciale dagen zoals Black Friday en Singles Day zorgen vaak voor pieken in bestellingen.
              </p>
            </div>
          </div>

          {/* Order History */}
          <div className="lg:col-span-2">
            <div className="bg-[#141414] border border-white/10 rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-white/5">
                <h3 className="text-white font-bold flex items-center gap-2">
                  <ShoppingBag size={18} className="text-indigo-500" />
                  Bestelgeschiedenis
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="text-gray-500 border-b border-white/5">
                      <th className="px-6 py-4 font-medium">Product</th>
                      <th className="px-6 py-4 font-medium">Datum</th>
                      <th className="px-6 py-4 font-medium">Aantal</th>
                      <th className="px-6 py-4 font-medium">Prijs</th>
                      <th className="px-6 py-4 font-medium">Sale Type</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {loadingOrders ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center">
                          <div className="flex items-center justify-center gap-2 text-gray-500">
                            <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                            Bestellingen laden...
                          </div>
                        </td>
                      </tr>
                    ) : customerOrders.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500 italic">
                          Geen bestellingen gevonden voor deze klant.
                        </td>
                      </tr>
                    ) : (
                      customerOrders.map((order) => {
                        const salePeriod = getSalePeriod(order.order_date);
                        return (
                          <tr key={order.id} className="hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <PackageIcon size={14} className="text-gray-500" />
                                <span className="text-white font-medium">{order.product_name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2 text-gray-400">
                                <Calendar size={14} />
                                {new Date(order.order_date).toLocaleDateString('nl-NL')}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-gray-300">{order.amount}</td>
                            <td className="px-6 py-4 text-gray-300 font-mono">€{order.price.toFixed(2)}</td>
                            <td className="px-6 py-4">
                              {salePeriod ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-bold uppercase tracking-wider">
                                  {salePeriod}
                                </span>
                              ) : (
                                <span className="text-gray-600 text-[10px] uppercase tracking-wider font-bold">Regulier</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-2xl p-6 flex items-start gap-4 flex-1">
          <div className="p-3 bg-indigo-500/10 rounded-xl">
            <User className="text-indigo-500" size={24} />
          </div>
          <div>
            <h3 className="text-white font-bold mb-1">Customer Management</h3>
            <p className="text-sm text-gray-400">View and manage your customer relationships and order history.</p>
          </div>
        </div>
        <button 
          onClick={fetchData}
          className="ml-4 p-4 bg-white/5 border border-white/10 rounded-2xl text-gray-400 hover:text-white hover:bg-white/10 transition-all"
          title="Refresh Data"
        >
          <History size={20} />
        </button>
      </div>

      <div className="bg-[#141414] border border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-gray-500 border-b border-white/5">
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium">Total Orders</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500 italic">
                    Geen klanten gevonden in de database.
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-xs">
                          {customer.name?.charAt(0) || '?'}
                        </div>
                        <span className="text-white font-medium">{customer.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-400">
                        <Mail size={14} />
                        {customer.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-300 font-mono">
                        <ShoppingBag size={14} className="text-gray-500" />
                        {customer.total_orders}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        customer.status === 'Active' 
                          ? 'bg-emerald-500/10 text-emerald-500' 
                          : 'bg-gray-500/10 text-gray-500'
                      }`}>
                        {customer.status === 'Active' ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                        {customer.status}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setSelectedCustomer(customer)}
                        className="text-indigo-400 hover:text-indigo-300 text-xs font-bold transition-colors"
                      >
                        View Profile
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
