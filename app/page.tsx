import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import HomepageStructuredData from '@/components/HomepageStructuredData';
import HomeContent from '@/components/HomeContent';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ school?: string; filter?: string }> }): Promise<Metadata> {
  // Check if there are any query parameters
  const params = await searchParams;
  const hasQueryParams = params?.school || params?.filter;
  
  const baseMetadata = {
    title: 'SchoolChecker.io - Find & Compare UK Schools with Ofsted Ratings',
    description: 'The only 100% free school checker in the UK. Find and compare schools with Ofsted ratings, performance data, and detailed school information. Search by location, school type, and ratings.',
    keywords: 'school checker, UK schools, Ofsted ratings, school comparison, school finder, education, primary schools, secondary schools, school performance, school data',
    alternates: {
      canonical: 'https://schoolchecker.io',
    },
    openGraph: {
      title: 'SchoolChecker.io - Find & Compare UK Schools with Ofsted Ratings',
      description: 'The only 100% free school checker in the UK. Find and compare schools with Ofsted ratings, performance data, and detailed school information.',
      url: 'https://schoolchecker.io',
      siteName: 'SchoolChecker.io',
      locale: 'en_GB',
      type: 'website' as const,
      images: [
        {
          url: 'https://schoolchecker.io/api/og?title=SchoolChecker.io&location=UK&rating=Free',
          width: 1200,
          height: 630,
          alt: 'SchoolChecker.io - Find & Compare UK Schools',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image' as const,
      title: 'SchoolChecker.io - Find & Compare UK Schools with Ofsted Ratings',
      description: 'The only 100% free school checker in the UK. Find and compare schools with Ofsted ratings, performance data, and detailed school information.',
      images: ['https://schoolchecker.io/api/og?title=SchoolChecker.io&location=UK&rating=Free'],
      creator: '@schoolcheckerio',
      site: '@schoolcheckerio',
    },
    verification: {
      google: 'your-google-verification-code',
    },
  };

  // Add noindex for pages with query parameters
  if (hasQueryParams) {
    return {
      ...baseMetadata,
      robots: {
        index: false,
        follow: false,
        googleBot: {
          index: false,
          follow: false,
        },
      },
    };
  }

  return {
    ...baseMetadata,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large' as const,
        'max-snippet': -1,
      },
    },
  };
}

// Helper function to create school slug (same logic as used in sitemap and school pages)
function createSchoolSlug(schoolName: string, urn: string): string {
  const nameSlug = schoolName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim();
  return `${nameSlug}-${urn}`;
}

export default async function Home({ searchParams }: { searchParams: Promise<{ school?: string; filter?: string }> }) {
  // If there's a school query parameter, redirect to the canonical school page
  const params = await searchParams;
  if (params?.school) {
    try {
      const { data: schoolData } = await supabase
        .from('schools')
        .select('urn, establishmentname')
        .eq('urn', params.school)
        .single();

      if (schoolData) {
        const slug = createSchoolSlug(schoolData.establishmentname, schoolData.urn);
        redirect(`/school/${slug}`);
      }
    } catch (error) {
      console.error('Error fetching school for redirect:', error);
      // If error, just continue to normal home page
    }
  }

  return (
    <>
      {/* Structured Data */}
      <HomepageStructuredData />
      
      {/* Client Component with Map */}
      <HomeContent />
    </>
  );
}
