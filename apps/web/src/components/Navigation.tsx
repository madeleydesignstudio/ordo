import React from 'react'
import { useAuth } from '../contexts/AuthContext'

export function Navigation() {
  const { user, signOut } = useAuth()

  if (!user) {
    return null
  }

  return (
    <nav style={{
      padding: '1rem 2rem',
      backgroundColor: '#f8fafc',
      borderBottom: '1px solid #e2e8f0',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <div>
        <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#1f2937' }}>
          Ordo
        </h1>
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem'
      }}>
        <span style={{ color: '#6b7280' }}>
          Welcome, {user.email}
        </span>
        <button
          onClick={signOut}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.875rem'
          }}
        >
          Sign Out
        </button>
      </div>
    </nav>
  )
}
