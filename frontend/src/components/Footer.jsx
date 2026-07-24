import React from 'react'
import { assets } from '../assets/assets'

const Footer = () => {
    return (
        <div className='md:mx-10'>
            <div className='flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm'>
                <div>
                    {/* Left Section */}
                    <img className='mb-5 w-40' src={assets.logo} alt='' />
                    <p className='w-full md:w-2/3 text-gray-600 leading-6'>Hey guys, I hope there are no issues with our website. I created this to help the people help with their appointments and the medical prescriptions. Mainly for old people to make sure they take are taking the prescribed pill at the designated time. If you face any issues feel free to contact me.</p>
                </div>

                <div>
                    {/* Mid Section */}
                    <p className='text-xl font-medium mb-5'>COMPANY</p>
                    <ul className='flex flex-col gap-2 text-gray-600'>
                        <li>Home</li>
                        <li>About us</li>
                        <li>Contact us</li>
                        <li>Privacy policy</li>
                    </ul>
                </div>

                <div>
                    {/* Right Section */}
                    <p className='text-xl font-medium mb-5'>GET IN TOUCH</p>
                    <ul className='flex flex-col gap-2 text-gray-600'>
                        <li>+91-8639648461</li>
                        <li>hiransai12@gmail.com</li>
                    </ul>
                </div>
            </div>
            <div>
                <hr />
                <p className='py-5 text-sm text-center'>Copyright © 2026 Medico - All Right Reserved.</p>
            </div>
        </div>
    )
}

export default Footer
