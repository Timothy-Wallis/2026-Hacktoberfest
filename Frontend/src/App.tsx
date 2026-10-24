import React, { useState } from 'react';
import './App.css';

interface AskResponse {
  answer: string;
}

function App() {
  const [prompt, setPrompt] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setError('');
    setAnswer('');

    try {
      const response = await fetch('http://localhost:3000/api/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data: AskResponse = await response.json();
      setAnswer(data.answer);
    } catch (err: any) {
      setError(err.message || 'Failed to connect to the backend server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '700px', margin: '40px auto', fontFamily: 'system-ui, sans-serif', padding: '20px' }}>
      <h2>⚡ Open-Source AI Study Assistant</h2>
      <p style={{ color: '#666' }}>Ask your local Qwen/Llama STEM tutor questions directly.</p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px' }}>
        <textarea
          rows={4}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask a question about your study materials, code, or proofs..."
          style={{ padding: '12px', fontSize: '15px', borderRadius: '6px', border: '1px solid #ccc', resize: 'vertical' }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '10px 16px',
            fontSize: '16px',
            backgroundColor: loading ? '#93c5fd' : '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: '600',
          }}
        >
          {loading ? 'Thinking...' : 'Ask Tutor'}
        </button>
      </form>

      {error && (
        <div style={{ marginTop: '20px', padding: '12px', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '6px' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {answer && (
        <div style={{ marginTop: '20px', padding: '16px', backgroundColor: '#f3f4f6', borderRadius: '6px', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
          <h3 style={{ margin: '0 0 8px 0', color: '#1f2937' }}>Tutor Response:</h3>
          <div>{answer}</div>
        </div>
      )}
    </div>
  );
}

export default App;