import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "SchoolChecker.io",
  description: "Find and compare schools in the UK with Ofsted ratings",
  // Disable caching
  other: {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
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

            {/* Menu */}
            <nav className="flex gap-2 md:gap-6">
              <Link href="/" className="text-sm md:text-base hover:text-blue-600">
                Home
              </Link>
              <Link href="/schools-near-me" className="text-sm md:text-base hover:text-blue-600">
                Schools Near Me
              </Link>
              <div className="relative group">
                <button className="text-sm md:text-base hover:text-blue-600 flex items-center">
                  Cities
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="py-1">
                    <Link href="/schools-in-london" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Schools in London
                    </Link>
                    <Link href="/schools-in-manchester" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Schools in Manchester
                    </Link>
                    <Link href="/schools-in-leeds" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Schools in Leeds
                    </Link>
                    <Link href="/schools-in-birmingham" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Schools in Birmingham
                    </Link>
                    <Link href="/schools-in-liverpool" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Schools in Liverpool
                    </Link>
                  </div>
                </div>
              </div>
              <Link href="/blog" className="text-sm md:text-base hover:text-blue-600 hidden sm:block">
                Blog
              </Link>
              <Link href="/schoolchecker-rating" className="text-sm md:text-base hover:text-blue-600 hidden md:block">
                Our Rating
              </Link>
              <Link href="/about" className="text-sm md:text-base hover:text-blue-600 hidden md:block">
                About
              </Link>
              <Link href="/contact" className="text-sm md:text-base hover:text-blue-600 hidden md:block">
                Contact
              </Link>
            </nav>
          </div>
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

              {/* Cities */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Popular Cities</h3>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/schools-in-london" className="text-gray-300 hover:text-white transition-colors">Schools in London</Link></li>
                  <li><Link href="/schools-in-manchester" className="text-gray-300 hover:text-white transition-colors">Schools in Manchester</Link></li>
                  <li><Link href="/schools-in-birmingham" className="text-gray-300 hover:text-white transition-colors">Schools in Birmingham</Link></li>
                  <li><Link href="/schools-in-leeds" className="text-gray-300 hover:text-white transition-colors">Schools in Leeds</Link></li>
                  <li><Link href="/schools-in-liverpool" className="text-gray-300 hover:text-white transition-colors">Schools in Liverpool</Link></li>
                </ul>
              </div>

              {/* Resources */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Resources</h3>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/blog" className="text-gray-300 hover:text-white transition-colors">Blog</Link></li>
                  <li><Link href="/schoolchecker-rating" className="text-gray-300 hover:text-white transition-colors">Schoolchecker Rating Calculation</Link></li>
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
