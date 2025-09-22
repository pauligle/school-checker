"use client";
import "./globals.css";
import Link from "next/link";
import { useState } from "react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <html lang="en">
      <head>
        <title>SchoolChecker.io</title>
        <meta name="description" content="Find and compare schools in the UK with Ofsted ratings" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
        {/* Google Analytics */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-QNLTY9W21L"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-QNLTY9W21L');
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-gray-100">
        {/* Floating Navigation Bar */}
        <header className="fixed top-0 left-0 right-0 z-[2000] bg-white/90 backdrop-blur-sm shadow-sm">
          <div className="container mx-auto px-4 md:px-6 py-3 md:py-4 flex justify-between items-center">
            {/* Logo */}
            <div className="flex flex-col">
              <Link href="/" className="text-xl md:text-2xl font-bold text-blue-600">
                🏫 <span className="hidden sm:inline">SchoolChecker.io</span><span className="sm:hidden">SchoolChecker</span>
              </Link>
              <span className="text-xs text-gray-600 font-medium">The Only 100% Free School Checker in the UK</span>
            </div>

            {/* Desktop Menu */}
            <nav className="hidden md:flex gap-6">
              <Link href="/" className="text-base hover:text-blue-600">
                Home
              </Link>
              <Link href="/schools-near-me" className="text-base hover:text-blue-600">
                Schools Near Me
              </Link>
              <Link href="/best-nurseries" className="text-base hover:text-blue-600">
                Nurseries
              </Link>
              <div className="relative group">
                <button className="text-base hover:text-blue-600 flex items-center">
                  Primary
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="py-1">
                    <Link href="/best-primary-schools-england" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      England
                    </Link>
                    <Link href="/best-primary-schools/london" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      London
                    </Link>
                    <Link href="/best-primary-schools/manchester" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Manchester
                    </Link>
                    <Link href="/best-primary-schools/birmingham" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Birmingham
                    </Link>
                    <Link href="/best-primary-schools/leeds" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Leeds
                    </Link>
                    <Link href="/best-primary-schools/liverpool" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Liverpool
                    </Link>
                  </div>
                </div>
              </div>
              <Link href="/best-secondary-schools" className="text-base hover:text-blue-600">
                Secondary
              </Link>
              <Link href="/schoolchecker-rating" className="text-base hover:text-blue-600">
                Rating
              </Link>
              <Link href="/about" className="text-base hover:text-blue-600">
                About
              </Link>
              <Link href="/contact" className="text-base hover:text-blue-600">
                Contact
              </Link>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 rounded-md text-gray-600 hover:text-blue-600 hover:bg-gray-100"
              aria-label="Toggle mobile menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Menu Overlay */}
          {isMobileMenuOpen && (
            <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-lg border-t max-h-[80vh] overflow-y-auto">
              <nav className="px-4 py-4 space-y-4">
                <Link 
                  href="/" 
                  className="block text-base text-gray-700 hover:text-blue-600 py-2"
                  onClick={closeMobileMenu}
                >
                  Home
                </Link>
                <Link 
                  href="/schools-near-me" 
                  className="block text-base text-gray-700 hover:text-blue-600 py-2"
                  onClick={closeMobileMenu}
                >
                  Schools Near Me
                </Link>
                <Link 
                  href="/best-nurseries" 
                  className="block text-base text-gray-700 hover:text-blue-600 py-2"
                  onClick={closeMobileMenu}
                >
                  Nurseries
                </Link>
                <div className="space-y-2">
                  <div className="text-base font-medium text-gray-900 py-2">Primary</div>
                  <div className="pl-4 space-y-2">
                    <Link href="/best-primary-schools-england" className="block text-sm text-gray-600 hover:text-blue-600 py-1" onClick={closeMobileMenu}>
                      England
                    </Link>
                    <Link href="/best-primary-schools/london" className="block text-sm text-gray-600 hover:text-blue-600 py-1" onClick={closeMobileMenu}>
                      London
                    </Link>
                    <Link href="/best-primary-schools/manchester" className="block text-sm text-gray-600 hover:text-blue-600 py-1" onClick={closeMobileMenu}>
                      Manchester
                    </Link>
                    <Link href="/best-primary-schools/birmingham" className="block text-sm text-gray-600 hover:text-blue-600 py-1" onClick={closeMobileMenu}>
                      Birmingham
                    </Link>
                    <Link href="/best-primary-schools/leeds" className="block text-sm text-gray-600 hover:text-blue-600 py-1" onClick={closeMobileMenu}>
                      Leeds
                    </Link>
                    <Link href="/best-primary-schools/liverpool" className="block text-sm text-gray-600 hover:text-blue-600 py-1" onClick={closeMobileMenu}>
                      Liverpool
                    </Link>
                  </div>
                </div>
                <Link 
                  href="/best-secondary-schools" 
                  className="block text-base text-gray-700 hover:text-blue-600 py-2"
                  onClick={closeMobileMenu}
                >
                  Secondary
                </Link>
                <Link 
                  href="/schoolchecker-rating" 
                  className="block text-base text-gray-700 hover:text-blue-600 py-2"
                  onClick={closeMobileMenu}
                >
                  Rating
                </Link>
                <Link 
                  href="/about" 
                  className="block text-base text-gray-700 hover:text-blue-600 py-2"
                  onClick={closeMobileMenu}
                >
                  About
                </Link>
                <Link 
                  href="/contact" 
                  className="block text-base text-gray-700 hover:text-blue-600 py-2"
                  onClick={closeMobileMenu}
                >
                  Contact
                </Link>
              </nav>
            </div>
          )}
        </header>

        {/* Main Content */}
        <main className="w-full pt-14 md:pt-16">{children}</main>

        {/* Footer */}
        <footer className="bg-gray-900 text-white">
          <div className="container mx-auto px-4 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Company Info */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">🏫</span>
                  <span className="text-xl font-bold">SchoolChecker.io</span>
                </div>
                <p className="text-gray-300 text-sm">
                  The only 100% free school checker in the UK. Find and compare schools with detailed Ofsted ratings, performance data, and catchment areas.
                </p>
                <div className="text-xs text-gray-400">
                  © {new Date().getFullYear()} SchoolChecker.io. All rights reserved.
                </div>
              </div>

              {/* Quick Links */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Quick Links</h3>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/" className="text-gray-300 hover:text-white transition-colors">Home</Link></li>
                  <li><Link href="/schools-near-me" className="text-gray-300 hover:text-white transition-colors">Schools Near Me</Link></li>
                  <li><Link href="/about" className="text-gray-300 hover:text-white transition-colors">About Us</Link></li>
                  <li><Link href="/contact" className="text-gray-300 hover:text-white transition-colors">Contact</Link></li>
                </ul>
              </div>

              {/* Primary Schools */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Primary Schools</h3>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/best-primary-schools-england" className="text-gray-300 hover:text-white transition-colors">England</Link></li>
                  <li><Link href="/best-primary-schools/london" className="text-gray-300 hover:text-white transition-colors">London</Link></li>
                  <li><Link href="/best-primary-schools/manchester" className="text-gray-300 hover:text-white transition-colors">Manchester</Link></li>
                  <li><Link href="/best-primary-schools/birmingham" className="text-gray-300 hover:text-white transition-colors">Birmingham</Link></li>
                  <li><Link href="/best-primary-schools/leeds" className="text-gray-300 hover:text-white transition-colors">Leeds</Link></li>
                  <li><Link href="/best-primary-schools/liverpool" className="text-gray-300 hover:text-white transition-colors">Liverpool</Link></li>
                </ul>
              </div>

              {/* Resources */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Resources</h3>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/blog" className="text-gray-300 hover:text-white transition-colors">Blog</Link></li>
                  <li><Link href="/schoolchecker-rating" className="text-gray-300 hover:text-white transition-colors">Schoolchecker Rating Calculation</Link></li>
                  <li><Link href="/how-school-rankings-work" className="text-gray-300 hover:text-white transition-colors">Primary School KS2 Rankings</Link></li>
                  <li><Link href="/understanding-gcse-ks4-results" className="text-gray-300 hover:text-white transition-colors">Understanding GCSE KS4 Results</Link></li>
                  <li><Link href="/privacy" className="text-gray-300 hover:text-white transition-colors">Privacy Policy</Link></li>
                  <li><Link href="/terms" className="text-gray-300 hover:text-white transition-colors">Terms of Service</Link></li>
                  <li><Link href="/help" className="text-gray-300 hover:text-white transition-colors">Help Center</Link></li>
                </ul>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-gray-700 mt-8 pt-8">
              <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                <div className="text-sm text-gray-400">
                  Made with ❤️ for parents and students across the UK
                </div>
                <div className="flex space-x-6 text-sm text-gray-400">
                  <span>Data from Department for Education</span>
                  <span>•</span>
                  <span>Ofsted Inspection Reports</span>
                </div>
              </div>
            </div>
          </div>
        </footer>
        

      </body>
    </html>
  );
}
