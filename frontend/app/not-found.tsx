import Link from 'next/link'
import React from 'react'

const NotFound = () => {
  return (
    <div className='flex flex-col items-center justify-center h-screen'>
      <h1 className='text-4xl font-bold'>404 - ページが見つかりません</h1>
      <p className='text-lg'>お探しのページが見つかりません。</p>
      <Link href='/' className='text-blue-500'>ホームページに戻る</Link>
    </div>
  )
}

export default NotFound