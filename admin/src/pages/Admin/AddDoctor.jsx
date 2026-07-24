import React from 'react'
import { assets } from '../../assets/assets'
import { useState } from 'react'
import { useContext } from 'react'
import { AdminContext } from '../../context/AdminContext'
import { toast } from 'react-toastify'
import axios from 'axios'

const AddDoctor = () => {

    const [docImg, setDocImg] = useState(false)
    const [name, setName] = useState("")
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [experience, setExperience] = useState('1 Year')
    const [fees, setFees] = useState('')
    const [about, setAbout] = useState('')
    const [speciality, setSpeciality] = useState('General Physician')
    const [degree, setDegree] = useState('')
    const [address1, setAddress1] = useState('')
    const [address2, setAddress2] = useState('')

    const {backendUrl, aToken} = useContext(AdminContext)

    const onSubmitHandler = async(event) => {
        event.preventDefault()

        try{
            if(!docImg){
                return toast.error("Image not Selected")
            }
            const formData = new FormData()

            formData.append('image', docImg)
            formData.append('name', name)
            formData.append('email', email)
            formData.append('password', password)
            formData.append('experience', experience)
            formData.append('fees', Number(fees))
            formData.append('about', about)
            formData.append('speciality', speciality)
            formData.append('degree', degree)
            formData.append('address', JSON.stringify({line1: address1, line2:address2}))

            formData.forEach((value, key) => {
                console.log(`${key} : ${value}`);
            })

            const {data} = await axios.post(backendUrl + '/api/admin/add-doctor', formData, {headers:{aToken}})
            
            if(data.success){
                toast.success(data.message)
                setDocImg(false)
                setName('')
                setPassword('')
                setEmail('')
                setExperience('1 Year')
                setFees('')
                setAbout('')
                setSpeciality('General Physician')
                setDegree('')
                setAddress1('')
                setAddress2('')
            }else{
                toast.error(data.message)
            }
        }catch (error){
            toast.error(error.message)
            console.log(error)
        }
    }
    

    return (
        <form onSubmit={onSubmitHandler} className='m-5 w-full'>
            <p className='mb-3 text-lg font-medium'>Add Doctor</p>

            <div className='bg-white px-8 py-8 rounded-xl w-full max-w-5xl max-h-[80vh] overflow-y-auto shadow-sm'>

                {/* Upload Image */}
                <div className='flex items-center gap-4 mb-8 text-gray-500'>
                    <label htmlFor='doc-img'>
                        <img
                            className='w-16 h-16 bg-gray-100 rounded-full cursor-pointer'
                            src={docImg ? URL.createObjectURL(docImg) : assets.upload_area}
                            alt=""
                        />
                    </label>
                    <input onChange={(e) => setDocImg(e.target.files[0])} type="file" id='doc-img' hidden />
                    <p>
                        Upload doctor <br /> picture
                    </p>
                </div>

                {/* Form Fields */}
                <div className='flex flex-col lg:flex-row gap-10 text-gray-600'>

                    {/* Left Column */}
                    <div className='w-full lg:flex-1 flex flex-col gap-4'>

                        <div className='flex flex-col gap-1'>
                            <p>Doctor name</p>
                            <input onChange={(e) => setName(e.target.value)} value={name}
                                className='border border-gray-300 rounded px-3 py-2 outline-none'
                                type="text"
                                placeholder='Name'
                                required
                            />
                        </div>

                        <div className='flex flex-col gap-1'>
                            <p>Doctor Email</p>
                            <input onChange={(e) => setEmail(e.target.value)} value={email}
                                className='border border-gray-300 rounded px-3 py-2 outline-none'
                                type="email"
                                placeholder='Your email'
                                required
                            />
                        </div>

                        <div className='flex flex-col gap-1'>
                            <p>Doctor Password</p>
                            <input onChange={(e) => setPassword(e.target.value)} value={password}
                                className='border border-gray-300 rounded px-3 py-2 outline-none'
                                type="password"
                                placeholder='Password'
                                required
                            />
                        </div>

                        <div className='flex flex-col gap-1'>
                            <p>Experience</p>
                            <select onChange={(e) => setExperience(e.target.value)} value={experience} className='border border-gray-300 rounded px-3 py-2 outline-none'>
                                <option>1 Year</option>
                                <option>2 Years</option>
                                <option>3 Years</option>
                                <option>4 Years</option>
                                <option>5 Years</option>
                                <option>6 Years</option>
                                <option>7 Years</option>
                                <option>8 Years</option>
                                <option>9 Years</option>
                                <option>10 Years</option>
                            </select>
                        </div>

                        <div className='flex flex-col gap-1'>
                            <p>Fees</p>
                            <input onChange={(e) => setFees(e.target.value)} value={fees}
                                className='border border-gray-300 rounded px-3 py-2 outline-none'
                                type="number"
                                placeholder='Your fees'
                                required
                            />
                        </div>

                    </div>

                    {/* Right Column */}
                    <div className='w-full lg:flex-1 flex flex-col gap-4'>

                        <div className='flex flex-col gap-1'>
                            <p>Speciality</p>
                            <select onChange={(e) => setSpeciality(e.target.value)} value={speciality} className='border border-gray-300 rounded px-3 py-2 outline-none'>
                                <option>General physician</option>
                                <option>Gynecologist</option>
                                <option>Dermatologist</option>
                                <option>Pediatricians</option>
                                <option>Neurologist</option>
                                <option>Gastroenterologist</option>
                            </select>
                        </div>

                        <div className='flex flex-col gap-1'>
                            <p>Education</p>
                            <input onChange={(e) => setDegree(e.target.value)} value={degree}
                                className='border border-gray-300 rounded px-3 py-2 outline-none'
                                type="text"
                                placeholder='Education'
                                required
                            />
                        </div>

                        <div className='flex flex-col gap-1'>
                            <p>Address</p>

                            <input onChange={(e) => setAddress1(e.target.value)} value={address1}
                                className='border border-gray-300 rounded px-3 py-2 outline-none mb-3'
                                type="text"
                                placeholder='Address 1'
                                required
                            />

                            <input onChange={(e) => setAddress2(e.target.value)} value={address2}
                                className='border border-gray-300 rounded px-3 py-2 outline-none'
                                type="text"
                                placeholder='Address 2'
                                required
                            />
                        </div>

                    </div>

                </div>

                {/* About Doctor */}
                <div className='mt-6'>
                    <p className='mb-2 text-gray-600'>About me</p>

                    <textarea onChange={(e) => setAbout(e.target.value)} value={about}
                        rows={6}
                        className='w-full border border-gray-300 rounded px-3 py-3 outline-none resize-none'
                        placeholder='write about yourself'
                        required
                    />
                </div>

                {/* Button */}
                <button
                    type='submit'
                    className='mt-6 bg-[#5F6FFF] text-white px-12 py-3 rounded-full hover:bg-[#4f5cff] transition-all cursor-pointer'
                >
                    Add doctor
                </button>

            </div>
        </form>
    )
}

export default AddDoctor