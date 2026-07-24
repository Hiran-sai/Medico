import React, { useContext, useEffect } from "react";
import { DoctorContext } from "../../context/DoctorContext";
import { AppContext } from "../../context/AppContext";
import { assets } from "../../assets/assets";

const DoctorAppointments = () => {
    const { dToken, appointments, getAppointments, completeAppointment, cancelAppointment } = useContext(DoctorContext)
    const { calculateAge } = useContext(AppContext)

    const formatDateTime = (slotDate, slotTime) => {
        if (!slotDate) return '—'
        const [day, month, year] = slotDate.split('_')
        if (!day || !month || !year) return '—'
        return `${day}/${month}/${year} | ${slotTime}`
    }

    useEffect(() => {
        if (dToken) {
            getAppointments()
        }
    }, [dToken])

    return (
        <div className="w-full max-w-6xl m-5">
            <p className="mb-3 text-lg font-medium text-gray-700">Doctor Appointments</p>
            
            <div className="bg-white border rounded-xl text-sm max-h-[80vh] min-h-[60vh] overflow-y-scroll shadow-sm">
                
                <div className="max-sm:hidden grid grid-cols-[0.5fr_2fr_1fr_2.5fr_1fr_1fr_1fr] gap-4 py-3.5 px-6 border-b text-gray-600 font-semibold bg-gray-50/70">
                    <p>#</p>
                    <p>Patient</p>
                    <p>Age</p>
                    <p>Date & Time</p>
                    <p>Fee</p>
                    <p>Payment</p>
                    <p className="text-center">Action</p>
                </div>

                {appointments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-500 gap-2">
                        <img className="w-16 opacity-30" src={assets.appointment_icon} alt="No appointments" />
                        <p className="font-medium text-base">No appointments scheduled</p>
                    </div>
                ) : (
                    appointments.map((item, index) => {
                        const userData = item.userData || {}
                        const age = calculateAge(userData.dob || userData.dateOfBirth || userData.birthDate)

                        return (
                            <div key={item._id || index} className="grid grid-cols-1 sm:grid-cols-[0.5fr_2fr_1fr_2.5fr_1fr_1fr_1fr] items-center gap-4 py-4 px-6 border-b hover:bg-slate-50/50 transition-colors text-gray-500">
                                <p className="max-sm:hidden text-gray-400 font-medium">{index + 1}</p>
                                
                                <div className="flex items-center gap-3">
                                    <img className="w-9 h-9 rounded-full object-cover border bg-gray-100 shrink-0" src={userData.image || assets.people_icon} alt={userData.name} />
                                    <p className="text-gray-900 font-medium truncate">{userData.name || 'Unknown Patient'}</p>
                                </div>

                                <div>
                                    <span className="sm:hidden text-gray-400 font-medium mr-1">Age:</span>
                                    <span>{age}</span>
                                </div>

                                <div>
                                    <span className="sm:hidden text-gray-400 font-medium mr-1">Slot:</span>
                                    <span>{formatDateTime(item.slotDate, item.slotTime)}</span>
                                </div>

                                <div>
                                    <span className="sm:hidden text-gray-400 font-medium mr-1">Fee:</span>
                                    <span>${item.amount || '0'}</span>
                                </div>

                                <div>
                                    <span className="sm:hidden text-gray-400 font-medium mr-1">Payment:</span>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${item.payment ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                        {item.payment ? 'ONLINE' : 'CASH'}
                                    </span>
                                </div>

                                <div className="flex items-center justify-center gap-3">
                                    {item.cancelled ? (
                                        <p className="text-red-500 font-semibold text-xs bg-red-50 px-2.5 py-1 rounded-full border border-red-100">Cancelled</p>
                                    ) : item.isCompleted ? (
                                        <p className="text-green-500 font-semibold text-xs bg-green-50 px-2.5 py-1 rounded-full border border-green-100">Completed</p>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <button 
                                                onClick={() => cancelAppointment(item._id)} 
                                                className="w-8 h-8 rounded-full bg-red-50 hover:bg-red-100 flex items-center justify-center border border-red-100 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                                                title="Cancel Appointment"
                                            >
                                                <img className="w-3.5" src={assets.cancel_icon} alt="Cancel" />
                                            </button>
                                            <button 
                                                onClick={() => completeAppointment(item._id)} 
                                                className="w-8 h-8 rounded-full bg-green-50 hover:bg-green-100 flex items-center justify-center border border-green-100 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                                                title="Complete Appointment"
                                            >
                                                <img className="w-3.5" src={assets.tick_icon} alt="Complete" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    )
}

export default DoctorAppointments;