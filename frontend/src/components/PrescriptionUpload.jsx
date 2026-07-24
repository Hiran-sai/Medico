import React, { useState, useContext, useRef } from 'react'
import { AppContext } from '../context/AppContext'
import { toast } from 'react-toastify'
import axios from 'axios'

const PrescriptionUpload = ({ onUploadSuccess }) => {
  const { token, backendUrl } = useContext(AppContext)
  const [image, setImage] = useState(null)
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0])
    }
  }

  const clearSelectedImage = () => {
    setImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleUpload = async () => {
    if (!image) {
      toast.error('Please select an image first.')
      return
    }

    try {
      setLoading(true)
      const formData = new FormData()
      formData.append('image', image)

      const { data } = await axios.post(
        `${backendUrl}/api/prescription/upload`,
        formData,
        {
          headers: {
            token,
            'Content-Type': 'multipart/form-data',
          },
        }
      )

      if (data.success) {
        toast.success(data.message || 'Prescription uploaded successfully.')
        clearSelectedImage()
        if (onUploadSuccess) {
          onUploadSuccess()
        }
      } else {
        toast.error(data.message || 'Failed to process prescription.')
        // Even if it partial-failed (Gemini failed but Cloudinary succeeded), we want to reload the list to show the failed record.
        if (onUploadSuccess) {
          onUploadSuccess()
        }
      }
    } catch (error) {
      console.error(error)
      const errorMsg = error.response?.data?.message || error.message || 'Server error'
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-4 w-full'>
      <h3 className='text-lg font-semibold text-neutral-800'>Upload Prescription</h3>
      <p className='text-xs text-neutral-500 -mt-2'>
        Upload a clear photo of your prescription to extract a structured timetable.
      </p>

      <div className='flex flex-col items-center justify-center border-2 border-dashed border-blue-200 hover:border-[#5f6FFF] hover:bg-blue-50/20 rounded-xl p-4 transition-all relative min-h-[140px] cursor-pointer'>
        {image ? (
          <div className='flex flex-col items-center gap-3 w-full'>
            <img
              src={URL.createObjectURL(image)}
              alt="Prescription Preview"
              className='max-h-36 object-contain rounded shadow-sm'
            />
            <button
              type='button'
              onClick={clearSelectedImage}
              className='text-xs text-red-500 hover:underline'
              disabled={loading}
            >
              Remove Image
            </button>
          </div>
        ) : (
          <label className='flex flex-col items-center justify-center cursor-pointer w-full h-full py-4'>
            <svg
              className='w-8 h-8 text-neutral-400 mb-2'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
              ></path>
            </svg>
            <span className='text-xs font-medium text-neutral-600'>Select prescription photo</span>
            <span className='text-[10px] text-neutral-400 mt-1'>PNG, JPG, JPEG</span>
            <input
              ref={fileInputRef}
              type='file'
              accept='image/*'
              onChange={handleFileChange}
              className='hidden'
              disabled={loading}
            />
          </label>
        )}
      </div>

      <button
        onClick={handleUpload}
        disabled={loading || !image}
        className={`w-full py-2.5 rounded-full text-white font-medium text-xs flex items-center justify-center gap-2 transition-all ${
          loading || !image
            ? 'bg-gray-300 cursor-not-allowed'
            : 'bg-[#5f6FFF] hover:bg-opacity-95 cursor-pointer shadow-sm shadow-blue-200'
        }`}
      >
        {loading ? (
          <>
            <svg
              className='animate-spin h-4 w-4 text-white'
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
            >
              <circle
                className='opacity-25'
                cx='12'
                cy='12'
                r='10'
                stroke='currentColor'
                strokeWidth='4'
              ></circle>
              <path
                className='opacity-75'
                fill='currentColor'
                d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
              ></path>
            </svg>
            Processing OCR & Gemini...
          </>
        ) : (
          'Upload and Process'
        )}
      </button>
    </div>
  )
}

export default PrescriptionUpload
