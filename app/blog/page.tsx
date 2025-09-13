import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog - SchoolChecker.io | Education News & School Insights',
  description: 'Stay informed with the latest education news, school insights, and Ofsted updates. Expert articles on school choice, education policy, and academic performance.',
  keywords: 'education blog, school news, Ofsted updates, education insights, school choice, academic performance, education policy, UK schools',
  alternates: {
    canonical: 'https://schoolchecker.io/blog',
  },
  openGraph: {
    title: 'Blog - SchoolChecker.io | Education News & School Insights',
    description: 'Stay informed with the latest education news, school insights, and Ofsted updates. Expert articles on school choice, education policy, and academic performance.',
    url: 'https://schoolchecker.io/blog',
    siteName: 'SchoolChecker.io',
    locale: 'en_GB',
    type: 'website',
    images: [
      {
        url: 'https://schoolchecker.io/api/og?title=Blog&location=UK&rating=Education%20News',
        width: 1200,
        height: 630,
        alt: 'SchoolChecker.io Blog - Education News & School Insights',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog - SchoolChecker.io | Education News & School Insights',
    description: 'Stay informed with the latest education news, school insights, and Ofsted updates. Expert articles on school choice, education policy, and academic performance.',
    images: ['https://schoolchecker.io/api/og?title=Blog&location=UK&rating=Education%20News'],
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
};

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Blog</h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            Coming soon! Articles about schools, Ofsted, and education.
          </p>
        </div>
      </div>
    </div>
  );
}
