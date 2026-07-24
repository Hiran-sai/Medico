import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { assets } from '../assets/assets'
import RelatedDoctors from '../components/RelatedDoctors'
import { toast } from 'react-toastify'
import axios from 'axios'

const Appointment = () => {

  const { docId } = useParams()
  const { doctors, currencySymbol, backendUrl, token, getDoctorsData } = useContext(AppContext)
  const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

  const navigate = useNavigate()

  const [docInfo, setDocInfo] = useState(null)
  const [docSlots, setDocSlots] = useState([])
  const [slotIndex, setSlotIndex] = useState(0)
  const [slotTime, setSlotTime] = useState('')
  const [isBooking, setIsBooking] = useState(false)

  const fetchDocInfo = async () => {
    const docInfo = doctors.find(doc => doc._id === docId)
    setDocInfo(docInfo)
  }

  const getAvailableSlots = async () => {
    if (!docInfo) return

    const slotsByDay = []
    const bookedSlots = docInfo?.slots_booked || {}

    //getting current date
    let today = new Date()

    for (let i = 0; i < 7; i++) {
      let currentDate = new Date(today)
      currentDate.setDate(today.getDate() + i)

      //Setting end time
      let endTime = new Date(today)
      endTime.setDate(today.getDate() + i)
      endTime.setHours(21, 0, 0, 0)

      //setting Hours
      if (today.getDate() === currentDate.getDate()) {
        currentDate.setHours(currentDate.getHours() > 10 ? currentDate.getHours() + 1 : 10)
        currentDate.setMinutes(currentDate.getMinutes() > 30 ? 30 : 0)
      } else {
        currentDate.setHours(10)
        currentDate.setMinutes(0)
      }

      let timeSlots = []

      while (currentDate <= endTime) {
        let formattedTime = currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

        let day = currentDate.getDate()
        let month = currentDate.getMonth() + 1
        let year = currentDate.getFullYear()

        const slotDate = day + "_" + month + "_" + year
        const slotTime = formattedTime

        const isSlotAvailable = !(bookedSlots[slotDate] && bookedSlots[slotDate].includes(slotTime))

        if (isSlotAvailable) {
          timeSlots.push({
            datetime: new Date(currentDate),
            time: formattedTime
          })
        }


        //Incrementing time by 30 minutes
        currentDate.setMinutes(currentDate.getMinutes() + 30)
      }

      if (timeSlots.length > 0) {
        slotsByDay.push(timeSlots)
      }
    }

    setDocSlots(slotsByDay)
    setSlotIndex(0)
    setSlotTime(slotsByDay[0]?.[0]?.time || '')
  }

  const bookAppointment = async () => {
    if (!token) {
      toast.warn("Login to book Appointment")
      return navigate('/login')
    }

    if (isBooking) return

    setIsBooking(true)

    try {
      const date = docSlots[slotIndex][0].datetime

      let day = date.getDate()
      let month = date.getMonth() + 1
      let year = date.getFullYear()

      const slotDate = day + "_" + month + "_" + year

      const { data } = await axios.post(backendUrl + '/api/user/book-appointment', { docId, slotDate, slotTime }, { headers: { token } })
      if (data.success) {
        toast.success(data.message)
        getDoctorsData()
        navigate('/my-appointments')
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.error(error)
      toast.error(error.message || 'Failed to book appointment')
    } finally {
      setIsBooking(false)
    }
  }


  useEffect(() => {
    fetchDocInfo()
  }, [doctors, docId])

  useEffect(() => {
    getAvailableSlots()
  }, [docInfo])

  if (!docInfo) return <div>Loading...</div>;

  return docInfo && (
    <div>
      {/* Doctor Details */}
      <div className='flex flex-col sm:flex-row gap-4'>
        <div>
          <img className='bg-[#5f6FFF] w-full sm:max-w-72 rounded-lg' src={docInfo.image} alt='' />
        </div>
        <div className='flex-1 border border-gray-400 rounded-lg p-8 py-7 bg-white mx-2 sm:mx-0 -mt-20 sm:mt-0'>
          {/* Doc info i.e; name, degree.... */}
          <p className='flex items-center gap-2 text-2xl font-medium text-gray-900'>{docInfo.name}
            <img className='w-5' src={assets.verified_icon} alt='' /></p>
          <div className='flex items-center gap-2 text-sm mt-1 text-gray-600'>
            <p>
              {docInfo.degree} - {docInfo.speciality}
            </p>
            <button className='py-0.5 px-2 border text-xs rounded-full'>{docInfo.experience}</button>
          </div>

          {/* Doctor About */}
          <div>
            <p className='flex items-center gap-1 text-sm font-medium text-gray-900 mt-3 '>
              About <img src={assets.info_icon} alt='' />
            </p>
            <p className='text-sm text-gray-500 max-w-175 mt-1'>{docInfo.about}</p>
          </div>
          <p className='text-gray-500 font-medium mt-4'>
            Appointment fee: <span className='text-gray-600'>{currencySymbol}{docInfo.fee ?? docInfo.fees ?? 0}</span>
          </p>
        </div>
      </div>

      {/* Booking Slots */}
      <div className='sm:ml-72 sm:pl-4 mt-4 font-medium text-gray-700'>
        <p>Booking Slots</p>
        <div className='flex gap-3 mt-4 items-center w-full overflow-x-scroll'>
          {
            docSlots.length && docSlots.map((item, index) => (
              <div onClick={() => setSlotIndex(index)} className={`text-center py-6 min-w-16 rounded-full cursor-pointer ${slotIndex === index ? 'bg-[#5f6FFF] text-white' : 'border border-gray-200'}`} key={index}>
                <p>{item[0] && daysOfWeek[item[0].datetime.getDay()]}</p>
                <p>{item[0] && item[0].datetime.getDate()}</p>
              </div>
            ))
          }

        </div>
        <div className='flex gap-3 mt-4 items-center w-full overflow-x-scroll'>
          {docSlots[slotIndex]?.map((item, index) => (
            <p
              key={index}
              onClick={() => setSlotTime(item.time)}
              className={`text-sm font-light shrink-0 px-5 py-2 rounded-full cursor-pointer ${item.time === slotTime
                ? 'bg-[#5f6FFF] text-white'
                : 'text-gray-400 border border-gray-300'
                }`}
            >
              {item.time.toLowerCase()}
            </p>
          ))}
        </div>
        <button
          onClick={bookAppointment}
          disabled={isBooking || !slotTime}
          className={`mt-6 text-sm font-light px-14 py-3 rounded-full ${isBooking || !slotTime ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#5f6FFF] cursor-pointer text-white'}`}
        >
          {isBooking ? 'Booking...' : 'Book an appointment'}
        </button>
      </div>

      {/* Listing Related Doctors */}
      <RelatedDoctors docId={docId} speciality={docInfo.speciality}></RelatedDoctors>
    </div>
  )
}

export default Appointment
