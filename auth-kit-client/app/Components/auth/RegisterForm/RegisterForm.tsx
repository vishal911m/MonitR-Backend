"use client"
import { useUserContext } from '@/context/userContext'
import { ZCOOL_KuaiLe } from 'next/font/google';
import React, { useState } from 'react'

function RegisterForm() {
  const {registerUser, userState, handleUserInput} = useUserContext();
  const {name, email, password} = userState;
  const [showpassword, setShowPassword] = useState(false);

  const togglePassword = () => setShowPassword(!showpassword);

  return (
    <form className='m-[2rem] px-10 py-14 rounded-lg bg-white w-full max-w-[520px]'>
      <div className='relative z-10'>
        <h1 className="mb-2 text-center text-[1.35rem] font-medium">
          {" "}
          Register for an account
        </h1>
        <p className="mb-8 px-[2rem] text-center text-[#999] text-[14px]">
          Create an account. Already have an account? {" "}
          <a 
            href="/login"
            className='font-bold text-[#2ecc71] hover:text-[#7263f3] transition-all duration-300'>
              Login here
          </a>
        </p>
        <div className="flex flex-col">
          <label htmlFor="name" className="mb-1 text-[#999] ">
            Full Name
          </label>
          <input type="text"
            id="name"
            value={name}
            onChange={(e) => handleUserInput("name")(e)}
            name="name"
            placeholder="John Doe"
            className="mb-4 px-4 py-3 rounded-lg border-[2px] border-[#e5e5e5] outline-[#2ecc71] text-gray-800" 
          />
        </div>

        <div className="flex flex-col mt-[1rem]">
          <label htmlFor="email" className="mb-1 text-[#999] ">
            Email
          </label>
          <input type="text"
            id="email"
            value={email}
            onChange={(e) => handleUserInput("email")(e)}
            name="email"
            placeholder="johndoe@gmail.com"
            className="mb-4 px-4 py-3 rounded-lg border-[2px] border-[#e5e5e5] outline-[#2ecc71] text-gray-800" 
          />
        </div>

        <div className="relative flex flex-col mt-[1rem]">
          <label htmlFor="password" className="mb-1 text-[#999] ">
            Password
          </label>
          <input 
            type={showpassword ? "text" : "password"}
            id="password"
            value={password}
            onChange={(e) => handleUserInput("password")(e)}
            name="password"
            placeholder="************"
            className="mb-4 px-4 py-3 rounded-lg border-[2px] border-[#e5e5e5] outline-[#2ecc71] text-gray-800" 
          />
          <button type='button' className='absolute p-1 right-4 top-[35%] text-[22px] opacity-45'>
            {showpassword ? 
              <i className="fa-solid fa-eye" onClick={togglePassword}></i> : 
              <i className="fa-solid fa-eye-slash" onClick={togglePassword}></i>
            }
          </button>
        </div>

        {/* <div className='mt-4 flex justify-end'>
          <a 
            href="/forgot-password"
            className='font-bold text-[#2ecc71] text-[14px] hover:text-[#7263f3] transition-all duration-300'
          >Forgot Password?</a>
        </div> */}

        <div className="flex">
          <button 
            type='submit'
            disabled={!name || !email || !password}
            onClick={registerUser}
            className="mt-[1.5rem] flex-1 px-4 py-3 font-bold bg-[#2ecc71] text-white rounded-md hover:bg-[#1abc9c] transition-colors"
          >
            Register Now 
          </button>
        </div>

      </div>
    </form>
  )
}

export default RegisterForm