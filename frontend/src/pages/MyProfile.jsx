import React, { useState, useRef, useEffect } from 'react'
import { useContext } from 'react'
import { AppContext } from '../context/AppContext'
import { assets } from '../assets/assets'
import { toast } from 'react-toastify'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import PrescriptionUpload from '../components/PrescriptionUpload'
import MedicineSchedule from '../components/MedicineSchedule'

const MyProfile = () => {

  const navigate = useNavigate()
  const {userData, setUserData, token, backendUrl, loadUserProfileData} = useContext(AppContext)
  const [isEdit, setIsEdit] = useState(false)
  const [image, setImage] = useState(false)

  // Create a ref for MedicineSchedule to refresh it on upload success
  const scheduleRef = useRef(null)

  useEffect(() => {
    if (!token) {
      navigate('/', { replace: true })
    }
  }, [token, navigate])

  if (!token) return null

  const handleUploadSuccess = () => {
    if (scheduleRef.current) {
      scheduleRef.current.refresh()
    }
  }

  const updateUserProfileData = async() => {
    try{
      const formData = new FormData()

      formData.append('name', userData.name)
      formData.append('phone', userData.phone)
      formData.append('address', JSON.stringify(userData.address))
      formData.append('gender', userData.gender)
      formData.append('dob', userData.dob)

      image && formData.append('image', image)

      const {data} = await axios.post(backendUrl + '/api/user/update-profile', formData, {headers:{token}})

      if(data.success){
        toast.success(data.message)
        await loadUserProfileData()
        setIsEdit(false)
        setImage(false)
      }else{
        toast.error(data.message)
      }
    }catch(error){
      console.log(error)
      toast.error(error.message)
    }
  }

  return userData && (
    <div className='w-full grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-8 my-8 md:my-12 text-sm'>
      {/* Left Column: User Profile Info */}
      <div className='bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-4 self-start'>
        <div className='flex flex-col gap-2'>
          {
            isEdit
            ? <label htmlFor='image'>
              <div className='inline-block relative cursor-pointer'>
                <img
                  className='w-36 h-36 object-cover rounded-xl opacity-75 border-2 border-dashed border-blue-200'
                  src={image ? URL.createObjectURL(image) : (userData.image || null)}
                  alt=""
                />
                {!image && (
                  <img className='w-10 absolute bottom-12 right-12' src={assets.upload_icon} alt="" />
                )}
              </div>
              <input onChange={(e) => setImage(e.target.files[0])} type="file" id='image' hidden />
            </label>
            :<img src={userData.image || null} alt="" className='w-36 h-36 object-cover rounded-xl border border-neutral-100 shadow-sm' />
          }
          
          {
            isEdit ? <input className='bg-gray-50 text-2xl font-semibold max-w-60 mt-4 p-1 rounded border border-gray-200' type="text" value={userData.name} onChange={e => setUserData(prev => ({ ...prev, name: e.target.value }))} /> : <p className='font-semibold text-2xl text-neutral-800 mt-4'>{userData.name}</p>
          }
        </div>
        
        <hr className='bg-zinc-100 h-px border-none' />
        
        <div>
          <p className='text-neutral-500 font-semibold text-xs uppercase tracking-wider mb-3'>CONTACT INFORMATION</p>
          <div className='grid grid-cols-[1fr_3fr] gap-y-3 mt-3 text-neutral-700'>
            <p className='font-medium text-neutral-500'>Email id:</p>
            <p className='text-blue-600 break-all'>{userData.email}</p>
            <p className='font-medium text-neutral-500'>Phone:</p>
            {
              isEdit ? <input className='bg-gray-50 p-1 rounded border border-gray-200 max-w-52' type="text" value={userData.phone} onChange={e => setUserData(prev => ({ ...prev, phone: e.target.value }))} /> : <p className='text-blue-500 font-medium'>{userData.phone}</p>
            }
            <p className='font-medium text-neutral-500'>Address:</p>
            {
              isEdit
                ? <p className='flex flex-col gap-1.5'>
                  <input className='bg-gray-50 p-1 rounded border border-gray-200' type="text" placeholder="Line 1" value={userData.address?.line1 || ''} onChange={e => setUserData(prev => ({ ...prev, address: { ...prev.address, line1: e.target.value } }))} />
                  <input className='bg-gray-50 p-1 rounded border border-gray-200' type="text" placeholder="Line 2" value={userData.address?.line2 || ''} onChange={e => setUserData(prev => ({ ...prev, address: { ...prev.address, line2: e.target.value } }))} />
                  <input className='bg-gray-50 p-1 rounded border border-gray-200' type="text" placeholder="City" value={userData.address?.city || ''} onChange={e => setUserData(prev => ({ ...prev, address: { ...prev.address, city: e.target.value } }))} />
                  <input className='bg-gray-50 p-1 rounded border border-gray-200' type="text" placeholder="State" value={userData.address?.state || ''} onChange={e => setUserData(prev => ({ ...prev, address: { ...prev.address, state: e.target.value } }))} />
                  <input className='bg-gray-50 p-1 rounded border border-gray-200' type="text" placeholder="Zip" value={userData.address?.zip || ''} onChange={e => setUserData(prev => ({ ...prev, address: { ...prev.address, zip: e.target.value } }))} />
                </p>
                : <p className='text-gray-600 font-medium'>
                  {userData.address?.line1 || 'No address added'}
                  {userData.address?.line2 && <><br />{userData.address.line2}</>}
                  {(userData.address?.city || userData.address?.state || userData.address?.zip) && (
                    <>
                      <br />
                      {userData.address.city && `${userData.address.city}, `}
                      {userData.address.state && `${userData.address.state} `}
                      {userData.address.zip && userData.address.zip}
                    </>
                  )}
                </p>
            }
          </div>
        </div>

        <hr className='bg-zinc-100 h-px border-none' />

        <div>
          <p className='text-neutral-500 font-semibold text-xs uppercase tracking-wider mb-3'>BASIC INFORMATION</p>
          <div className='grid grid-cols-[1fr_3fr] gap-y-3 mt-3 text-neutral-700'>
            <p className='font-medium text-neutral-500'>Gender</p>
            {
              isEdit
                ? <select className='max-w-28 bg-gray-50 p-1 rounded border border-gray-200' onChange={e => setUserData(prev => ({ ...prev, gender: e.target.value }))} value={userData.gender}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Not Specified">Not Specified</option>
                </select>
                : <p className='text-gray-600 font-medium'>{userData.gender}</p>
            }
            <p className='font-medium text-neutral-500'>DOB</p>
            {
              isEdit ? <input className='max-w-32 bg-gray-50 p-1 rounded border border-gray-200' type="date" value={userData.dob} onChange={e => setUserData(prev => ({ ...prev, dob: e.target.value }))} /> : <p className='text-gray-600 font-medium'>{userData.dob}</p>
            }
          </div>
        </div>
        
        <div className='mt-6'>
          {
            isEdit
              ? <button className='w-full border border-[#5f6FFF] px-8 py-2.5 rounded-full hover:bg-[#5f6FFF] hover:text-white transition-all cursor-pointer font-medium' onClick={updateUserProfileData}>Save Info</button>
              : <button className='w-full border border-[#5f6FFF] px-8 py-2.5 rounded-full hover:bg-[#5f6FFF] hover:text-white transition-all cursor-pointer font-medium' onClick={() => setIsEdit(true)}>Edit Profile</button>
          }
        </div>
      </div>

      {/* Right Column: Prescription upload and display timetable */}
      <div className='w-full flex flex-col gap-8'>
        <PrescriptionUpload onUploadSuccess={handleUploadSuccess} />
        <MedicineSchedule ref={scheduleRef} />
      </div>
    </div>
  )
}

export default MyProfile
