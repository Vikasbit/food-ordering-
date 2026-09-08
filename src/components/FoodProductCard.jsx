import { useState } from 'react';
import ImageWithFallback from './ImageWithFallback';
import { formatINR } from '../utils/currency';

export default function FoodProductCard({ product, onAddToCart, onOpenCustomize }) {
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <div className="food-card" style={{ padding: '1.2rem', position: 'relative' }}>
      {/* Top Header: Badge & Favorite */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '0.75rem',
          position: 'absolute',
          top: '1.2rem',
          left: '1.2rem',
          right: '1.2rem',
          zIndex: 3
        }}
      >
        {/* Badge */}
        {product.badge ? (
          <span
            style={{
              backgroundColor:
                product.badge === 'NEW'
                  ? 'var(--brand-primary)'
                  : product.badge === 'TRENDING'
                  ? '#EA580C'
                  : 'var(--brand-dark)',
              color: '#FFFFFF',
              fontSize: '0.68rem',
              fontWeight: 800,
              letterSpacing: '0.05em',
              padding: '0.22rem 0.6rem',
              borderRadius: '9999px',
              textTransform: 'uppercase'
            }}
          >
            {product.badge}
          </span>
        ) : (
          <span />
        )}

        {/* Favorite Heart Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsFavorite(!isFavorite);
          }}
          aria-label="Add to favorites"
          style={{
            background: 'rgba(255, 255, 255, 0.9)',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
            color: isFavorite ? '#EF4444' : '#A8A29E',
            transition: 'all 0.2s ease'
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </button>
      </div>

      {/* Food Photo Container with ImageWithFallback */}
      <div
        onClick={() => onOpenCustomize && onOpenCustomize(product)}
        style={{
          width: '100%',
          height: '180px',
          borderRadius: '14px',
          overflow: 'hidden',
          backgroundColor: '#FDFBF7',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          marginTop: '1rem',
          marginBottom: '1rem'
        }}
      >
        <ImageWithFallback
          src={product.image || product.image_url}
          alt={product.name}
          fallbackType="food"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        />
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h4
          onClick={() => onOpenCustomize && onOpenCustomize(product)}
          style={{
            fontSize: '1.08rem',
            fontWeight: 700,
            fontFamily: 'var(--font-sans)',
            color: 'var(--brand-dark)',
            marginBottom: '0.25rem',
            cursor: 'pointer'
          }}
        >
          {product.name}
        </h4>

        <p
          style={{
            fontSize: '0.8rem',
            color: '#78716C',
            lineHeight: 1.4,
            marginBottom: '0.75rem',
            flex: 1
          }}
        >
          {product.description || product.ingredients}
        </p>

        {/* Rating & Prep Time */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            fontSize: '0.78rem',
            color: '#78716C',
            marginBottom: '1rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span style={{ color: '#F59E0B' }}>★</span>
            <span style={{ fontWeight: 700, color: 'var(--brand-dark)' }}>{product.rating || '4.8'}</span>
            <span>({product.review_count || product.reviews || '80'})</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span>🕒</span>
            <span>{product.prep_time || '15-20 min'}</span>
          </div>
        </div>

        {/* Price & Add to Cart Button */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '0.75rem',
            borderTop: '1px solid #F5F0E8'
          }}
        >
          <span
            style={{
              fontSize: '1.2rem',
              fontWeight: 800,
              fontFamily: 'var(--font-sans)',
              color: 'var(--brand-dark)'
            }}
          >
            {formatINR(Number(product.price))}
          </span>

          <button
            type="button"
            onClick={() => onAddToCart(product)}
            aria-label={`Add ${product.name} to cart`}
            style={{
              width: '40px',
              height: '40px',
              minWidth: '40px',
              minHeight: '40px',
              borderRadius: '50%',
              backgroundColor: 'var(--brand-primary)',
              color: '#FFFFFF',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '1.3rem',
              fontWeight: 600,
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              boxShadow: '0 4px 10px rgba(200,69,35,0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
              e.currentTarget.style.backgroundColor = 'var(--brand-primary-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.backgroundColor = 'var(--brand-primary)';
            }}
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
