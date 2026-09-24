import { ImageResponse } from 'next/og';

export const runtime = 'nodejs';
export const alt = 'Helpbox - Apoio e Queixas no Anonimato';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #042f2e 0%, #0f172a 60%, #090d16 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '70px 80px',
          color: '#ffffff',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Top Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div
            style={{
              width: 70,
              height: 70,
              borderRadius: 20,
              background: 'linear-gradient(135deg, #0d9488 0%, #10b981 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 10px 25px rgba(13, 148, 136, 0.4)',
            }}
          >
            <svg
              width="42"
              height="42"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="#2dd4bf" stroke="#ffffff" />
            </svg>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 38, fontWeight: 900, letterSpacing: '-1px' }}>
              Helpbox
            </span>
            <span style={{ fontSize: 18, color: '#94a3b8', fontWeight: 500 }}>
              Acolhimento & Escuta Social no Anonimato
            </span>
          </div>
        </div>

        {/* Center Main Message */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '900px' }}>
          <h1
            style={{
              fontSize: 56,
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: '-1.5px',
              color: '#ffffff',
              margin: 0,
            }}
          >
            A sua voz tem valor.
            <br />
            <span style={{ color: '#2dd4bf' }}>Fale connosco em total sigilo.</span>
          </h1>
          <p style={{ fontSize: 24, color: '#cbd5e1', lineHeight: 1.4, margin: 0 }}>
            Espaço ético e seguro para apoio psicossocial, queixas e relatos sem rastreamento de IP ou necessidade de identificação.
          </p>
        </div>

        {/* Bottom Badges */}
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div
            style={{
              background: 'rgba(20, 184, 166, 0.15)',
              border: '1px solid rgba(45, 212, 191, 0.4)',
              borderRadius: 30,
              padding: '10px 24px',
              fontSize: 18,
              fontWeight: 600,
              color: '#5eead4',
            }}
          >
            ✓ 100% Anónimo & Confidencial
          </div>
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: 30,
              padding: '10px 24px',
              fontSize: 18,
              fontWeight: 600,
              color: '#e2e8f0',
            }}
          >
            ✓ Código Único de Rastreio
          </div>
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: 30,
              padding: '10px 24px',
              fontSize: 18,
              fontWeight: 600,
              color: '#e2e8f0',
            }}
          >
            ✓ Atendimento Social Humanizado
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
