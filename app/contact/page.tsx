import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us - SchoolChecker.io | Get in Touch',
  description: 'Contact SchoolChecker.io for feedback, suggestions, or support. We\'d love to hear from parents, teachers, and education professionals about our school finder tool.',
  keywords: 'contact schoolchecker, school finder support, education feedback, school data questions, Ofsted data help',
  alternates: {
    canonical: 'https://schoolchecker.io/contact',
  },
  openGraph: {
    title: 'Contact Us - SchoolChecker.io | Get in Touch',
    description: 'Contact SchoolChecker.io for feedback, suggestions, or support. We\'d love to hear from parents, teachers, and education professionals about our school finder tool.',
    url: 'https://schoolchecker.io/contact',
    siteName: 'SchoolChecker.io',
    locale: 'en_GB',
    type: 'website',
    images: [
      {
        url: 'https://schoolchecker.io/api/og?title=Contact%20Us&location=UK&rating=Get%20in%20Touch',
        width: 1200,
        height: 630,
        alt: 'Contact SchoolChecker.io - Get in Touch',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Us - SchoolChecker.io | Get in Touch',
    description: 'Contact SchoolChecker.io for feedback, suggestions, or support. We\'d love to hear from parents, teachers, and education professionals about our school finder tool.',
    images: ['https://schoolchecker.io/api/og?title=Contact%20Us&location=UK&rating=Get%20in%20Touch'],
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

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Contact Us</h1>
          <div className="bg-white rounded-lg shadow-sm p-8">
            <p className="text-xl text-gray-600 mb-4">Email: info@schoolchecker.com</p>
            <p className="text-lg text-gray-700">We'd love to hear your feedback and suggestions.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
