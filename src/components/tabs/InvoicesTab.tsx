import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, AlertTriangle, CheckCircle2, BrainCircuit, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function InvoicesTab({ invoices, selectedInvoice, setSelectedInvoice, updateInvoice }: any) {
  
  const loadImage = (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        } else {
          reject(new Error('Could not get canvas context'));
        }
      };
      img.onerror = reject;
      img.src = url;
    });
  };

  const downloadPDF = async (invoice: any) => {
    const doc = new jsPDF();
    
    const vendorName = invoice.vendor || 'Unknown Vendor';
    
    // Add Header
    doc.setFontSize(24);
    doc.setTextColor(40, 40, 40);
    doc.text('INVOICE', 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Invoice Number: ${invoice.invoice_number}`, 14, 30);
    doc.text(`Date: ${invoice.invoice_date || 'N/A'}`, 14, 35);
    doc.text(`Due Date: ${invoice.due_date || 'N/A'}`, 14, 40);
    
    // Add Vendor Info
    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);
    doc.text('From:', 120, 22);
    doc.setFontSize(12);
    doc.text(vendorName, 120, 30);
    
    // Try to load and add logo
    const normalizedVendor = vendorName.toLowerCase().replace(/\s+/g, '');
    let logoUrl = null;
    if (normalizedVendor.includes('fastfootwear')) logoUrl = '/FastFootwear.png';
    else if (normalizedVendor.includes('globalsports')) logoUrl = '/GlobalSports.png';
    else if (normalizedVendor.includes('elitegear')) logoUrl = '/EliteGear.png';

    try {
      if (logoUrl) {
        const base64Img = await loadImage(logoUrl);
        doc.addImage(base64Img, 'PNG', 120, 35, 60, 20);
      } else {
        throw new Error('No logo found');
      }
    } catch (e) {
      // Fallback to text box if image fails to load
      doc.setDrawColor(200, 200, 200);
      doc.setFillColor(245, 245, 245);
      doc.roundedRect(120, 35, 60, 20, 2, 2, 'FD');
      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      doc.text(`${vendorName} Logo`, 130, 46);
    }
    
    // Add Bill To
    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);
    doc.text('Bill To:', 14, 65);
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Your Company Name', 14, 72);
    doc.text('123 Business Avenue', 14, 77);
    doc.text('Business City, 10001', 14, 82);

    // Add Items Table
    const tableColumn = ["Product Name", "Quantity", "Unit Price", "Total"];
    const tableRows: any[] = [];

    if (invoice.items && Array.isArray(invoice.items)) {
      invoice.items.forEach((item: any) => {
        const itemData = [
          item.product_name || 'N/A',
          item.quantity || 0,
          `€${Number(item.unit_price || 0).toFixed(2)}`,
          `€${Number(item.total || 0).toFixed(2)}`
        ];
        tableRows.push(itemData);
      });
    }

    autoTable(doc, {
      startY: 95,
      head: [tableColumn],
      body: tableRows,
      theme: 'striped',
      headStyles: { fillColor: [16, 185, 129] }, // Emerald 500
      styles: { fontSize: 10, cellPadding: 5 },
      alternateRowStyles: { fillColor: [245, 245, 245] }
    });

    // Add Totals
    const finalY = (doc as any).lastAutoTable.finalY || 95;
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Subtotal:', 130, finalY + 10);
    doc.text(`€${Number(invoice.subtotal || 0).toFixed(2)}`, 190, finalY + 10, { align: 'right' });
    
    doc.text(`VAT (${invoice.tax_percentage || 0}%):`, 130, finalY + 16);
    const taxAmount = (invoice.subtotal || 0) * ((invoice.tax_percentage || 0) / 100);
    doc.text(`€${taxAmount.toFixed(2)}`, 190, finalY + 16, { align: 'right' });
    
    doc.setFontSize(12);
    doc.setTextColor(40, 40, 40);
    doc.setFont('helvetica', 'bold');
    doc.text('Total Amount:', 130, finalY + 24);
    doc.text(`€${Number(invoice.total_amount || 0).toFixed(2)}`, 190, finalY + 24, { align: 'right' });

    // Add Footer
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Thank you for your business!', 105, 280, { align: 'center' });

    // Save PDF
    doc.save(`Invoice_${invoice.invoice_number || 'Draft'}.pdf`);
  };

  return (
    <div className="space-y-6">
      {selectedInvoice ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#141414] border border-white/10 rounded-2xl overflow-hidden"
        >
          {/* Invoice Detail Header */}
          <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSelectedInvoice(null)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <ArrowRight className="rotate-180" size={20} />
              </button>
              <h3 className="text-xl font-bold text-white">Invoice Detail: {selectedInvoice?.invoice_number}</h3>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => downloadPDF(selectedInvoice)}
                className="px-4 py-2 bg-white/5 text-white font-bold rounded-xl hover:bg-white/10 transition-all flex items-center gap-2 border border-white/10"
              >
                <Download size={16} />
                Download PDF
              </button>
              <button 
                onClick={() => updateInvoice(selectedInvoice)}
                className="px-6 py-2 bg-emerald-500 text-black font-bold rounded-xl hover:bg-emerald-400 transition-all"
              >
                Save & AI Validate
              </button>
            </div>
          </div>

          <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Left Column: Info */}
            <div className="lg:col-span-2 space-y-8">
              {selectedInvoice.ai_check_status === 'error' && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3">
                  <AlertTriangle className="text-red-500 shrink-0" size={20} />
                  <div>
                    <p className="text-red-500 font-bold text-sm">AI Agent Alert: Discrepancy Found</p>
                    <p className="text-red-400/80 text-xs mt-1">{selectedInvoice?.ai_error_message}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="block text-[10px] text-gray-500 uppercase tracking-widest">Supplier Information</label>
                  <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                    <div className="flex items-center gap-3">
                      {selectedInvoice?.vendor?.toLowerCase()?.includes('fastfootwear') && (
                        <img src="/FastFootwear.png" alt="FastFootwear" className="h-8 object-contain bg-white rounded p-1" />
                      )}
                      {selectedInvoice?.vendor?.toLowerCase()?.includes('globalsports') && (
                        <img src="/GlobalSports.png" alt="GlobalSports" className="h-8 object-contain bg-white rounded p-1" />
                      )}
                      {selectedInvoice?.vendor?.toLowerCase()?.includes('elitegear') && (
                        <img src="/EliteGear.png" alt="EliteGear" className="h-8 object-contain bg-white rounded p-1" />
                      )}
                      <div>
                        <p className="text-white font-bold">{selectedInvoice?.vendor}</p>
                        <p className="text-gray-500 text-xs mt-1">B2B Verified Partner</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="block text-[10px] text-gray-500 uppercase tracking-widest">PO Reference</label>
                  <input 
                    type="text"
                    value={selectedInvoice?.po_reference || ''}
                    onChange={(e) => setSelectedInvoice({...selectedInvoice, po_reference: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-[10px] text-gray-500 uppercase tracking-widest">Invoice Items (Editable)</label>
                <div className="bg-white/5 rounded-xl border border-white/5 overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="text-gray-500 border-b border-white/5">
                        <th className="px-6 py-4 font-medium">Product Name</th>
                        <th className="px-6 py-4 font-medium">Qty</th>
                        <th className="px-6 py-4 font-medium">Unit Price</th>
                        <th className="px-6 py-4 font-medium text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {selectedInvoice?.items?.map((item: any, idx: number) => (
                        <tr key={idx}>
                          <td className="px-6 py-4">
                            <input 
                              type="text"
                              value={item.product_name}
                              onChange={(e) => {
                                const newItems = [...selectedInvoice.items];
                                newItems[idx].product_name = e.target.value;
                                setSelectedInvoice({...selectedInvoice, items: newItems});
                              }}
                              className="bg-transparent border-b border-transparent hover:border-white/20 focus:border-emerald-500 focus:outline-none w-full text-white"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <input 
                              type="number"
                              value={item.quantity}
                              onChange={(e) => {
                                if (!selectedInvoice) return;
                                const val = Number(e.target.value);
                                const newItems = [...selectedInvoice.items];
                                newItems[idx].quantity = val;
                                newItems[idx].total = val * newItems[idx].unit_price;
                                const newSubtotal = newItems.reduce((sum: number, i: any) => sum + i.total, 0);
                                setSelectedInvoice({
                                  ...selectedInvoice, 
                                  items: newItems,
                                  subtotal: newSubtotal,
                                  total_amount: newSubtotal * (1 + (selectedInvoice.tax_percentage / 100))
                                });
                              }}
                              className="bg-transparent border-b border-transparent hover:border-white/20 focus:border-emerald-500 focus:outline-none w-16 text-white"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1">
                              <span className="text-gray-500">€</span>
                              <input 
                                type="number"
                                value={item.unit_price}
                                onChange={(e) => {
                                  if (!selectedInvoice) return;
                                  const val = Number(e.target.value);
                                  const newItems = [...selectedInvoice.items];
                                  newItems[idx].unit_price = val;
                                  newItems[idx].total = newItems[idx].quantity * val;
                                  const newSubtotal = newItems.reduce((sum: number, i: any) => sum + i.total, 0);
                                  setSelectedInvoice({
                                    ...selectedInvoice, 
                                    items: newItems,
                                    subtotal: newSubtotal,
                                    total_amount: newSubtotal * (1 + (selectedInvoice.tax_percentage / 100))
                                  });
                                }}
                                className="bg-transparent border-b border-transparent hover:border-white/20 focus:border-emerald-500 focus:outline-none w-20 text-white"
                              />
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right text-white font-mono">€{Number(item.total || 0).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right Column: Financials */}
            <div className="space-y-8">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
                <div className="space-y-4">
                  <label className="block text-[10px] text-gray-500 uppercase tracking-widest">Invoice Details</label>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <p className="text-[10px] text-gray-500 mb-1">Invoice Date</p>
                      <input 
                        type="date"
                        value={selectedInvoice?.invoice_date || ''}
                        onChange={(e) => setSelectedInvoice({...selectedInvoice, invoice_date: e.target.value})}
                        className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50"
                      />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 mb-1">Due Date</p>
                      <input 
                        type="date"
                        value={selectedInvoice?.due_date || ''}
                        onChange={(e) => setSelectedInvoice({...selectedInvoice, due_date: e.target.value})}
                        className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-6 border-t border-white/5">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="text-white font-mono">€{Number(selectedInvoice?.subtotal || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">VAT (%)</span>
                    <input 
                      type="number"
                      value={selectedInvoice?.tax_percentage || 0}
                      onChange={(e) => {
                        if (!selectedInvoice) return;
                        const newTax = Number(e.target.value);
                        setSelectedInvoice({
                          ...selectedInvoice, 
                          tax_percentage: newTax,
                          total_amount: selectedInvoice.subtotal * (1 + (newTax / 100))
                        });
                      }}
                      className="bg-black/20 border border-white/10 rounded px-2 py-1 w-16 text-right text-white font-mono"
                    />
                  </div>
                  <div className="flex justify-between pt-4 border-t border-white/10">
                    <span className="text-white font-bold">Total Amount</span>
                    <span className="text-xl font-bold text-emerald-500 font-mono">€{Number(selectedInvoice?.total_amount || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-6">
                <h4 className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-3">AI Auditor Status</h4>
                <div className="flex items-center gap-2">
                  {selectedInvoice.ai_check_status === 'ok' ? (
                    <>
                      <CheckCircle2 className="text-emerald-500" size={16} />
                      <span className="text-sm text-emerald-200">Verified & Matched</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="text-red-500" size={16} />
                      <span className="text-sm text-red-200">Discrepancy Detected</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="space-y-6">
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-6 flex items-start gap-4">
            <div className="p-3 bg-emerald-500/10 rounded-xl">
              <BrainCircuit className="text-emerald-500" size={24} />
            </div>
            <div>
              <h3 className="text-white font-bold mb-1">AI Invoice Auditor</h3>
              <p className="text-sm text-gray-400">Betsy is monitoring incoming invoices. {invoices.filter((i: any) => i.ai_check_status === 'error').length} discrepancies found.</p>
            </div>
          </div>

          <div className="bg-[#141414] border border-white/5 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-gray-500 border-b border-white/5">
                    <th className="px-6 py-4 font-medium">Invoice #</th>
                    <th className="px-6 py-4 font-medium">Supplier</th>
                    <th className="px-6 py-4 font-medium">Date</th>
                    <th className="px-6 py-4 font-medium text-right">Total</th>
                    <th className="px-6 py-4 font-medium">AI Status</th>
                    <th className="px-6 py-4 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {invoices.map((inv: any, idx: number) => (
                    <tr key={idx} className={`hover:bg-white/5 transition-colors ${inv.ai_check_status === 'error' ? 'bg-red-500/5' : ''}`}>
                      <td className="px-6 py-4 text-white font-mono">{inv.invoice_number}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {inv.vendor?.toLowerCase()?.includes('fastfootwear') && (
                            <img src="/FastFootwear.png" alt="FastFootwear" className="h-6 object-contain bg-white rounded px-1" />
                          )}
                          {inv.vendor?.toLowerCase()?.includes('globalsports') && (
                            <img src="/GlobalSports.png" alt="GlobalSports" className="h-6 object-contain bg-white rounded px-1" />
                          )}
                          {inv.vendor?.toLowerCase()?.includes('elitegear') && (
                            <img src="/EliteGear.png" alt="EliteGear" className="h-6 object-contain bg-white rounded px-1" />
                          )}
                          <span>{inv.vendor}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-500">{inv.invoice_date}</td>
                      <td className="px-6 py-4 text-right text-white font-mono">€{Number(inv.total_amount || 0).toFixed(2)}</td>
                      <td className="px-6 py-4">
                        {inv.ai_check_status === 'error' ? (
                          <div className="flex items-center gap-2 text-red-400">
                            <AlertTriangle size={14} />
                            <span className="text-xs font-bold uppercase">Error</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-emerald-500">
                            <CheckCircle2 size={14} />
                            <span className="text-xs font-bold uppercase">OK</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => downloadPDF(inv)}
                            className="p-1.5 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-all border border-white/5"
                            title="Download PDF"
                          >
                            <Download size={14} />
                          </button>
                          <button 
                            onClick={() => setSelectedInvoice(inv)}
                            className="px-4 py-1.5 bg-white/5 hover:bg-white/10 text-white text-xs font-medium rounded-lg transition-all border border-white/5"
                          >
                            View & Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
