import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const title = searchParams.get('title') || 'School Information';
    const location = searchParams.get('location') || 'UK';
    const rating = searchParams.get('rating') || 'Not Available';

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#1f2937',
            backgroundImage: 'linear-gradient(45deg, #1f2937 0%, #374151 100%)',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          {/* School Icon */}
          <div
            style={{
              fontSize: '80px',
              marginBottom: '20px',
            }}
          >
            🏫
          </div>
          
          {/* School Name */}
          <div
            style={{
              fontSize: '48px',
              fontWeight: 'bold',
              color: 'white',
              textAlign: 'center',
              marginBottom: '16px',
              maxWidth: '900px',
              lineHeight: '1.2',
            }}
          >
            {title}
          </div>
          
          {/* Location */}
          <div
            style={{
              fontSize: '24px',
              color: '#9ca3af',
              marginBottom: '8px',
            }}
          >
            📍 {location}
          </div>
          
          {/* Rating */}
          <div
            style={{
              fontSize: '20px',
              color: '#60a5fa',
              marginBottom: '20px',
            }}
          >
            ⭐ {rating}
          </div>
          
          {/* Brand */}
          <div
            style={{
              fontSize: '18px',
              color: '#9ca3af',
              position: 'absolute',
              bottom: '40px',
            }}
          >
            SchoolChecker.io
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    console.log(`${e.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
