import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Flame, Check, Utensils, MessageSquare } from 'lucide-react';

const SPICE_LEVELS = [
  { id: 'mild', label: 'Mild 🌶️', desc: 'Gentle aromatic herbs & spices' },
  { id: 'medium', label: 'Medium 🌶️🌶️', desc: 'Authentic balanced heat' },
  { id: 'fiery', label: 'Extra Spicy 🌶️🌶️🌶️', desc: 'Bold, fiery house peppers' }
];

const PORTIONS = [
  { id: 'regular', label: 'Regular Size', extra: 0, desc: 'Standard single portion' },
  { id: 'double', label: 'Double Size / Upgraded', extra: 3.50, desc: 'Extra meat & double cheese' },
  { id: 'combo', label: 'Make It A Combo (+ Fries & Drink)', extra: 4.99, desc: 'Includes drink & crisp fries' }
];

const EXTRAS_OPTIONS = [
  { id: 'cheese', label: 'Melted Cheddar Cheese Slice', price: 1.50 },
  { id: 'bacon', label: 'Crispy Smoked Bacon Rashers', price: 2.25 },
  { id: 'sauce', label: 'House Truffle Garlic Aioli Dip', price: 0.99 },
  { id: 'jalapenos', label: 'Pickled Fire Jalapeños', price: 0.85 }
];

export default function DishCustomizerModal({ dish, isOpen, onClose, onAddToCart }) {
  const [spiceLevel, setSpiceLevel] = useState('medium');
  const [portion, setPortion] = useState('regular');
  const [selectedExtras, setSelectedExtras] = useState([]);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [quantity, setQuantity] = useState(1);

  if (!isOpen || !dish) return null;

  const basePriceNum = parseFloat(dish.price?.toString().replace(/[^0-9.]/g, '') || '8.99');
  const portionDiff = PORTIONS.find(p => p.id === portion)?.extra || 0;
  const extrasTotal = selectedExtras.reduce((acc, extraId) => {
    const item = EXTRAS_OPTIONS.find(e => e.id === extraId);
    return acc + (item ? item.price : 0);
  }, 0);

  const unitPrice = Math.max(1, basePriceNum + portionDiff + extrasTotal);
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
      price: `$${unitPrice.toFixed(2)}`,
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
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(28, 25, 23, 0.6)',
          backdropFilter: 'blur(8px)',
          padding: '1rem'
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '560px',
            backgroundColor: '#FFFFFF',
            borderRadius: '24px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid #ECE7DF',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: '90vh'
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid #EFEAE2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#FAF5EE'
            }}
          >
            <div>
              <h3
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.35rem',
                  fontWeight: 700,
                  color: 'var(--brand-dark)',
                  margin: 0
                }}
              >
                Customize Your Dish
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#78716C', margin: '2px 0 0' }}>
                Tailor spice levels, portion size & gourmet add-ons
              </p>
            </div>

            <button
              onClick={onClose}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: '#FFFFFF',
                border: '1px solid #ECE7DF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#78716C'
              }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Dish Header Info */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '1rem',
                borderRadius: '16px',
                backgroundColor: '#FDFBF7',
                border: '1px solid #EFEAE2'
              }}
            >
              <img
                src={dish.image || dish.image_url}
                alt={dish.name}
                style={{
                  width: '76px',
                  height: '76px',
                  borderRadius: '12px',
                  objectFit: 'cover'
                }}
              />
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.2rem', color: 'var(--brand-dark)' }}>
                  {dish.name}
                </h4>
                <p style={{ fontSize: '0.82rem', color: '#78716C', margin: 0, lineHeight: 1.4 }}>
                  {dish.description || dish.desc}
                </p>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--brand-primary)', marginTop: '0.35rem' }}>
                  ${basePriceNum.toFixed(2)} Base Price
                </div>
              </div>
            </div>

            {/* Spice Level */}
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--brand-dark)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Flame className="w-4 h-4" style={{ color: 'var(--brand-primary)' }} />
                <span>Spice Level</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.6rem' }}>
                {SPICE_LEVELS.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSpiceLevel(s.id)}
                    style={{
                      padding: '0.75rem 0.6rem',
                      borderRadius: '12px',
                      border: spiceLevel === s.id ? '2px solid var(--brand-primary)' : '1px solid #EFEAE2',
                      backgroundColor: spiceLevel === s.id ? '#FFF7ED' : '#FFFFFF',
                      textAlign: 'left',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--brand-dark)' }}>{s.label}</div>
                    <div style={{ fontSize: '0.7rem', color: '#78716C', marginTop: '2px' }}>{s.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Portion / Combo */}
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--brand-dark)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Utensils className="w-4 h-4" />
                <span>Portion & Combo</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {PORTIONS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPortion(p.id)}
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: '12px',
                      border: portion === p.id ? '2px solid var(--brand-primary)' : '1px solid #EFEAE2',
                      backgroundColor: portion === p.id ? '#FFF7ED' : '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--brand-dark)', textAlign: 'left' }}>{p.label}</div>
                      <div style={{ fontSize: '0.72rem', color: '#78716C' }}>{p.desc}</div>
                    </div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: p.extra > 0 ? 'var(--brand-primary)' : '#78716C' }}>
                      {p.extra === 0 ? 'Standard' : `+$${p.extra.toFixed(2)}`}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Add-ons Checkboxes */}
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--brand-dark)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Plus className="w-4 h-4" style={{ color: 'var(--brand-green)' }} />
                <span>Gourmet Add-ons</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                {EXTRAS_OPTIONS.map((extra) => {
                  const isChecked = selectedExtras.includes(extra.id);
                  return (
                    <button
                      key={extra.id}
                      type="button"
                      onClick={() => toggleExtra(extra.id)}
                      style={{
                        padding: '0.65rem 0.9rem',
                        borderRadius: '12px',
                        border: isChecked ? '1.5px solid var(--brand-green)' : '1px solid #EFEAE2',
                        backgroundColor: isChecked ? '#F0FDF4' : '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <div
                          style={{
                            width: '18px',
                            height: '18px',
                            borderRadius: '4px',
                            border: isChecked ? 'none' : '1.5px solid #D6D0C4',
                            backgroundColor: isChecked ? 'var(--brand-green)' : '#FFFFFF',
                            color: '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--brand-dark)' }}>
                          {extra.label}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--brand-primary)' }}>
                        +${extra.price.toFixed(2)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Chef Notes */}
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--brand-dark)', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <MessageSquare className="w-4 h-4" />
                <span>Special Instructions</span>
              </div>
              <textarea
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="e.g. Extra napkins, dressing on side, allergy notes..."
                rows={2}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '12px',
                  border: '1px solid #EFEAE2',
                  backgroundColor: '#FAF5EE',
                  fontSize: '0.85rem',
                  fontFamily: 'inherit',
                  outline: 'none',
                  resize: 'none'
                }}
              />
            </div>
          </div>

          {/* Footer Bar */}
          <div
            style={{
              padding: '1.25rem 1.5rem',
              borderTop: '1px solid #EFEAE2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              backgroundColor: '#FAF5EE'
            }}
          >
            {/* Quantity Selector */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#FFFFFF',
                borderRadius: '9999px',
                border: '1px solid #ECE7DF',
                padding: '0.2rem'
              }}
            >
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  color: 'var(--brand-dark)'
                }}
              >
                <Minus className="w-4 h-4" />
              </button>
              <span style={{ width: '32px', textAlign: 'center', fontWeight: 700, fontSize: '0.95rem' }}>
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  color: 'var(--brand-dark)'
                }}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Add to Bag Button */}
            <button
              type="button"
              onClick={handleConfirmAdd}
              className="btn-primary"
              style={{
                flex: 1,
                padding: '0.85rem 1.5rem',
                justifyContent: 'space-between'
              }}
            >
              <span>Add To Bag 🛍️</span>
              <span>${totalPrice.toFixed(2)} →</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
