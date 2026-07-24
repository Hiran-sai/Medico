import React, { useContext, useEffect } from 'react'
import { AdminContext } from '../../context/AdminContext'
import { AppContext } from '../../context/AppContext'
import { assets } from '../../assets/assets'

const AllAppointments = () => {
  const { aToken, appointments, getAllAppointments, cancelAppointment } = useContext(AdminContext)
  const { calculateAge } = useContext(AppContext)

  const formatDateTime = (slotDate, slotTime) => {
    if (!slotDate) return '—'

    const [day, month, year] = slotDate.split('_')
    if (!day || !month || !year) return '—'

    return `${day}/${month}/${year}  ${slotTime}`
  }

  useEffect(() => {
    if (aToken) {
      getAllAppointments()
    }
  }, [aToken])

  return (
    <div className='w-full max-w-6xl m-5'>
      <p className='mb-3 text-lg font-medium'>All Appointments</p>
      <div className='bg-white shadow rounded text-sm max-h-[80vh] min-h-[60vh] overflow-y-scroll'>
        <div className='hidden sm:grid grid-cols-[0.5fr_3fr_1fr_3fr_3fr_1fr_1fr_1fr] py-3 px-6 shadow'>
          <p>#</p>
          <p>Patient</p>
          <p>Age</p>
          <p>Date & Time</p>
          <p>Doctor</p>
          <p>Fees</p>
          <p>Status</p>
          <p>Action</p>
        </div>
        {appointments.map((item, index) => {
          const userData = item.userData || {}
          const doctorData = item.docData || {}
          const age = calculateAge(userData.dob || userData.dateOfBirth || userData.birthDate)

          return (
            <div key={index} className='grid grid-cols-[0.5fr_3fr_1fr_3fr_3fr_1fr_1fr_1fr] items-center gap-3 text-gray-500 py-3 px-6 shadow hover:bg-gray-50'>
              <p className='max-sm:hidden'>{index + 1}</p>
              <div className='flex items-center gap-2 min-w-0'>
                <img className='w-8 h-8 rounded-full object-cover shrink-0' src={userData.image || ''} alt="" />
                <p className='truncate'>{userData.name || 'Unknown patient'}</p>
              </div>
              <p>{age}</p>
              <p>{formatDateTime(item.slotDate, item.slotTime)}</p>
              <div className='flex items-center gap-2 min-w-0'>
                <img className='w-8 h-8 rounded-full object-cover shrink-0' src={item?.docData?.image || ''} alt="" />
                <p className='truncate'>{item?.docData?.name || '—'}</p>
              </div>
              <p>{item.amount || '—'}</p>

              {item.cancelled ? (
                <p className='text-red-500 font-medium'>Cancelled</p>
              ) : item.payment ? (
                <p className='text-green-500 font-medium'>Paid</p>
              ) : (
                <p className='text-yellow-500 font-medium'>Pending</p>
              )}
              {!item.cancelled && (
                <img onClick={() => cancelAppointment(item._id)} className='w-10 cursor-pointer' src={assets.cancel_icon} alt="Cancel appointment" />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default AllAppointments
