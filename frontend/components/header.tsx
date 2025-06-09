import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import { checkUser } from '@/lib/checkUser'
import React from 'react'

const header = async() => {

  await checkUser()

  return (
    <div>
      <SignedOut>
        <SignInButton/>
      </SignedOut>

      <SignedIn>
        <UserButton />
      </SignedIn>

    </div>
  )
}

export default header