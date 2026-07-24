import React, { useContext, useEffect, useState } from "react";
import { DoctorContext } from "../../context/DoctorContext";

const DoctorProfile = () => {
    const { dToken, profileData, getProfile, updateProfile } = useContext(DoctorContext)

    const [isEdit, setIsEdit] = useState(false)
    const [about, setAbout] = useState("")
    const [fees, setFees] = useState("")
    const [address1, setAddress1] = useState("")
    const [address2, setAddress2] = useState("")
    const [available, setAvailable] = useState(false)

    useEffect(() => {
        if (dToken) {
            getProfile()
        }
    }, [dToken])

    useEffect(() => {
        if (profileData) {
            setAbout(profileData.about || "")
            setFees(profileData.fee !== undefined ? profileData.fee : "")
            setAddress1(profileData.address?.line1 || "")
            setAddress2(profileData.address?.line2 || "")
            setAvailable(!!profileData.available)
        }
    }, [profileData])

    const handleSave = async () => {
        const updatedData = {
            fees,
            address: { line1: address1, line2: address2 },
            available,
            about
        }
        await updateProfile(updatedData)
        setIsEdit(false)
    }

    if (!profileData) {
        return (
            <div className="p-8 text-gray-500">
                Loading profile...
            </div>
        )
    }

    return (
        <div className="w-full max-w-4xl m-5">
            <div className="flex flex-col gap-4 bg-white p-8 rounded-xl border shadow-sm">
                
                {/* Photo and Header Details */}
                <div className="flex flex-col sm:flex-row gap-6 items-start">
                    <img className="w-full sm:w-64 h-64 rounded-xl object-cover border bg-gray-50 shrink-0" src={profileData.image} alt={profileData.name} />
                    
                    <div className="flex-1">
                        <p className="text-3xl font-semibold text-gray-800">{profileData.name}</p>
                        
                        <div className="flex items-center gap-2 mt-1 text-gray-600 text-base">
                            <p>{profileData.degree} - {profileData.speciality}</p>
                            <span className="px-2 py-0.5 text-xs font-semibold bg-blue-50 text-blue-600 rounded-full border border-blue-100">{profileData.experience}</span>
                        </div>

                        {/* Speciality Badge */}
                        <div className="mt-2">
                            <span className="px-3 py-1 text-xs font-medium bg-[#f2f3ff] text-[#5f6fff] rounded-full border border-[#e2e4ff]">
                                {profileData.speciality}
                            </span>
                        </div>

                        {/* About Section */}
                        <div className="mt-5">
                            <p className="text-gray-800 font-semibold text-base mb-1">About:</p>
                            {isEdit ? (
                                <textarea 
                                    className="w-full border rounded-lg p-3 text-sm text-gray-600 focus:outline-none focus:border-[#5f6fff]" 
                                    rows="4" 
                                    value={about} 
                                    onChange={(e) => setAbout(e.target.value)}
                                />
                            ) : (
                                <p className="text-gray-600 text-sm leading-relaxed">{about || "No description provided."}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Additional Info Grid */}
                <div className="border-t pt-6 mt-4 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                    {/* Left Column: Fees and Availability */}
                    <div className="flex flex-col gap-4">
                        <div>
                            <p className="text-gray-500 font-medium mb-1">Appointment Fee:</p>
                            {isEdit ? (
                                <div className="flex items-center gap-1.5 max-w-[200px]">
                                    <span className="text-gray-600 font-medium">$</span>
                                    <input 
                                        className="w-full border rounded px-2.5 py-1.5 text-sm text-gray-600 focus:outline-none focus:border-[#5f6fff]" 
                                        type="number" 
                                        value={fees} 
                                        onChange={(e) => setFees(e.target.value)}
                                    />
                                </div>
                            ) : (
                                <p className="text-gray-800 font-semibold text-base">${fees || "0"}</p>
                            )}
                        </div>

                        <div className="flex items-center gap-2 mt-1">
                            <input 
                                className="w-4 h-4 text-[#5f6fff] border-gray-300 rounded focus:ring-[#5f6fff] cursor-pointer" 
                                type="checkbox" 
                                id="available" 
                                checked={available} 
                                disabled={!isEdit}
                                onChange={(e) => setAvailable(e.target.checked)}
                            />
                            <label className="text-gray-700 font-medium cursor-pointer select-none" htmlFor="available">Available for Bookings</label>
                        </div>
                    </div>

                    {/* Right Column: Address */}
                    <div>
                        <p className="text-gray-500 font-medium mb-1.5">Clinic Address:</p>
                        {isEdit ? (
                            <div className="flex flex-col gap-2 max-w-[320px]">
                                <input 
                                    className="border rounded px-2.5 py-1.5 text-sm text-gray-600 focus:outline-none focus:border-[#5f6fff]" 
                                    placeholder="Address Line 1" 
                                    type="text" 
                                    value={address1} 
                                    onChange={(e) => setAddress1(e.target.value)}
                                />
                                <input 
                                    className="border rounded px-2.5 py-1.5 text-sm text-gray-600 focus:outline-none focus:border-[#5f6fff]" 
                                    placeholder="Address Line 2" 
                                    type="text" 
                                    value={address2} 
                                    onChange={(e) => setAddress2(e.target.value)}
                                />
                            </div>
                        ) : (
                            <div className="text-gray-800 font-medium leading-relaxed">
                                <p>{address1 || "—"}</p>
                                <p>{address2 || "—"}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Edit / Save Buttons */}
                <div className="flex items-center justify-end gap-3 border-t pt-6 mt-4">
                    {isEdit ? (
                        <>
                            <button 
                                onClick={() => setIsEdit(false)} 
                                className="px-6 py-2 border rounded-full text-gray-600 hover:bg-gray-50 active:scale-95 transition-all text-sm font-medium cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleSave} 
                                className="px-6 py-2 bg-[#5f6fff] text-white rounded-full hover:bg-[#4b5cff] active:scale-95 transition-all text-sm font-medium shadow-sm hover:shadow cursor-pointer"
                            >
                                Save Changes
                            </button>
                        </>
                    ) : (
                        <button 
                            onClick={() => setIsEdit(true)} 
                            className="px-8 py-2.5 border border-[#5f6fff] text-[#5f6fff] hover:bg-[#f8f9ff] active:scale-95 transition-all rounded-full text-sm font-semibold cursor-pointer"
                        >
                            Edit Profile
                        </button>
                    )}
                </div>

            </div>
        </div>
    )
}

export default DoctorProfile;