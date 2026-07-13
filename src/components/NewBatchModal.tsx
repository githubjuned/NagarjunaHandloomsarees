import { useState, FormEvent } from 'react';
import { X, HelpCircle, AlertTriangle } from 'lucide-react';
import { InventoryItem } from '../types';

interface NewBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newItemData: {
    name: string;
    sku: string;
    category: string;
    available: number;
    specs: string;
    threshold: number;
    imagePreset: number;
    price: number;
  }) => void;
  triggerToast: (msg: string, type?: 'success' | 'error') => void;
}

const IMAGE_PRESETS = [
  '/images/saree1.jpg',
  '/images/saree3.jpg',
  '/images/saree2.jpg'
];

export default function NewBatchModal({ isOpen, onClose, onSave, triggerToast }: NewBatchModalProps) {
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('SILK-COTTON GADWAL');
  const [available, setAvailable] = useState<number>(10);
  const [specs, setSpecs] = useState('');
  const [threshold, setThreshold] = useState<number>(5);
  const [imagePreset, setImagePreset] = useState(0);
  const [price, setPrice] = useState<number>(14500);

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      triggerToast("Please provide a name for this saree masterpiece.", "error");
      return;
    }
    if (!sku.trim()) {
      triggerToast("Please assign a unique SKU format tag.", "error");
      return;
    }

    onSave({
      name: name.trim(),
      sku: sku.trim().toUpperCase(),
      category,
      available: Math.max(0, available),
      specs: specs.trim() || 'Handloom Craft Saree',
      threshold: Math.max(1, threshold),
      imagePreset,
      price: Math.max(0, price)
    });

    // Reset fields
    setName('');
    setSku('');
    setCategory('SILK-COTTON GADWAL');
    setAvailable(10);
    setSpecs('');
    setThreshold(5);
    setImagePreset(0);
    setPrice(14500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Background overlay */}
      <div 
        className="absolute inset-0 bg-primary/25 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal card */}
      <div className="relative w-full max-w-lg bg-surface p-6 md:p-8 rounded-2xl shadow-2xl border border-outline-variant animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="font-display text-2xl font-bold text-primary">Introduce New Batch</h3>
            <p className="font-sans text-xs text-on-surface-variant mt-1">
              Add a newly received artisanal handloom batch into the active master catalog.
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-surface-container rounded-full text-on-surface-variant cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-sans text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                Saree Name
              </label>
              <input 
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Royal Peacock Saree"
                className="w-full bg-surface-container-low border border-outline-variant rounded-xl font-sans text-xs font-semibold py-3 px-4 outline-none focus:ring-2 focus:ring-primary-container"
                required
              />
            </div>
            
            <div>
              <label className="block font-sans text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                SKU Identifier Code
              </label>
              <input 
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="e.g. GSLK-2024-01"
                className="w-full bg-surface-container-low border border-outline-variant rounded-xl font-sans text-xs font-semibold py-3 px-4 outline-none focus:ring-2 focus:ring-primary-container"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-sans text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                Weaving Category
              </label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant rounded-xl font-sans text-xs font-bold py-3 px-4 outline-none cursor-pointer focus:ring-2 focus:ring-primary-container"
              >
                <option value="Silk Gadwal">Silk Gadwal</option>
                <option value="Sico Gadwal">Sico Gadwal</option>
                <option value="Heritage Collection">Heritage Collection</option>
                <option value="Pure Kuttam Silk">Pure Kuttam Silk</option>
                <option value="Vintage Borders">Vintage Borders</option>
                <option value="Silk-Cotton Gadwal">Silk-Cotton Gadwal</option>
              </select>
            </div>

            <div>
              <label className="block font-sans text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                Material Specifications
              </label>
              <input 
                type="text"
                value={specs}
                onChange={(e) => setSpecs(e.target.value)}
                placeholder="e.g. Pure Silk • 100 Count"
                className="w-full bg-surface-container-low border border-outline-variant rounded-xl font-sans text-xs font-semibold py-3 px-4 outline-none focus:ring-2 focus:ring-primary-container"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-sans text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                Retail Price (₹ INR)
              </label>
              <input 
                type="number"
                min="0"
                value={price}
                onChange={(e) => setPrice(parseInt(e.target.value, 10) || 0)}
                placeholder="e.g. 14500"
                className="w-full bg-surface-container-low border border-outline-variant rounded-xl font-sans text-xs font-bold py-3 px-4 outline-none focus:ring-2 focus:ring-primary-container"
                required
              />
            </div>

            <div>
              <label className="block font-sans text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                Low Stock Threshold alert
              </label>
              <input 
                type="number"
                min="1"
                value={threshold}
                onChange={(e) => setThreshold(parseInt(e.target.value, 10) || 1)}
                className="w-full bg-surface-container-low border border-outline-variant rounded-xl font-sans text-xs font-bold py-3 px-4 outline-none focus:ring-2 focus:ring-primary-container"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-sans text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                Initial Stock Quantity
              </label>
              <input 
                type="number"
                min="0"
                value={available}
                onChange={(e) => setAvailable(parseInt(e.target.value, 10) || 0)}
                className="w-full bg-surface-container-low border border-outline-variant rounded-xl font-sans text-xs font-bold py-3 px-4 outline-none focus:ring-2 focus:ring-primary-container"
                required
              />
            </div>
          </div>

          {/* Saree Image Preset Selection */}
          <div>
            <label className="block font-sans text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">
              Saree Pattern Design Presets
            </label>
            <div className="grid grid-cols-3 gap-3">
              {IMAGE_PRESETS.map((url, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setImagePreset(idx)}
                  className={`relative aspect-[3/4] rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                    imagePreset === idx 
                      ? 'border-primary ring-2 ring-primary-fixed' 
                      : 'border-outline-variant hover:opacity-85'
                  }`}
                >
                  <img src={url} alt={`Preset Saree ${idx + 1}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  {imagePreset === idx && (
                    <div className="absolute top-1 right-1 bg-primary text-white rounded-full p-0.5">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t border-outline-variant/50">
            <button
              type="submit"
              className="flex-1 py-3 bg-primary-container text-white rounded-xl font-sans text-xs font-bold shadow-lg hover:opacity-95 active:scale-95 transition-all cursor-pointer"
            >
              SAVE MASTER SKU
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
