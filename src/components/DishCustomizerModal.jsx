import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Flame, Check, Utensils, MessageSquare } from 'lucide-react';

const SPICE_LEVELS = [
  { id: 'mild', label: 'Mild 🌶️', desc: 'Gentle aromatic spices' },
  { id: 'medium', label: 'Medium 🌶️🌶️', desc: 'Authentic balanced heat' },
  { id: 'fiery', label: 'Fiery Kashmiri 🌶️🌶️🌶️', desc: 'Bold, rich & spicy' }
];

const PORTIONS = [
  { id: 'half', label: 'Half Portion', extra: -50, desc: 'Serves 1 person' },
  { id: 'full', label: 'Full Portion', extra: 0, desc: 'Serves 1-2 persons' },
  { id: 'family', label: 'Family Bucket', extra: 180, desc: 'Serves 3-4 persons' }
];

const EXTRAS_OPTIONS = [
  { id: 'paneer', label: 'Extra Paneer / Chicken Cubes', price: 60 },
  { id: 'gravy', label: 'Extra Velvet Butter Gravy', price: 40 },
  { id: 'naan', label: 'Fresh Tandoori Garlic Naan Pair', price: 80 },
  { id: 'chutney', label: 'Mint & Tamarind Chutney Dip', price: 25 }
];

export default function DishCustomizerModal({ dish, isOpen, onClose, onAddToCart }) {
  const [spiceLevel, setSpiceLevel] = useState('medium');
  const [portion, setPortion] = useState('full');
  const [selectedExtras, setSelectedExtras] = useState([]);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [quantity, setQuantity] = useState(1);

  if (!isOpen || !dish) return null;

  const basePriceNum = parseFloat(dish.price?.toString().replace(/[^0-9.]/g, '') || '290');
  const portionDiff = PORTIONS.find(p => p.id === portion)?.extra || 0;
  const extrasTotal = selectedExtras.reduce((acc, extraId) => {
    const item = EXTRAS_OPTIONS.find(e => e.id === extraId);
    return acc + (item ? item.price : 0);
  }, 0);

  const unitPrice = Math.max(100, basePriceNum + portionDiff + extrasTotal);
  const totalPrice = unitPrice * quantity;

  const toggleExtra = (extraId) => {
    if (selectedExtras.includes(extraId)) {
      setSelectedExtras(selectedExtras.filter(id => id !== extraId));
    } else {
      setSelectedExtras([...selectedExtras, extraId]);
    }
  };

  const handleConfirmAdd = () => {
    const spiceObj = SPICE_LEVELS.find(s => s.id === spiceLevel);
    const portionObj = PORTIONS.find(p => p.id === portion);
    const extrasObj = selectedExtras.map(id => EXTRAS_OPTIONS.find(e => e.id === id)?.label);

    const customizedItem = {
      ...dish,
      id: `${dish.id || dish.name}-${spiceLevel}-${portion}-${selectedExtras.join('-')}`,
      name: `${dish.name} (${portionObj?.label})`,
      price: `₹${totalPrice.toFixed(0)}`,
      customizations: {
        spice: spiceObj?.label,
        portion: portionObj?.label,
        extras: extrasObj,
        instructions: specialInstructions
      },
      quantity
    };

    onAddToCart(customizedItem);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-xl bg-[var(--cream)] border-4 border-black shadow-[10px_10px_0px_#111] overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="bg-[var(--yellow)] border-b-4 border-black p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white border-2 border-black flex items-center justify-center font-black text-xl shadow-[2px_2px_0px_#111]">
                ⚙️
              </div>
              <div>
                <h2 className="font-extrabold text-xl tracking-tight text-black uppercase leading-none">
                  CUSTOMIZE DISH
                </h2>
                <p className="text-xs font-bold text-gray-800 mt-0.5">TAILOR YOUR SPICES & ADD-ONS</p>
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
            {/* Dish Header Info */}
            <div className="bg-white border-3 border-black p-3.5 shadow-[3px_3px_0px_#111] flex items-center gap-3">
              <img
                src={dish.image}
                alt={dish.name}
                className="w-20 h-20 object-cover border-2 border-black shadow-[2px_2px_0px_#111]"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={`w-3.5 h-3.5 border border-black rounded-full flex items-center justify-center ${dish.isVeg ? 'bg-green-600' : 'bg-red-600'}`}>
                    <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                  </span>
                  <h3 className="font-extrabold text-lg text-black leading-tight">{dish.name}</h3>
                </div>
                {dish.hindiName && (
                  <span className="text-xs font-bold text-[var(--red)] block">{dish.hindiName}</span>
                )}
                <p className="text-xs text-gray-600 font-semibold line-clamp-1 mt-0.5">{dish.desc || dish.description}</p>
                <div className="font-black text-sm text-[var(--red)] mt-1">₹{basePriceNum} BASE PRICE</div>
              </div>
            </div>

            {/* Spice Level Section */}
            <div>
              <div className="text-xs font-black uppercase text-gray-800 mb-1.5 flex items-center gap-1">
                <Flame className="w-4 h-4 text-[var(--red)]" /> SELECT SPICE LEVEL
              </div>
              <div className="grid grid-cols-3 gap-2">
                {SPICE_LEVELS.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSpiceLevel(s.id)}
                    className={`p-2.5 border-2 border-black text-left shadow-[2px_2px_0px_#111] transition-all ${
                      spiceLevel === s.id
                        ? 'bg-[var(--red)] text-white'
                        : 'bg-white text-black hover:bg-[var(--yellow)]'
                    }`}
                  >
                    <div className="font-black text-xs">{s.label}</div>
                    <div className={`text-[10px] font-bold ${spiceLevel === s.id ? 'text-gray-100' : 'text-gray-500'}`}>
                      {s.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Portion Size Section */}
            <div>
              <div className="text-xs font-black uppercase text-gray-800 mb-1.5 flex items-center gap-1">
                <Utensils className="w-4 h-4 text-black" /> PORTION SIZE
              </div>
              <div className="grid grid-cols-3 gap-2">
                {PORTIONS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPortion(p.id)}
                    className={`p-2.5 border-2 border-black text-left shadow-[2px_2px_0px_#111] transition-all ${
                      portion === p.id
                        ? 'bg-[var(--yellow)] text-black font-extrabold'
                        : 'bg-white text-black hover:bg-gray-100'
                    }`}
                  >
                    <div className="font-black text-xs uppercase">{p.label}</div>
                    <div className="text-[10px] font-bold text-gray-600">{p.desc}</div>
                    <div className="text-[10px] font-extrabold text-[var(--red)] mt-0.5">
                      {p.extra === 0 ? 'SAME PRICE' : p.extra > 0 ? `+₹${p.extra}` : `-₹${Math.abs(p.extra)}`}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Add-ons & Extras Checkboxes */}
            <div>
              <div className="text-xs font-black uppercase text-gray-800 mb-1.5 flex items-center gap-1">
                <Plus className="w-4 h-4 text-[var(--green)]" /> ADD EXTRAS & BREADS
              </div>
              <div className="space-y-1.5">
                {EXTRAS_OPTIONS.map((extra) => {
                  const isChecked = selectedExtras.includes(extra.id);
                  return (
                    <button
                      key={extra.id}
                      onClick={() => toggleExtra(extra.id)}
                      className={`w-full p-2.5 border-2 border-black flex items-center justify-between shadow-[2px_2px_0px_#111] transition-all text-xs font-extrabold ${
                        isChecked ? 'bg-green-50 border-green-800' : 'bg-white hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 border-2 border-black flex items-center justify-center ${isChecked ? 'bg-[var(--green)] text-white' : 'bg-white'}`}>
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span>{extra.label}</span>
                      </div>
                      <span className="text-[var(--red)]">+₹{extra.price}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Cooking Notes */}
            <div>
              <div className="text-xs font-black uppercase text-gray-800 mb-1 flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5" /> SPECIAL INSTRUCTIONS FOR CHEF
              </div>
              <textarea
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="e.g. Less oil, make sauce extra thick, no onion/garlic..."
                rows={2}
                className="w-full p-2.5 bg-white border-2 border-black text-xs font-bold focus:outline-none shadow-[2px_2px_0px_#111]"
              />
            </div>
          </div>

          {/* Footer Quantity & Add to Cart Action */}
          <div className="bg-white border-t-4 border-black p-4 flex items-center justify-between gap-4">
            <div className="flex items-center border-3 border-black bg-[var(--cream)] shadow-[2px_2px_0px_#111]">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 border-r-2 border-black font-black text-lg hover:bg-black hover:text-white transition-all flex items-center justify-center"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-10 text-center font-black text-base">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 border-l-2 border-black font-black text-lg hover:bg-black hover:text-white transition-all flex items-center justify-center"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={handleConfirmAdd}
              className="flex-1 py-3 px-4 bg-[var(--yellow)] text-black border-3 border-black font-black text-sm uppercase shadow-[4px_4px_0px_#111] hover:bg-[var(--red)] hover:text-white transition-all flex items-center justify-between"
            >
              <span>ADD TO BAG 🛍️</span>
              <span>₹{totalPrice.toFixed(0)} →</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
