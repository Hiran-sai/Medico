import React from 'react'
import { assets } from '../assets/assets'

const Contact = () => {
  return (
    <div>
      <div className='text-center text-2xl pt-10 text-gray-500'>
        <p>CONTACT <span className='text-gray-700 font-semibold'>US</span></p>

      </div>
      <div className='flex flex-col md:flex-row gap-10 justify-center items-center my-10 text-gray-600 text-sm md:mx-10'>
        <img className='w-full md:max-w-90' src={assets.contact_image} alt='' />
        <div className='flex flex-col gap-6 justify-center md:w-2/4 text-sm'>
          <p className='font-semibold text-lg text-gray-600'>Our OFFICE</p>
          <p className='text-gray-500'>54709 Willms Station <br />Suite 350, Washington, USA</p>
          <p className='text-gray-500'>Tel: (415) 555-0132 <br />Email: greatstackdev@gmail.com</p>
          <p className='font-semibold text-lg text-gray-600'>Careers at PRESCRIPTO</p>
          <p className='text-gray-500'>Learn more about our teams and job openings.</p>
          <button className='self-start border border-black px-8 py-4 text-sm hover:bg-black hover:text-white transition-all duration-500'>
            Explore Jobs
          </button>
        </div>
      </div>
    </div>
  )
}

export default Contact
