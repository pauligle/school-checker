import { Metadata } from 'next';
import HomepageStructuredData from '@/components/HomepageStructuredData';
import HomeContent from '@/components/HomeContent';

export const metadata: Metadata = {
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
    type: 'website',
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
    card: 'summary_large_image',
    title: 'SchoolChecker.io - Find & Compare UK Schools with Ofsted Ratings',
    description: 'The only 100% free school checker in the UK. Find and compare schools with Ofsted ratings, performance data, and detailed school information.',
    images: ['https://schoolchecker.io/api/og?title=SchoolChecker.io&location=UK&rating=Free'],
    creator: '@schoolcheckerio',
    site: '@schoolcheckerio',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

export default function Home() {
  return (
    <>
      {/* Structured Data */}
      <HomepageStructuredData />
      
      {/* Client Component with Map */}
      <HomeContent />
    </>
  );
}
