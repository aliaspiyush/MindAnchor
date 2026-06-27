import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    try {
      const supabase = await createClient()
      
      // Exchange the code for a session
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error.message)}`, request.url))
      }

      // Check if user has completed onboarding
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('exam_type')
          .eq('id', user.id)
          .single()
          
        if (!profile?.exam_type) {
          return NextResponse.redirect(new URL('/onboarding', request.url))
        }
      }
      return NextResponse.redirect(new URL('/dashboard', request.url))
    } catch (err: any) {
      return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(err.message)}`, request.url))
    }
  }

  // If there's an error or no code, redirect to login
  return NextResponse.redirect(new URL('/login?error=no_auth_code', request.url))
}
