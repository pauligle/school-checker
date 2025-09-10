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
              <Link href="/" className="text-lg md:text-xl font-bold text-blue-600">
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
                    <Link href="/schools-in-birmingham" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Schools in Birmingham
                    </Link>
                    <Link href="/schools-in-leeds" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Schools in Leeds
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
              <Link href="/about" className="text-sm md:text-base hover:text-blue-600 hidden md:block">
                About
              </Link>
              <Link href="/contact" className="text-sm md:text-base hover:text-blue-600 hidden md:block">
                Contact
              </Link>
            </nav>
          </div>
        </header>

        {/* Main Content - Full Screen */}
        <main className="w-full h-screen pt-14 md:pt-16">{children}</main>

        {/* Footer - Hidden for full screen map */}
        <footer className="hidden">
          <div className="container mx-auto px-6 py-4 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-600">
            <p>© {new Date().getFullYear()} SchoolChecker.io. All rights reserved.</p>
            <div className="flex gap-4 mt-2 sm:mt-0">
              <Link href="/" className="hover:text-blue-600">
                Home
              </Link>
              <Link href="/blog" className="hover:text-blue-600">
                Blog
              </Link>
              <Link href="/about" className="hover:text-blue-600">
                About
              </Link>
              <Link href="/contact" className="hover:text-blue-600">
                Contact
              </Link>
            </div>
          </div>
        </footer>
        

      </body>
    </html>
  );
}
