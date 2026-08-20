import { useAuth } from '../../context/AuthContext';

export default function SellerSettingsPage() {
  const { user } = useAuth();

  return (
    <div style={{ padding: '2rem', maxWidth: '800px' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', color: 'var(--red)', margin: '0 0 1.5rem' }}>
        ACCOUNT SETTINGS
      </h1>
      
      <div style={{ backgroundColor: 'var(--white)', padding: '2rem', border: 'var(--border-thick)', boxShadow: '4px 4px 0px var(--black)' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', margin: '0 0 1.5rem', fontSize: '1.2rem' }}>PROFILE</h2>
        <div style={{ display: 'grid', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>FULL NAME</label>
            <div style={{ padding: '0.8rem', backgroundColor: '#f5f5f5', border: '1px solid #ccc' }}>{user?.full_name || 'N/A'}</div>
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>EMAIL</label>
            <div style={{ padding: '0.8rem', backgroundColor: '#f5f5f5', border: '1px solid #ccc' }}>{user?.email || 'N/A'}</div>
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>PHONE</label>
            <div style={{ padding: '0.8rem', backgroundColor: '#f5f5f5', border: '1px solid #ccc' }}>{user?.phone || 'N/A'}</div>
          </div>
        </div>
        <p style={{ marginTop: '2rem', fontSize: '0.9rem', color: '#666' }}>
          To change account details or reset password, please contact Partner Support in Phase 3.
        </p>
      </div>
    </div>
  );
}
