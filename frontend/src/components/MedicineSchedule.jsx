import React, { useEffect, useState, useContext, forwardRef, useImperativeHandle } from 'react'
import { AppContext } from '../context/AppContext'
import { toast } from 'react-toastify'
import axios from 'axios'

const MedicineSchedule = forwardRef((props, ref) => {
  const { token, backendUrl } = useContext(AppContext)
  const [prescriptions, setPrescriptions] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchSchedule = async () => {
    if (!token) return
    try {
      setLoading(true)
      const { data } = await axios.get(`${backendUrl}/api/prescription/schedule`, {
        headers: { token },
      })
      if (data.success) {
        setPrescriptions(data.prescriptions || [])
      } else {
        toast.error(data.message || 'Failed to fetch schedule.')
      }
    } catch (error) {
      console.error(error)
      toast.error(error.message || 'Error fetching schedule.')
    } finally {
      setLoading(false)
    }
  }

  // Expose fetchSchedule to parent via ref
  useImperativeHandle(ref, () => ({
    refresh: fetchSchedule,
  }))

  useEffect(() => {
    if (token) {
      fetchSchedule()
    }
  }, [token])

  // Helper to filter medicines belonging to a specific timing slot
  const getMedicinesForTiming = (medicines, timingSlot) => {
    return medicines.filter((med) => {
      if (!med.timings || !Array.isArray(med.timings)) return false
      return med.timings.some((t) => t.toLowerCase() === timingSlot.toLowerCase())
    })
  }

  const getUnscheduledMedicines = (medicines) => {
    return (medicines || []).filter((med) => !med.timings || med.timings.length === 0)
  }

  const formatTime = (dateStr) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const renderMedicineCard = (med, key) => (
    <div
      key={key}
      className='bg-white border border-neutral-100 p-2.5 rounded-lg shadow-sm hover:border-blue-200 transition-colors'
    >
      <div className='font-semibold text-xs text-neutral-800 break-words'>
        {med.name || 'Unnamed medicine'}
      </div>

      {med.dosage && (
        <div className='text-[10px] text-neutral-600 mt-1 font-medium'>
          Dosage: <span className='text-neutral-800 font-normal'>{med.dosage}</span>
        </div>
      )}

      {med.frequency && (
        <div className='text-[10px] text-neutral-600 font-medium'>
          Freq: <span className='text-neutral-800 font-normal'>{med.frequency}</span>
        </div>
      )}

      {med.duration && (
        <div className='text-[10px] text-neutral-600 font-medium'>
          Dur: <span className='text-neutral-800 font-normal'>{med.duration}</span>
        </div>
      )}

      {med.instructions && (
        <div className='text-[10px] text-amber-700 bg-amber-50/50 px-1.5 py-0.5 rounded mt-1.5 font-medium border border-amber-100/50 break-words'>
          {med.instructions}
        </div>
      )}
    </div>
  )

  return (
    <div className='w-full flex flex-col gap-6'>
      <div className='flex justify-between items-center border-b border-gray-100 pb-3'>
        <h3 className='text-xl font-semibold text-neutral-800 flex items-center gap-2'>
          <span>Prescription Timetables</span>
          <span className='bg-blue-50 text-[#5f6FFF] text-xs font-semibold px-2.5 py-0.5 rounded-full'>
            {prescriptions.length}
          </span>
        </h3>
        <button
          onClick={fetchSchedule}
          disabled={loading}
          className='text-xs text-[#5f6FFF] hover:underline flex items-center gap-1 font-medium cursor-pointer'
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {loading && prescriptions.length === 0 ? (
        <div className='flex justify-center items-center py-10'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-[#5f6FFF]'></div>
        </div>
      ) : prescriptions.length === 0 ? (
        <div className='bg-gray-50 border border-dashed border-gray-200 rounded-2xl py-12 px-4 text-center'>
          <p className='text-neutral-500 text-sm font-medium'>No prescriptions uploaded yet.</p>
          <p className='text-xs text-neutral-400 mt-1'>
            Upload a prescription image above to view your schedule.
          </p>
        </div>
      ) : (
        <div className='flex flex-col gap-6'>
          {prescriptions.map((prescription) => (
            <div
              key={prescription._id}
              className='bg-white border border-blue-100 rounded-2xl p-5 md:p-6 shadow-sm hover:shadow-md transition-shadow duration-300'
            >
              {/* Prescription Header */}
              <div className='flex flex-wrap justify-between items-center gap-3 border-b border-neutral-100 pb-4 mb-4'>
                <div className='flex flex-col gap-0.5'>
                  <span className='text-xs font-medium text-neutral-400'>UPLOADED ON</span>
                  <span className='text-sm font-semibold text-neutral-800'>
                    {formatTime(prescription.createdAt)}
                  </span>
                </div>

                <div className='flex items-center gap-3'>
                  {/* Status Badge */}
                  {prescription.status === 'completed' && (
                    <span className='bg-green-50 text-green-700 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5'>
                      <span className='w-1.5 h-1.5 bg-green-500 rounded-full'></span>
                      Processed
                    </span>
                  )}
                  {prescription.status === 'processing' && (
                    <span className='bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 animate-pulse'>
                      <span className='w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping'></span>
                      Processing
                    </span>
                  )}
                  {prescription.status === 'failed' && (
                    <span className='bg-red-50 text-red-700 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5'>
                      <span className='w-1.5 h-1.5 bg-red-500 rounded-full'></span>
                      Failed
                    </span>
                  )}

                  <a
                    href={prescription.imageUrl}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-xs text-[#5f6FFF] hover:text-blue-700 font-semibold border border-blue-200 px-3 py-1 rounded-full hover:bg-blue-50/50 transition-colors'
                  >
                    View Image
                  </a>
                </div>
              </div>

              {/* Status Specific Content */}
              {prescription.status === 'processing' && (
                <div className='text-center py-6 text-neutral-500 text-sm'>
                  <div className='animate-pulse flex flex-col items-center gap-2'>
                    <div className='h-2 w-1/3 bg-gray-200 rounded'></div>
                    <div className='h-2 w-1/4 bg-gray-200 rounded'></div>
                  </div>
                  <p className='mt-3 text-xs text-neutral-400'>
                    We are currently extracting text and parsing your medication schedule...
                  </p>
                </div>
              )}

              {prescription.status === 'failed' && (
                <div className='bg-red-50/50 border border-red-100 rounded-xl p-4 text-center my-2'>
                  <p className='text-red-700 font-medium text-sm'>Schedule Extraction Failed</p>
                  <p className='text-xs text-red-500 mt-1'>
                    The OCR text could not be successfully structured into a medicine schedule.
                  </p>
                  {prescription.rawExtractedText && (
                    <details className='mt-3 text-left bg-white p-3 rounded border border-neutral-100'>
                      <summary className='text-xs font-medium text-neutral-600 cursor-pointer outline-none'>
                        View Raw Extracted Text
                      </summary>
                      <pre className='text-[10px] text-neutral-500 font-mono whitespace-pre-wrap mt-2 overflow-x-auto max-h-32'>
                        {prescription.rawExtractedText}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              {prescription.status === 'completed' && (
                <div>
                  {/* Timetable Grid */}
                  <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-2'>
                    {['Morning', 'Afternoon', 'Evening', 'Night'].map((slot) => {
                      const list = getMedicinesForTiming(prescription.medicines || [], slot)
                      return (
                        <div
                          key={slot}
                          className='bg-neutral-50/60 border border-neutral-100 rounded-xl p-4 flex flex-col gap-3 min-h-[160px]'
                        >
                          <div className='flex items-center justify-between border-b border-neutral-100 pb-2'>
                            <span className='font-semibold text-xs uppercase tracking-wider text-neutral-600'>
                              {slot}
                            </span>
                            <span className='text-[10px] text-neutral-400'>
                              {slot === 'Morning' && '08:00 - 12:00'}
                              {slot === 'Afternoon' && '12:00 - 16:00'}
                              {slot === 'Evening' && '16:00 - 20:00'}
                              {slot === 'Night' && '20:00 - 00:00'}
                            </span>
                          </div>

                          <div className='flex flex-col gap-2 flex-grow'>
                            {list.length > 0 ? (
                              list.map((med, i) => renderMedicineCard(med, `${slot}-${i}`))
                            ) : (
                              <div className='flex items-center justify-center flex-grow py-4'>
                                <span className='text-xs text-neutral-400 italic'>— None —</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {getUnscheduledMedicines(prescription.medicines).length > 0 && (
                    <div className='mt-4 bg-neutral-50/60 border border-neutral-100 rounded-xl p-4'>
                      <p className='text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-3'>
                        Unscheduled Medicines
                      </p>
                      <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                        {getUnscheduledMedicines(prescription.medicines).map((med, i) =>
                          renderMedicineCard(med, `unscheduled-${i}`)
                        )}
                      </div>
                    </div>
                  )}

                  {/* Raw Text Collapsible */}
                  {prescription.rawExtractedText && (
                    <details className='mt-4 pt-3 border-t border-neutral-100 text-left'>
                      <summary className='text-xs font-medium text-neutral-400 cursor-pointer outline-none hover:text-neutral-600 transition-colors'>
                        Show Raw Extracted OCR Text
                      </summary>
                      <pre className='text-[10px] text-neutral-500 font-mono whitespace-pre-wrap mt-2 p-3 bg-neutral-50 rounded border border-neutral-100 max-h-32 overflow-y-auto'>
                        {prescription.rawExtractedText}
                      </pre>
                    </details>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
})

MedicineSchedule.displayName = 'MedicineSchedule'

export default MedicineSchedule
