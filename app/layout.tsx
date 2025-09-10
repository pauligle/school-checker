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
      <body className="min-h-screen bg-gray-100">
        {/* Floating Navigation Bar */}
        <header className="fixed top-0 left-0 right-0 z-[2000] bg-white/90 backdrop-blur-sm shadow-sm">
          <div className="container mx-auto px-4 md:px-6 py-3 md:py-4 flex justify-between items-center">
            {/* Logo */}
            <Link href="/" className="text-lg md:text-xl font-bold text-blue-600">
              🏫 <span className="hidden sm:inline">SchoolChecker.io</span><span className="sm:hidden">SchoolChecker</span>
            </Link>

            {/* Menu */}
            <nav className="flex gap-2 md:gap-6">
              <Link href="/" className="text-sm md:text-base hover:text-blue-600">
                Home
              </Link>
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
