import React, { useContext, useEffect } from "react";
import { DoctorContext } from "../../context/DoctorContext";
import { assets } from "../../assets/assets";

const DoctorDashboard = () => {
    const { dToken, getDashData, dashData, completeAppointment, cancelAppointment } = useContext(DoctorContext)

    const formatDateTime = (slotDate, slotTime) => {
        if (!slotDate) return '—'
        const [day, month, year] = slotDate.split('_')
        if (!day || !month || !year) return '—'
        return `${day}/${month}/${year} | ${slotTime}`
    }

    useEffect(() => {
        if (dToken) {
            getDashData()
        }
    }, [dToken])

    return dashData ? (
        <div className="w-full max-w-6xl m-5">
            {/* Statistics Cards */}
            <div className="flex flex-wrap gap-4 mb-8">
                {/* Earnings Card */}
                <div className="flex items-center gap-4 bg-white p-6 min-w-[240px] flex-1 border rounded-xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-14 h-14 rounded-full bg-[#f2f3ff] flex items-center justify-center shrink-0">
                        <img className="w-8" src={assets.earning_icon} alt="Earnings" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-800">${dashData.earnings}</p>
                        <p className="text-gray-500 text-sm font-medium">Earnings</p>
                    </div>
                </div>

                {/* Appointments Card */}
                <div className="flex items-center gap-4 bg-white p-6 min-w-[240px] flex-1 border rounded-xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-14 h-14 rounded-full bg-[#f2f3ff] flex items-center justify-center shrink-0">
                        <img className="w-8" src={assets.appointments_icon} alt="Appointments" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-800">{dashData.appointments}</p>
                        <p className="text-gray-500 text-sm font-medium">Appointments</p>
                    </div>
                </div>

                {/* Patients Card */}
                <div className="flex items-center gap-4 bg-white p-6 min-w-[240px] flex-1 border rounded-xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-14 h-14 rounded-full bg-[#f2f3ff] flex items-center justify-center shrink-0">
                        <img className="w-8" src={assets.patients_icon} alt="Patients" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-800">{dashData.patients}</p>
                        <p className="text-gray-500 text-sm font-medium">Patients</p>
                    </div>
                </div>
            </div>

            {/* Latest Appointments List */}
            <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 px-6 py-4 border-b bg-gray-50/70">
                    <img className="w-6" src={assets.list_icon} alt="List" />
                    <p className="font-semibold text-gray-700">Latest Appointments</p>
                </div>

                <div className="divide-y divide-gray-100">
                    {dashData.latestAppointments.length === 0 ? (
                        <div className="p-8 text-center text-gray-400">
                            No appointments found.
                        </div>
                    ) : (
                        dashData.latestAppointments.map((item, index) => {
                            const userData = item.userData || {}

                            return (
                                <div key={item._id || index} className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 hover:bg-slate-50/50 transition-colors">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <img className="w-10 h-10 rounded-full object-cover border bg-gray-100 shrink-0" src={userData.image || assets.people_icon} alt={userData.name} />
                                        <div>
                                            <p className="text-gray-900 font-semibold truncate">{userData.name || 'Unknown Patient'}</p>
                                            <p className="text-gray-400 text-xs mt-0.5">{formatDateTime(item.slotDate, item.slotTime)}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 shrink-0">
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
        </div>
    ) : null
}

export default DoctorDashboard;