import React, { useState } from 'react'
import { assets } from '../assets/assets'
import { NavLink, useNavigate } from 'react-router-dom'
import { useContext } from 'react';
import { AppContext } from '../context/AppContext';

const Navbar = () => {

    const navigate = useNavigate();
    const [showMenu, setShowMenu] = useState(false)
    const [showProfileMenu, setShowProfileMenu] = useState(false)

    const {token, setToken, userData} = useContext(AppContext)
    const adminUrl = import.meta.env.VITE_ADMIN_URL || 'http://localhost:5174'

    const logout = () => {
        setToken(false)
        localStorage.removeItem('token')
    }

    return (
        <div className='flex items-center justify-between text-sm py-4 mb-5 border-b border-b-gray-400'>
            <img onClick={() => navigate('/')} className='w-44 cursor-pointer' src={assets.logo} alt='' />
            <ul className='hidden md:flex items-start gap-5 font-medium'>
                <NavLink to='/'>
                    <li className='py-1'>
                        HOME
                    </li>
                    <hr className='border-none outline-none h-0.5 bg-[#5f6FFF] w-3/5 m- hidden' />
                </NavLink>
                <NavLink to='/doctors'>
                    <li className='py-1'>ALL DOCTORS</li>
                    <hr className='border-none outline-none h-0.5 bg-[#5f6FFF] w-3/5 m- hidden' />
                </NavLink>
                <NavLink to='/about'>
                    <li className='py-1'>ABOUT</li>
                    <hr className='border-none outline-none h-0.5 bg-[#5f6FFF] w-3/5 m- hidden' />
                </NavLink>
                <NavLink to='/contact'>
                    <li className='py-1'>CONTACT</li>
                    <hr className='border-none outline-none h-0.5 bg-[#5f6FFF] w-3/5 m- hidden' />
                </NavLink>
            </ul>
            <div className='flex items-center gap-4'>
                {
                    token && userData ?
                    <>
                    <button
                        onClick={() => navigate('/my-profile')}
                        className='hidden md:block bg-[#5f6FFF] text-white px-5 py-2 rounded-full font-medium text-xs hover:bg-opacity-95 transition-all'
                    >
                        Upload Prescription
                    </button>
                    <div className="relative flex items-center gap-2 cursor-pointer" onClick={() => setShowProfileMenu(prev => !prev)}>
                        <img className='w-8 rounded-full' src={userData.image} alt=''/>
                        <img className='w-2.5' src={assets.dropdown_icon} alt=''/>
                        {showProfileMenu && (
                            <div className='absolute top-0 right-0 pt-14 text-base font-medium text-gray-600 z-20'>
                                <div className='min-w-48 bg-stone-100 rounded flex flex-col gap-4 p-4'>
                                    <p onClick={(e) => { e.stopPropagation(); setShowProfileMenu(false); navigate('/my-profile') }} className="hover:text-black cursor-pointer">My Profile</p>
                                    <p onClick={(e) => { e.stopPropagation(); setShowProfileMenu(false); navigate('/my-appointments') }} className="hover:text-black cursor-pointer">My Appointments</p>
                                    <p onClick={(e) => { e.stopPropagation(); setShowProfileMenu(false); logout() }} className="hover:text-black cursor-pointer">Logout</p>
                                </div>
                            </div>
                        )}
                    </div>
                    </>
                    : <>
                        <button
                            onClick={() => window.location.href = adminUrl}
                            className='border border-[#5f6FFF] text-[#5f6FFF] px-5 py-3 rounded-full font-medium hidden md:block hover:bg-[#5f6FFF] hover:text-white transition-all'
                        >
                            Admin
                        </button>
                        <button onClick={() => navigate('/login')}
                            className='bg-[#5f6FFF] text-white px-8 py-3 rounded-full font-light hidden md:block'>Create Account</button>
                    </>
                }
                <img src={assets.menu_icon} alt='' className='w-6 md:hidden' onClick={() => setShowMenu(prev => !prev)} />
                {/* Mobile Menu */}
                <div className={`md:hidden right-0 top-0 bottom-0 z-20 overflow-hidden bg-white transition-all duration-300 fixed ${showMenu ? 'w-60 p-6' : 'w-0 p-0'}`}>
                    <div className='flex items-center justify-between mb-10'>
                        <img src={assets.logo} alt='' />
                        <img src={assets.cross_icon} alt='' className='w-6 cursor-pointer' onClick={() => setShowMenu(prev => !prev)} />
                    </div>
                    <ul className='flex flex-col gap-5 font-medium'>
                        <NavLink onClick={() => setShowMenu(false)} to='/'>
                            <li className='px-4 py-2 rounded inline-block'>
                                HOME
                            </li>
                        </NavLink>
                        <NavLink onClick={() => setShowMenu(false)} to='/doctors'>
                            <li className='px-4 py-2 rounded inline-block'>ALL DOCTORS</li>
                        </NavLink>
                        <NavLink onClick={() => setShowMenu(false)} to='/about'>
                            <li className='px-4 py-2 rounded inline-block'>ABOUT</li>
                        </NavLink>
                        <NavLink onClick={() => setShowMenu(false)} to='/contact'>
                            <li className='px-4 py-2 rounded inline-block'>CONTACT</li>
                        </NavLink>
                        <button onClick={() => { setShowMenu(false); window.location.href = adminUrl }} className='text-left px-4 py-2 rounded border border-[#5f6FFF] text-[#5f6FFF]'>ADMIN</button>
                    </ul>
                    {token && (
                        <div className='mt-6 border-t border-gray-200 pt-6 flex flex-col gap-4 text-gray-700'>
                            <button onClick={() => { setShowMenu(false); navigate('/my-profile') }} className='text-left px-4 py-2 rounded bg-[#5f6FFF] text-white font-medium'>Upload Prescription</button>
                            <button onClick={() => { setShowMenu(false); navigate('/my-profile') }} className='text-left px-4 py-2 rounded hover:bg-slate-100'>My Profile</button>
                            <button onClick={() => { setShowMenu(false); navigate('/my-appointments') }} className='text-left px-4 py-2 rounded hover:bg-slate-100'>My Appointments</button>
                            <button onClick={() => { setShowMenu(false); logout() }} className='text-left px-4 py-2 rounded hover:bg-slate-100'>Logout</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Navbar
