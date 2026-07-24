import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Login from './pages/login'
import MyProfile from './pages/MyProfile'
import MyAppointments from './pages/MyAppointments'
import Appointment from './pages/Appointment'
import Home from './pages/home'
import Doctors from './pages/doctors'
import About from './pages/about'
import Contact from './pages/contact'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import { ToastContainer, toast } from 'react-toastify'
import AppContextProvider from './context/AppContextProvider'
import 'react-toastify/dist/ReactToastify.css'

const App = () => {
  return (
    <div className='mx-4 sm:mx-[10%]'>
      <ToastContainer />
      <Navbar/>
      <Routes>
        <Route path='/' element={<Home />}/>
        <Route path='/doctors' element={<Doctors />}/>
        <Route path='/doctors/:speciality' element={<Doctors />}/>
        <Route path='/login' element={<Login />}/>
        <Route path='/about' element={<About />}/>
        <Route path='/contact' element={<Contact />}/>
        <Route path='/my-profile' element={<MyProfile />}/>
        <Route path='/my-appointments' element={<MyAppointments />}/>
        <Route path='/appointment/:docId' element={<Appointment />}/>

      </Routes>
      <Footer></Footer>
    </div>
  )
}

export default App
