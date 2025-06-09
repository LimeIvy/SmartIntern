import React from 'react'
import Sidebar from '@/components/sidebar'

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className='flex min-h-screen bg-gray-50'>
      <Sidebar />
      {children}
    </div>
  )
}

export default Layout