import React, { useState } from 'react'
import { useContext } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from  'react-toastify'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const Login = () => {

  const { backendUrl, token, setToken } = useContext(AppContext)

  const navigate = useNavigate()

  const [state, setState] = useState('Sign Up')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()

    try{
      if(state === 'Sign Up'){
        const {data} = await axios.post(`${backendUrl}/api/user/register`, {name, password, email})
        if(data.success){
          localStorage.setItem('token', data.token)
          setToken(data.token)
        }else{
          toast.error(data.message)
        }
      }else{
        const {data} = await axios.post(`${backendUrl}/api/user/login`, {password, email})
        if(data.success){
          localStorage.setItem('token', data.token)
          setToken(data.token)
        }else{
          toast.error(data.message)
        }
      }

    }catch(error){
      toast.error(error.message) 
    }

  }
  useEffect(() => {
    if(token){
      navigate('/')
    }
  },[token])

  return (
    <form onSubmit={handleSubmit} className='min-h-[80vh] flex items-center'>
      <div className='flex flex-col gap-3 m-auto items-start p-8 min-w-85 sm:min-w-96 rounded-xl text-zinc-600 shadow-lg'>
        <p className='text-2xl font-semibold'>{state === 'Sign Up' ? "Create Account" : "Login"}</p>
        <p>Please {state === 'Sign Up' ? "Sign Up" : "Login"} to book the appointment. </p>
        {
          state === 'Sign Up' && <div className='w-full'>
            <p>Full Name</p>
            <input className='border border-zinc-300 rounded w-full p-2 mt-1'
              type="text" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
        }

        <div className='w-full'>
          <p>Email</p>
          <input className='border border-zinc-300 rounded w-full p-2 mt-1'
            type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className='w-full'>
          <p>Password</p>
          <input className='border border-zinc-300 rounded w-full p-2 mt-1'
            type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit" className='bg-[#5f6FFF] text-white w-full py-2 rounded-md text-base' type='submit' onClick={handleSubmit}>{state === 'Sign Up' ? "Sign Up" : "Login"}</button>
        {
          state === 'Sign Up' ?
            <p className='text-sm'>Already have an account? <span className='text-[#5f6FFF] cursor-pointer' onClick={() => setState('Login')}>Login</span></p>
            :
            <p className='text-sm'>Don't have an account? <span className='text-[#5f6FFF] cursor-pointer' onClick={() => setState('Sign Up')}>Sign Up</span></p>
        }
      </div>
    </form>
  )
}

export default Login
