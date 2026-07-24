import { createContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const DoctorContext = createContext()

const DoctorContextProvider = (props) => {

    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const [dToken, setDToken] = useState(localStorage.getItem('dToken') || "");

    const [appointments, setAppointments] = useState([]);
    const [profileData, setProfileData] = useState(false);
    const [dashData, setDashData] = useState(false);

    const getAppointments = async () => {
        if (!dToken) return

        try{
            const {data} = await axios.get(backendUrl + '/api/doctor/appointments', {headers: {dToken}})
            if(data.success){
                setAppointments(Array.isArray(data.appointments) ? data.appointments.reverse() : [])
            }else{
                toast.error(data.message);
            }
            
        }catch(error){
            console.log(error);
            toast.error(error.response?.data?.message || error.message || 'Failed to load appointments');
        }
    }

    const completeAppointment = async (appointmentId) => {
        try {
            const { data } = await axios.post(backendUrl + '/api/doctor/complete-appointment', { appointmentId }, { headers: { dToken } })
            if (data.success) {
                toast.success(data.message)
                getAppointments()
                getDashData()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.response?.data?.message || error.message)
        }
    }

    const cancelAppointment = async (appointmentId) => {
        try {
            const { data } = await axios.post(backendUrl + '/api/doctor/cancel-appointment', { appointmentId }, { headers: { dToken } })
            if (data.success) {
                toast.success(data.message)
                getAppointments()
                getDashData()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.response?.data?.message || error.message)
        }
    }

    const getProfile = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/doctor/profile', { headers: { dToken } })
            if (data.success) {
                setProfileData(data.profileData)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.response?.data?.message || error.message)
        }
    }

    const getDashData = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/doctor/dashboard', { headers: { dToken } })
            if (data.success) {
                setDashData(data.dashData)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.response?.data?.message || error.message)
        }
    }

    const updateProfile = async (updateData) => {
        try {
            const { data } = await axios.post(backendUrl + '/api/doctor/update-profile', updateData, { headers: { dToken } })
            if (data.success) {
                toast.success(data.message)
                getProfile()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.response?.data?.message || error.message)
        }
    }

    useEffect(() => {
        if (dToken) {
            localStorage.setItem('dToken', dToken)
        } else {
            localStorage.removeItem('dToken')
        }
    }, [dToken])

    const value = {
        backendUrl,
        dToken,
        setDToken,
        appointments,
        getAppointments,
        setAppointments,
        profileData,
        setProfileData,
        getProfile,
        dashData,
        setDashData,
        getDashData,
        completeAppointment,
        cancelAppointment,
        updateProfile
    }
    return (
        <DoctorContext.Provider value={value}>
            {props.children}
        </DoctorContext.Provider>
    )
}
export default DoctorContextProvider