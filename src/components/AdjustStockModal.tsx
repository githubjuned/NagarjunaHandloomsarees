import { useState, useEffect, FormEvent } from 'react';
import { X } from 'lucide-react';
import { InventoryItem, AdjustmentType } from '../types';

interface AdjustStockModalProps {
  item: InventoryItem | null;
  onClose: () => void;
  onSave: (
    itemId: string,
    adjustType: AdjustmentType,
    qty: number,
    note: string
  ) => void;
  triggerToast: (msg: string, type?: 'success' | 'error') => void;
}

export default function AdjustStockModal({
  item,
  onClose,
  onSave,
  triggerToast
}: AdjustStockModalProps) {
  const [adjustType, setAdjustType] = useState<AdjustmentType>('RESTOCK (+)');
  const [adjustQty, setAdjustQty] = useState<number>(1);
  const [adjustNote, setAdjustNote] = useState('');

  // Reset fields when active item changes
  useEffect(() => {
    if (item) {
      setAdjustType('RESTOCK (+)');
      setAdjustQty(1);
      setAdjustNote('');
    }
  }, [item]);

  if (!item) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (adjustQty <= 0) {
      triggerToast("Adjustment quantity must be greater than zero", "error");
      return;
    }

    onSave(item.id, adjustType, adjustQty, adjustNote.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Background overlay */}
      <div 
        className="absolute inset-0 bg-primary/25 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal card */}
      <div className="relative w-full max-w-md bg-surface p-6 md:p-8 rounded-2xl shadow-2xl border border-outline-variant animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="font-display text-2xl font-bold text-primary">Update Saree Stock</h3>
            <p className="font-sans text-xs text-on-surface-variant mt-1">
              Adjust current inventory level for this handloom masterpiece.
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-surface-container rounded-full text-on-surface-variant cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant flex justify-between items-center">
            <div>
              <p className="font-sans text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-0.5">Active Master Variant</p>
              <h4 className="font-display text-base font-bold text-primary truncate max-w-[220px]" title={item.name}>
                {item.name}
              </h4>
              <p className="font-sans text-[11px] font-medium text-on-surface-variant opacity-75">{item.sku}</p>
            </div>
            <div className="text-right">
              <p className="font-sans text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-0.5">Current Stock</p>
              <div className="text-2xl font-display font-bold text-primary">
                {item.available} <span className="text-[10px] font-sans text-on-surface-variant">units</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-sans text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                Adjustment Type
              </label>
              <select 
                value={adjustType}
                onChange={(e) => setAdjustType(e.target.value as AdjustmentType)}
                className="w-full bg-surface-container border border-outline-variant rounded-xl font-sans text-xs font-bold py-3 px-4 outline-none cursor-pointer focus:ring-2 focus:ring-primary-container"
              >
                <option value="RESTOCK (+)">RESTOCK (+)</option>
                <option value="DAMAGE (-)">DAMAGE (-)</option>
                <option value="RETURN (+)">RETURN (+)</option>
                <option value="SALE (-)">SALE (-)</option>
              </select>
            </div>

            <div>
              <label className="block font-sans text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                Quantity Adjuster
              </label>
              <input 
                type="number"
                min="1"
                value={adjustQty}
                onChange={(e) => setAdjustQty(parseInt(e.target.value, 10) || 1)}
                className="w-full bg-surface-container border border-outline-variant rounded-xl font-sans text-xs font-bold py-3 px-4 outline-none focus:ring-2 focus:ring-primary-container"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-sans text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
              Reason / Transaction Note
            </label>
            <textarea 
              value={adjustNote}
              onChange={(e) => setAdjustNote(e.target.value)}
              placeholder="e.g. Received shipment from weavers, damage transit etc..."
              rows={2}
              className="w-full bg-surface-container border border-outline-variant rounded-xl font-sans text-xs font-medium p-3 outline-none focus:ring-2 focus:ring-primary-container"
            />
          </div>

          <div className="flex gap-4 pt-2">
            <button
              type="submit"
              className="flex-1 py-3 bg-primary-container text-white rounded-xl font-sans text-xs font-bold shadow-lg hover:opacity-95 active:scale-95 transition-all cursor-pointer"
            >
              SAVE CHANGES
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-outline-variant text-on-surface-variant rounded-xl font-sans text-xs font-bold hover:bg-surface-container-low transition-all cursor-pointer"
            >
              CANCEL
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
