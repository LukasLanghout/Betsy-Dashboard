// Dit is de facturen tab. Hier checkt Betsy (onze AI) of de facturen kloppen met de bestellingen.
// Als er iets niet klopt, krijgen we een rode waarschuwing.
// Ik heb ook een PDF download functie gemaakt met jsPDF, dat was best wel wat uitzoekwerk!

import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, AlertTriangle, CheckCircle2, BrainCircuit, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function InvoicesTab({ invoices, orders, selectedInvoice, setSelectedInvoice, updateInvoice, addToast }: any) {
  
  // We filteren de orders die bij deze leverancier horen
  const vendorOrders = React.useMemo(() => {
    if (!selectedInvoice || !orders) return [];
    const vendorName = selectedInvoice.vendor?.toLowerCase()?.replace(/\s+/g, '');
    return orders.filter((o: any) => {
      const orderVendor = (o.suppliers?.name || o.supplier_name || '').toLowerCase()?.replace(/\s+/g, '');
      return orderVendor === vendorName || orderVendor.includes(vendorName) || vendorName.includes(orderVendor);
    });
  }, [selectedInvoice, orders]);

  // Hulpfunctie om plaatjes te laden voor de PDF (logo's van leveranciers)
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
          reject(new Error('Kon canvas context niet ophalen'));
        }
      };
      img.onerror = reject;
      img.src = url;
    });
  };

  // Functie om een mooie PDF factuur te genereren
  const downloadPDF = async (invoice: any) => {
    if (addToast) addToast('PDF genereren...', 'info');
    const doc = new jsPDF();
    
    const vendorName = invoice.vendor || 'Onbekende Leverancier';
    const emerald = [16, 185, 129];
    const dark = [20, 20, 20];
    const textDark = [40, 40, 40];
    const grayLabel = [150, 150, 150];
    const lightBg = [248, 248, 248];
    
    // 1. HEADER BLOK
    doc.setFillColor(dark[0], dark[1], dark[2]);
    doc.rect(0, 0, 210, 35, 'F');
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(emerald[0], emerald[1], emerald[2]);
    doc.text('BETSY AI', 14, 22);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(120, 120, 120);
    doc.text('SportWinkel #42 | Lucas Manager', 196, 22, { align: 'right' });
    
    // 2. FACTUUR TITEL SECTIE
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(28);
    doc.setTextColor(dark[0], dark[1], dark[2]);
    doc.text('FACTUUR', 14, 60);
    
    doc.setFillColor(emerald[0], emerald[1], emerald[2]);
    doc.rect(14, 65, 182, 1, 'F');
    
    doc.setFontSize(12);
    doc.setTextColor(emerald[0], emerald[1], emerald[2]);
    doc.text(`#${invoice.invoice_number}`, 196, 60, { align: 'right' });
    
    // 3. INFO BLOK (twee kolommen)
    // Links: Datum gegevens
    doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
    doc.roundedRect(14, 75, 80, 35, 2, 2, 'F');
    
    doc.setFontSize(8);
    doc.setTextColor(grayLabel[0], grayLabel[1], grayLabel[2]);
    doc.text('FACTUURDATUM', 20, 85);
    doc.text('VERVALDATUM', 20, 95);
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.text(invoice.invoice_date || 'N/A', 50, 85);
    doc.text(invoice.due_date || 'N/A', 50, 95);
    
    // Rechts: Leverancier blok
    doc.setFillColor(emerald[0], emerald[1], emerald[2]);
    doc.rect(130, 75, 3, 35, 'F');
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.text(vendorName, 138, 82);
    
    // Logo proberen te laden
    const normalizedVendor = vendorName.toLowerCase().replace(/\s+/g, '');
    let logoUrl = null;
    if (normalizedVendor.includes('fastfootwear')) logoUrl = '/FastFootwear.png';
    else if (normalizedVendor.includes('globalsports')) logoUrl = '/GlobalSports.png';
    else if (normalizedVendor.includes('elitegear')) logoUrl = '/EliteGear.png';

    try {
      if (logoUrl) {
        const base64Img = await loadImage(logoUrl);
        doc.addImage(base64Img, 'PNG', 138, 85, 45, 15);
      } else {
        throw new Error('Geen logo gevonden');
      }
    } catch (e) {
      doc.setFontSize(8);
      doc.setTextColor(grayLabel[0], grayLabel[1], grayLabel[2]);
      doc.text(`${vendorName} Partner`, 138, 90);
    }
    
    // 4. ONTVANGER BLOK
    doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
    doc.roundedRect(14, 120, 182, 30, 2, 2, 'F');
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(grayLabel[0], grayLabel[1], grayLabel[2]);
    doc.text('FACTUUR NAAR', 20, 128);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.text('SportWinkels B.V.', 20, 135);
    doc.text('Studentenweg 42, 3584 AA Utrecht', 20, 142);

    // 5. PRODUCTTABEL
    const tableColumn = ["Product Naam", "Aantal", "Stukprijs", "Totaal"];
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
      startY: 160,
      head: [tableColumn],
      body: tableRows,
      theme: 'striped',
      headStyles: { 
        fillColor: [emerald[0], emerald[1], emerald[2]],
        fontSize: 10,
        halign: 'left'
      },
      columnStyles: {
        3: { halign: 'right' }
      },
      styles: { fontSize: 9, cellPadding: 7 },
      alternateRowStyles: { fillColor: [245, 250, 248] }
    });

    // 6. TOTALEN BLOK
    const finalY = (doc as any).lastAutoTable.finalY || 160;
    
    // Draw a subtle line at the end of the table
    doc.setDrawColor(200, 200, 200);
    doc.line(14, finalY, 196, finalY);
    
    doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
    doc.roundedRect(130, finalY + 10, 66, 35, 2, 2, 'F');
    
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text('Subtotaal:', 136, finalY + 18);
    doc.text(`€${Number(invoice.subtotal || 0).toFixed(2)}`, 190, finalY + 18, { align: 'right' });
    
    doc.text(`BTW (${invoice.tax_percentage || 0}%):`, 136, finalY + 24);
    const taxAmount = (invoice.subtotal || 0) * ((invoice.tax_percentage || 0) / 100);
    doc.text(`€${taxAmount.toFixed(2)}`, 190, finalY + 24, { align: 'right' });
    
    doc.setFillColor(emerald[0], emerald[1], emerald[2]);
    doc.roundedRect(130, finalY + 28, 66, 12, 1, 1, 'F');
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.text('TOTAAL', 136, finalY + 36);
    doc.text(`€${Number(invoice.total_amount || 0).toFixed(2)}`, 190, finalY + 36, { align: 'right' });

    // 7. AI VALIDATIE BADGE
    doc.setDrawColor(emerald[0], emerald[1], emerald[2]);
    doc.setLineWidth(0.5);
    doc.roundedRect(14, finalY + 15, 80, 16, 2, 2, 'S');
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(emerald[0], emerald[1], emerald[2]);
    doc.text('✓ AI Gevalideerd – Betsy AI', 18, finalY + 23);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(grayLabel[0], grayLabel[1], grayLabel[2]);
    doc.text(`Geverifieerd op: ${new Date().toLocaleDateString('nl-NL')}`, 18, finalY + 28);

    // 8. FOOTER
    doc.setFillColor(dark[0], dark[1], dark[2]);
    doc.rect(0, 278, 210, 19, 'F');
    
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text('betsy-dashboard.vercel.app', 14, 288);
    doc.text(`Factuur ${invoice.invoice_number}`, 196, 288, { align: 'right' });

    // PDF opslaan
    doc.save(`Factuur_${invoice.invoice_number || 'Concept'}.pdf`);
  };

  // We proberen automatisch een order te vinden die bij deze factuur past voor weergave
  const getSuggestedOrderId = (inv: any) => {
    if (inv.order_id) return `#PO-${String(inv.order_id).padStart(4, '0')}`;
    if (inv.po_reference && inv.po_reference !== '-' && inv.po_reference !== '') return inv.po_reference;

    const vendorName = (inv.vendor || '').toLowerCase().replace(/\s+/g, '');
    const invDate = new Date(inv.invoice_date || inv.date).toLocaleDateString('nl-NL');
    const matchingOrder = orders.find((o: any) => {
      const orderVendor = (o.suppliers?.name || o.supplier_name || '').toLowerCase().replace(/\s+/g, '');
      const orderDate = new Date(o.order_date).toLocaleDateString('nl-NL');
      return orderVendor === vendorName && orderDate === invDate;
    });

    return matchingOrder ? `#PO-${String(matchingOrder.id).padStart(4, '0')} (Auto)` : '-';
  };

  return (
    <div className="space-y-6">
      {selectedInvoice ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#141414] border border-white/10 rounded-2xl overflow-hidden"
        >
          {/* Factuur Detail Header */}
          <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSelectedInvoice(null)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <ArrowRight className="rotate-180" size={20} />
              </button>
              <h3 className="text-xl font-bold text-white">Factuur Detail: {selectedInvoice?.invoice_number}</h3>
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
                Opslaan & AI Validatie
              </button>
            </div>
          </div>

          <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Linker kolom: Info */}
            <div className="lg:col-span-2 space-y-8">
              {selectedInvoice.ai_check_status === 'error' && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3">
                  <AlertTriangle className="text-red-500 shrink-0" size={20} />
                  <div>
                    <p className="text-red-500 font-bold text-sm">AI Agent Alert: Afwijking Gevonden</p>
                    <p className="text-red-400/80 text-xs mt-1">{selectedInvoice?.ai_error_message}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="block text-[10px] text-gray-500 uppercase tracking-widest">Leverancier Informatie</label>
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
                        <p className="text-gray-500 text-xs mt-1">B2B Geverifieerde Partner</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="block text-[10px] text-gray-500 uppercase tracking-widest">Inkooporder Referentie (Bestel ID)</label>
                  <div className="relative">
                    <select 
                      value={selectedInvoice?.order_id || ''}
                      onChange={(e) => {
                        const orderId = e.target.value;
                        if (!orderId) {
                          setSelectedInvoice({...selectedInvoice, order_id: null, po_reference: ''});
                          return;
                        }
                        const order = vendorOrders.find((o: any) => o.id.toString() === orderId);
                        setSelectedInvoice({
                          ...selectedInvoice, 
                          order_id: Number(orderId), 
                          po_reference: `PO-${orderId}`
                        });
                      }}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 appearance-none cursor-pointer"
                    >
                      <option value="" className="bg-[#141414]">Selecteer een Inkooporder</option>
                      {vendorOrders.map((o: any) => (
                        <option key={o.id} value={o.id} className="bg-[#141414]">
                          PO-{o.id} - {o.products?.name} ({o.quantity} stuks) - {new Date(o.order_date).toLocaleDateString('nl-NL')}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                      <ArrowRight className="rotate-90" size={16} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-[10px] text-gray-500 uppercase tracking-widest">Factuur Items (Bewerkbaar)</label>
                <div className="bg-white/5 rounded-xl border border-white/5 overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="text-gray-500 border-b border-white/5">
                        <th className="px-6 py-4 font-medium min-w-[250px]">Product Naam</th>
                        <th className="px-6 py-4 font-medium">Aantal</th>
                        <th className="px-6 py-4 font-medium">Stukprijs</th>
                        <th className="px-6 py-4 font-medium text-right">Totaal</th>
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

            {/* Rechter kolom: Financiën */}
            <div className="space-y-8">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
                <div className="space-y-4">
                  <label className="block text-[10px] text-gray-500 uppercase tracking-widest">Factuur Details</label>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <p className="text-[10px] text-gray-500 mb-1">Factuurdatum</p>
                      <input 
                        type="date"
                        value={selectedInvoice?.invoice_date || ''}
                        onChange={(e) => setSelectedInvoice({...selectedInvoice, invoice_date: e.target.value})}
                        className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50"
                      />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 mb-1">Vervaldatum</p>
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
                    <span className="text-gray-500">Subtotaal</span>
                    <span className="text-white font-mono">€{Number(selectedInvoice?.subtotal || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">BTW (%)</span>
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
                    <span className="text-white font-bold">Totaalbedrag</span>
                    <span className="text-xl font-bold text-emerald-500 font-mono">€{Number(selectedInvoice?.total_amount || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </motion.div>
      ) : (
        <div className="space-y-6">
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-6 flex items-start gap-4">
            <div className="p-2 bg-emerald-500/10 rounded-xl flex items-center justify-center">
              <img src="/betsy-logo.png" alt="Betsy AI" className="w-8 h-8 object-contain" onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (target.src.endsWith('.png')) {
                  target.src = '/betsy-logo.jpg';
                } else if (target.src.endsWith('.jpg')) {
                  target.src = '/betsy-logo.jpeg';
                } else {
                  target.style.display = 'none';
                  target.nextElementSibling?.classList.remove('hidden');
                }
              }} />
              <BrainCircuit className="hidden text-emerald-500" size={24} />
            </div>
            <div>
              <h3 className="text-white font-bold mb-1">AI Factuur Auditor</h3>
              <p className="text-sm text-gray-400">Betsy controleert inkomende facturen. {invoices.filter((i: any) => i.ai_check_status === 'error').length} afwijkingen gevonden.</p>
            </div>
          </div>

          <div className="bg-[#141414] border border-white/5 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-gray-500 border-b border-white/5">
                    <th className="px-6 py-4 font-medium">Factuur #</th>
                    <th className="px-6 py-4 font-medium">Inkooporder (Bestel ID)</th>
                    <th className="px-6 py-4 font-medium">Leverancier</th>
                    <th className="px-6 py-4 font-medium">Datum</th>
                    <th className="px-6 py-4 font-medium text-right">Totaal</th>
                    <th className="px-6 py-4 font-medium">AI Status</th>
                    <th className="px-6 py-4 font-medium text-right">Actie</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {invoices.map((inv: any, idx: number) => (
                    <tr key={idx} className={`hover:bg-white/5 transition-colors ${inv.ai_check_status === 'error' ? 'bg-red-500/5' : ''}`}>
                      <td className="px-6 py-4 text-white font-mono">{inv.invoice_number}</td>
                      <td className="px-6 py-4 text-gray-400 font-mono text-xs">
                        {getSuggestedOrderId(inv)}
                      </td>
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
                            <span className="text-xs font-bold uppercase">Fout</span>
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
                            Bekijk & Bewerk
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
