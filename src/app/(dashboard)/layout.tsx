import * as React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/server'
import { Sidebar } from '@/components/layout/Sidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  // Verify auth
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user role & details
  const { data: userData, error } = await supabase
    .from('users')
    .select('role, nama')
    .eq('auth_id', user.id)
    .single()

  if (error || !userData) {
    // If user is in auth.users but not in public.users, something is wrong
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar 
        role={userData.role as any} 
        userEmail={user.email || ''} 
        userName={userData.nama || ''} 
      />

      <div className="lg:pl-72 flex flex-col min-h-screen">
        <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
