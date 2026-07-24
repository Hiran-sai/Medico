import { AppContext } from './AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useState, useEffect } from 'react'

const AppContextProvider = ({ children }) => {
    const currencySymbol = '$'

    const backendUrl = import.meta.env.VITE_BACKEND_URL
    const [doctorsData, setDoctorsData] = useState([])

    const [token, setToken] = useState(localStorage.getItem('token') ? localStorage.getItem('token') : false)

    const [userData, setUserData] = useState(false)

    const getDoctorsData = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/doctor/list')
            if (data.success) {
                setDoctorsData(data.doctors)
                toast.success(data.message)
            }else{
                toast.error(data.message)
            }
        }
        catch(error){
            console.error(error)
            toast.error(error.message)
        }
    }

    const loadUserProfileData = async(requestAnimationFrame, res) =>{
        try{
            const {data} = await axios.get(backendUrl + '/api/user/get-profile', {headers:{token}})
            if(data.success){
                setUserData(data.userData)
            }else{
                toast.error(data.message)
            }

        }catch(error){
            console.error(error)
            toast.error(error.message)
        }
    }

    const value = {
        doctors: doctorsData,
        setDoctorsData,
        getDoctorsData,
        currencySymbol,
        backendUrl,
        token,
        setToken,
        userData,
        setUserData,
        loadUserProfileData
    }
    useEffect(() => {
        getDoctorsData()
    }, [])

    useEffect(() => {
        if(token){
            loadUserProfileData()
        }else{
            setUserData(false)
        }
    },[token])
    
    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
        
    )
}

export default AppContextProvider


// 4 35