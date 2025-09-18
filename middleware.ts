import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Check if this is an old-format school URL (just URN)
  const oldSchoolUrlMatch = pathname.match(/^\/school\/(\d+)$/)
  
  if (oldSchoolUrlMatch) {
    const urn = oldSchoolUrlMatch[1]
    
    try {
      // Create Supabase client for server-side operations
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )
      
      // Get school data to create proper slug
      const { data: school, error } = await supabase
        .from('schools')
        .select('urn, establishmentname')
        .eq('urn', urn)
        .single()
      
      if (!error && school) {
        // Create school slug (same logic as sitemap)
        const createSchoolSlug = (schoolName: string, urn: string) => {
          const nameSlug = schoolName
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
            .replace(/\s+/g, '-') // Replace spaces with hyphens
            .replace(/-+/g, '-') // Replace multiple hyphens with single
            .trim()
          return `${nameSlug}-${urn}`
        }
        
        const newSlug = createSchoolSlug(school.establishmentname, school.urn)
        const newUrl = new URL(`/school/${newSlug}`, request.url)
        
        // Return 301 permanent redirect
        return NextResponse.redirect(newUrl, 301)
      }
    } catch (error) {
      console.error('Error in middleware redirect:', error)
      // If there's an error, let the request continue normally
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - sitemap.xml (sitemap)
     * - robots.txt (robots file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
}
