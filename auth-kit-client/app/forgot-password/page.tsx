import React, { useState } from 'react'
import { useUserContext } from '@/context/userContext'
import ForgotPasswordForm from '../Components/auth/ForgotPasswordForm/ForgotPasswordForm'

function page() {
  return (
    <div className='auth-page w-full h-full flex justify-center items-center'>
      <ForgotPasswordForm />
    </div>
  )
}

export default page