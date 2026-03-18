import { User, Mail, ShoppingBag, CheckCircle2, XCircle, History } from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  email: string;
  total_orders: number;
  status: string;
}

interface CustomersTabProps {
  customers: Customer[];
  fetchData: () => void;
}

export function CustomersTab({ customers, fetchData }: CustomersTabProps) {
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
                      <button className="text-indigo-400 hover:text-indigo-300 text-xs font-bold transition-colors">
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
