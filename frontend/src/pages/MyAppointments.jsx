import React from 'react'
import { useContext, useState, useEffect } from 'react'
import axios from 'axios'
import { AppContext } from '../context/AppContext'
import { toast } from 'react-toastify'

const MyAppointments = () => {

  const { backendUrl, token, getDoctorsData } = useContext(AppContext)
  const [appointments, setAppointments] = useState([])

  const months = ["","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  const slotDateFormat = (slotDate) => {
    const dateArray = slotDate.split('_');
    return dateArray[0] + " " + months[Number(dateArray[1]) ] + " " + dateArray[2]

  }

  const fetchAppointments = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/user/appointments`, {
        headers: {
          token
        }
      })
      if (data.success) {
        setAppointments(data.appointments.reverse())
        console.log(data.appointments)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.response?.data?.message || 'Failed to fetch appointments')
    }
  }

  const cancelAppointment = async(appointmentId) => {
    try{

      const {data} = await axios.post(backendUrl + '/api/user/cancel-appointment', {appointmentId}, {headers:{token}})

      if(data.success){
        toast.success(data.message)
        fetchAppointments()
        getDoctorsData()
      }else{
        toast.error(data.message)
      }

    }catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  const verifyPayment = async (response, appointmentId) => {
    try {
      const { data } = await axios.post(`${backendUrl}/api/user/verify-razorpay`, {
        appointmentId,
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature
      }, {
        headers: { token }
      })

      if (data.success) {
        toast.success(data.message || 'Payment verified successfully')
        fetchAppointments()
      } else {
        toast.error(data.message || 'Payment verification failed')
      }
    } catch (error) {
      console.log(error)
      toast.error(error.response?.data?.message || 'Payment verification failed')
    }
  }

  const initpay = (order, appointmentId) => {
    const options = {
      "key": import.meta.env.VITE_RAZORPAY_KEY_ID,
      "amount": order.amount,
      "currency": order.currency,
      "name": "Medico",
      "description": "Payment for Appointment",
      "image": "https://cdn-icons-png.flaticon.com/512/414/414031.png",
      "order_id": order.id,
      "receipt": order.receipt,
      "handler": (response) => {
        verifyPayment(response, appointmentId)
      },
      "prefill": {
        "name": "John Doe",
        "email": "[EMAIL_ADDRESS]",
        "contact": "9876543210"
      },
      "notes": {
        "address": "Billing Address"
      },
      "theme": {
        "color": "#3399cc"
      }
    }
    const rzpay = new window.Razorpay(options)
    rzpay.open()
  }

  const appointmentRazorpay = async(appointmentId) => {
    try{

      const {data} = await axios.post(backendUrl + '/api/user/payment-razorpay', {appointmentId}, {headers:{token}})

      if(data.success){
        initpay(data.order, appointmentId)
      }else{
        toast.error(data.message)
      }

    }catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  useEffect(() => {
    if(token){
      fetchAppointments()
    }
  }, [token])

  return (
    <div>
      <p className='pb-3 mt-12 font-medium text-zinc-700 border-b border-gray-500'>My Appointments</p>
      <div>
        {
          appointments.map((item, index) => (
            <div className='grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-2 border-b border-gray-200' key={index}>
              <div>
                <img className='w-32 bg-indigo-50' src={item.docData.image} alt="" />
              </div>
              <div className='flex-1 text-sm text-zinc-600'>
                <p className='text-neutral-800 font-semibold'>{item.docData.name}</p>
                <p>{item.docData.speciality}</p>
                <p className='text-zinc-700 font-medium mt-1'>Address:</p>
                <p className='text-xs'>{item.docData.address.line1}</p>
                <p className='text-xs'>{item.docData.address.line2}</p>
                <p className='mt-1'><span className='text-sm text-neutral-700 font-medium'>Date & Time</span> {slotDateFormat(item.slotDate)} | {item.slotTime}</p>
                <p className='text-xs'><span className='text-sm text-neutral-700 font-medium'>Amount:</span> {item.amount}</p>
              </div>
              <div>
              </div>
              <div className='flex flex-col gap-2 justify-end'>
                {!item.cancelled && !item.isCompleted && (
                  item.payment ? (
                    <button className='text-sm text-white text-center sm:min-w-48 py-2 border rounded bg-green-600 cursor-default'>Paid</button>
                  ) : (
                    <button onClick={() => appointmentRazorpay(item._id)} className='text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded hover:bg-[#5f6FFF] hover:text-white transition-all duration-300'>Pay Online</button>
                  )
                )}
                {item.isCompleted && (
                  <button className='text-sm text-green-500 text-center sm:min-w-48 py-2 border border-green-500 rounded bg-green-50 cursor-default'>Completed</button>
                )}
                {item.cancelled && (
                  <button className='text-sm text-red-500 text-center sm:min-w-48 py-2 border border-red-500 rounded bg-red-50 cursor-default'>Cancelled</button>
                )}
                {!item.cancelled && !item.isCompleted && (
                  <button onClick={() => cancelAppointment(item._id)} className='text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded hover:bg-red-600 hover:text-white transition-all duration-300'>Cancel</button>
                )}
              </div>
            </div>
          ))
        }
      </div>
    </div>
  )
}

export default MyAppointments
