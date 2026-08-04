import React from 'react'
import Login from './pages/Login'
import { ToastContainer } from 'react-toastify';
import { useContext } from 'react';
import { AdminContext } from './context/AdminContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import { Navigate, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Admin/Dashboard';
import AllAppointments from './pages/Admin/AllAppointments';
import AddDoctor from './pages/Admin/AddDoctor';
import DoctorsList from './pages/Admin/DoctorsList';
import { DoctorContext } from './context/DoctorContext';
import DoctorAppointments from './pages/Doctor/DoctorAppointments';
import DoctorDashboard from './pages/Doctor/DoctorDashboard';
import DoctorProfile from './pages/Doctor/DoctorProfile';

const App = () => {

  const {aToken} = useContext(AdminContext)
  const {dToken} = useContext(DoctorContext)
  const isLoggedIn = Boolean(aToken || dToken)

  return (
    <>
      <ToastContainer />
      {isLoggedIn ? (
        <div className='bg-[#f8f9fd]'>
          <Navbar />
          <div className='flex items-start'>
            <Sidebar />
            <Routes>
              <Route path='/' element={<Navigate to={aToken ? '/admin-dashboard' : '/doctor-dashboard'} replace />} />
              <Route path='/login' element={<Navigate to={aToken ? '/admin-dashboard' : '/doctor-dashboard'} replace />} />
              <Route path='/admin-dashboard' element={<Dashboard/>}/>
              <Route path='/all-appointments' element={<AllAppointments/>}/>
              <Route path='/add-doctor' element={<AddDoctor/>}/>
              <Route path='/doctor-list' element={<DoctorsList/>}/>

              <Route path='/doctor-dashboard' element={<DoctorDashboard/>}/>
              <Route path='/doctor-profile' element={<DoctorProfile/>}/>
              <Route path='/doctor-appointments' element={<DoctorAppointments/>}/>
              <Route path='*' element={<Navigate to={aToken ? '/admin-dashboard' : '/doctor-dashboard'} replace />} />
            </Routes>
          </div>
        </div>
      ) : (
        <Routes>
          <Route path='/' element={<Navigate to='/login' replace />} />
          <Route path='/login' element={<Login />} />
          <Route path='*' element={<Navigate to='/login' replace />} />
        </Routes>
      )}
    </>
  )
}

export default App
