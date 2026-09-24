import { ImageResponse } from 'next/og';

export const runtime = 'nodejs';
export const size = {
  width: 180,
  height: 180,
};
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #042f2e 0%, #0f766e 50%, #0d9488 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 40,
          padding: 20,
        }}
      >
        <svg
          width="110"
          height="110"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path
            d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
            fill="rgba(45, 212, 191, 0.25)"
            stroke="#2dd4bf"
            strokeWidth="2"
          />
          <path
            d="M12 8c-1.5-2-4-1.5-4.8.5-.8 2 1.3 4.5 4.8 6.5 3.5-2 5.6-4.5 4.8-6.5-.8-2-3.3-2.5-4.8-.5z"
            fill="#2dd4bf"
            stroke="#ffffff"
            strokeWidth="0.5"
          />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
