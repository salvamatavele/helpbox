import { ImageResponse } from 'next/og';

export const runtime = 'nodejs';
export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #2481cc 0%, #0284c7 50%, #0f766e 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(36, 129, 204, 0.4)',
        }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="rgba(255,255,255,0.15)" stroke="#ffffff" />
          <path d="M12 8c-1.5-2-4-1.5-4.8.5-.8 2 1.3 4.5 4.8 6.5 3.5-2 5.6-4.5 4.8-6.5-.8-2-3.3-2.5-4.8-.5z" fill="#ffffff" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
