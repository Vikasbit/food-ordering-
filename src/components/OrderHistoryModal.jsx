import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Printer, RotateCcw, FileText } from 'lucide-react';

export default function OrderHistoryModal({ isOpen, onClose, orders, onReorder }) {
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-3xl bg-[var(--cream)] border-4 border-black shadow-[10px_10px_0px_#111] overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* Header */}
          <div className="bg-[var(--yellow)] border-b-4 border-black p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white border-2 border-black flex items-center justify-center font-black text-xl shadow-[2px_2px_0px_#111]">
                📜
              </div>
              <div>
                <h2 className="font-extrabold text-xl tracking-tight text-black uppercase leading-none">
                  ORDER HISTORY & GST RECEIPTS
                </h2>
                <p className="text-xs font-bold text-gray-800 mt-0.5">VIEW PAST MEALS & PRINT OFFICIAL TAX INVOICES</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white border-2 border-black font-extrabold text-lg shadow-[2px_2px_0px_#111] hover:bg-black hover:text-white transition-all flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 space-y-4 overflow-y-auto flex-1">
            {/* Orders List View */}
            {orders.length === 0 ? (
              <div className="text-center p-12 bg-white border-3 border-black shadow-[4px_4px_0px_#111] space-y-2">
                <span className="text-4xl block mb-2">🛍️</span>
                <h3 className="font-black text-lg uppercase">NO PAST ORDERS YET</h3>
                <p className="text-xs font-bold text-gray-600">Your placed orders and official GST invoices will appear here.</p>
              </div>
            ) : (
              orders.map((order, idx) => (
                <div key={idx} className="bg-white border-3 border-black p-4 shadow-[4px_4px_0px_#111] space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-dashed border-gray-300 pb-3 gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-base text-[var(--red)]">{order.orderId || '#EN-849201'}</span>
                        <span className="bg-[var(--green)] text-white text-[10px] font-black px-2 py-0.5 border border-black uppercase">
                          DELIVERED ✅
                        </span>
                      </div>
                      <span className="text-xs font-bold text-gray-500">{order.date || 'Today, 2:15 PM'}</span>
                    </div>
                    <div className="font-black text-lg text-black">
                      ₹{order.grandTotal || order.total || 340}
                    </div>
                  </div>

                  {/* Items Summary */}
                  <div className="space-y-1 text-xs font-extrabold text-gray-800">
                    {order.items?.map((item, itemIdx) => (
                      <div key={itemIdx} className="flex justify-between">
                        <span>{item.quantity}x {item.name}</span>
                        <span>{item.price}</span>
                      </div>
                    ))}
                  </div>

                  {/* Actions Bar */}
                  <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t-2 border-black">
                    <button
                      onClick={() => setSelectedReceipt(order)}
                      className="flex-1 py-2 px-3 bg-[var(--yellow)] text-black border-2 border-black font-extrabold text-xs uppercase shadow-[2px_2px_0px_#111] hover:bg-black hover:text-white transition-all flex items-center justify-center gap-1.5"
                    >
                      <FileText className="w-4 h-4" /> PRINT GST INVOICE 🖨️
                    </button>
                    <button
                      onClick={() => {
                        onReorder(order.items);
                        onClose();
                      }}
                      className="flex-1 py-2 px-3 bg-[var(--red)] text-white border-2 border-black font-extrabold text-xs uppercase shadow-[2px_2px_0px_#111] hover:bg-[var(--green)] transition-all flex items-center justify-center gap-1.5"
                    >
                      <RotateCcw className="w-4 h-4" /> REORDER 🔄
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Close */}
          <div className="bg-white border-t-4 border-black p-3 text-center">
            <button
              onClick={onClose}
              className="w-full py-2.5 bg-black text-white font-black text-sm uppercase shadow-[3px_3px_0px_#111] hover:bg-[var(--red)] transition-all"
            >
              CLOSE HISTORY
            </button>
          </div>
        </motion.div>
      </div>

      {/* Printable GST Tax Receipt Sub-Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 print:p-0 print:bg-white">
          <div className="bg-white border-4 border-black p-6 shadow-[10px_10px_0px_#111] w-full max-w-xl max-h-[90vh] overflow-y-auto print:border-none print:shadow-none print:max-w-full">
            {/* Invoice Header */}
            <div className="border-b-4 border-black pb-4 mb-4 flex justify-between items-start">
              <div>
                <h1 className="font-black text-2xl text-[var(--red)] tracking-tight">EATnaked KITCHENS INDIA</h1>
                <p className="text-xs font-bold text-gray-700">Official GST Tax Invoice / Cash Memo</p>
                <p className="text-[10px] font-semibold text-gray-500">GSTIN: 07AAAAA0000A1Z5 • FSSAI Lic No: 10019011000123</p>
              </div>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="print:hidden w-8 h-8 bg-black text-white font-bold flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {/* Bill Info */}
            <div className="grid grid-cols-2 gap-4 text-xs font-extrabold mb-4 pb-4 border-b-2 border-dashed border-black">
              <div>
                <span className="text-gray-500 block text-[10px]">INVOICE NO:</span>
                <span>{selectedReceipt.orderId || '#EN-849201'}</span>
                <span className="text-gray-500 block text-[10px] mt-1">DATE & TIME:</span>
                <span>{selectedReceipt.date || '14 Aug 2026, 2:15 PM'}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[10px]">DELIVERY ADDRESS:</span>
                <span className="line-clamp-2">{selectedReceipt.location?.address || 'Connaught Place, New Delhi'}</span>
                <span className="text-gray-500 block text-[10px] mt-1">PAYMENT MODE:</span>
                <span className="text-[var(--green)]">{selectedReceipt.paymentMethod || 'UPI ONLINE'}</span>
              </div>
            </div>

            {/* Items Table */}
            <table className="w-full text-left text-xs font-extrabold mb-4 border-b-2 border-black">
              <thead>
                <tr className="border-b-2 border-black bg-gray-100 text-[10px]">
                  <th className="p-2">ITEM</th>
                  <th className="p-2 text-center">HSN</th>
                  <th className="p-2 text-center">QTY</th>
                  <th className="p-2 text-right">AMOUNT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {selectedReceipt.items?.map((item, idx) => (
                  <tr key={idx}>
                    <td className="p-2">{item.name}</td>
                    <td className="p-2 text-center text-gray-500">2106</td>
                    <td className="p-2 text-center">{item.quantity}</td>
                    <td className="p-2 text-right">{item.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Tax Breakdown */}
            <div className="space-y-1 text-xs font-bold text-right mb-6">
              <div className="flex justify-between">
                <span>Subtotal Taxable Value:</span>
                <span>₹{selectedReceipt.subtotal || 290}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>CGST (2.5%):</span>
                <span>₹{((selectedReceipt.gstAmount || 15) / 2).toFixed(1)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>SGST (2.5%):</span>
                <span>₹{((selectedReceipt.gstAmount || 15) / 2).toFixed(1)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery Fee:</span>
                <span>₹{selectedReceipt.deliveryFee || 0}</span>
              </div>
              <div className="flex justify-between font-black text-base text-black pt-2 border-t-2 border-black">
                <span>TOTAL PAID (INCL. TAXES):</span>
                <span className="text-[var(--red)]">₹{selectedReceipt.grandTotal || 305}</span>
              </div>
            </div>

            {/* Print & Close Action */}
            <div className="flex gap-2 print:hidden">
              <button
                onClick={handlePrint}
                className="flex-1 py-3 bg-[var(--yellow)] text-black border-3 border-black font-black text-xs uppercase shadow-[3px_3px_0px_#111] hover:bg-black hover:text-white transition-all flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" /> PRINT / SAVE TAX PDF 🖨️
              </button>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="py-3 px-4 bg-gray-200 text-black border-3 border-black font-extrabold text-xs uppercase shadow-[3px_3px_0px_#111]"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
