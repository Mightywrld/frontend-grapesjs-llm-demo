import { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';

const grapesjs = typeof window === 'object' ? require('grapesjs') : null;

export default function Home() {
  const editorRef = useRef(null);

  useEffect(() => {
    if (!editorRef.current && grapesjs) {
      editorRef.current = grapesjs.init({
        container: '#gjs',
        height: '500px',
        fromElement: true,
        storageManager: false,
      });
    }
  }, []);

  async function getJwtToken(clientKey) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientKey }),
    });
    if (!res.ok) throw new Error('Failed to get JWT token');
    const json = await res.json();
    return json.token;
  }

  async function generateHero() {
    if (!editorRef.current) return;
    try {
      const token = await getJwtToken(process.env.NEXT_PUBLIC_CLIENT_KEY);
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/ai/generate-hero`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ prompt: 'Create a hero section for Axel Logistics. Professional tone.' }),
      });
      if (!res.ok) throw new Error('AI generation failed');
      const json = await res.json();
      editorRef.current.addComponents(json.html);
      if (json.css) editorRef.current.CssComposer.add(json.css);
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Axel Logistics AI Web Builder</h1>
      <button onClick={generateHero} style={{ marginBottom: '10px', padding: '10px 20px' }}>
        Generate Hero (AI)
      </button>
      <div id="gjs" style={{ border: '1px solid #ccc' }}>
        <h2>Welcome to Axel Logistics</h2>
        <p>Edit this hero section or click the button above.</p>
      </div>
    </div>
  );
}
