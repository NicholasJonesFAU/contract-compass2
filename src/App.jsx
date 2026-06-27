function App() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, sans-serif',
        textAlign: 'center',
        padding: '2rem',
      }}
    >
      <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
        Contract Compass
      </h1>
      <p style={{ color: '#555', maxWidth: '32rem' }}>
        Privacy-conscious contract analysis. Paste a contract, redact what
        matters, and get a structured breakdown — without ever storing the
        original text.
      </p>
      <p style={{ marginTop: '2rem', fontSize: '0.875rem', color: '#999' }}>
        Step 1 complete · Vite + React is running.
      </p>
    </div>
  )
}

export default App