import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarPlus, ArrowLeft, Upload, X, CalendarDays, Clock, Archive } from 'lucide-react'
import { Sidebar } from '../../../components/layout/Sidebar'
import { Input } from '../../../components/ui/Input'
import { Textarea } from '../../../components/ui/Textarea'
import { Button } from '../../../components/ui/Button'
import axios from 'axios'

interface PostEventProps {
  onLogout: () => void
}

function computeStatus(event_date: string, event_time: string): 'Upcoming' | 'Live' | 'Past' {
  const now = new Date()
  const eventDate = new Date(event_date)
  const year = eventDate.getFullYear()
  const month = String(eventDate.getMonth() + 1).padStart(2, '0')
  const day = String(eventDate.getDate()).padStart(2, '0')
  const datePart = `${year}-${month}-${day}`
  const timePart = event_time.slice(0, 5)
  const eventDateTime = new Date(`${datePart}T${timePart}:00`)
  const diffMs = eventDateTime.getTime() - now.getTime()
  const diffMins = diffMs / (1000 * 60)
  if (diffMs < 0 && Math.abs(diffMins) > 60) return 'Past'
  if (Math.abs(diffMins) <= 60) return 'Live'
  return 'Upcoming'
}

function StatCard({ icon: Icon, count, label }: { icon: any, count: number, label: string }) {
  return (
    <div className="bg-[#161b22]/80 backdrop-blur-sm border border-[#30363d] rounded-xl px-5 py-4 flex items-center gap-4">
      <div className="w-10 h-10 rounded-full bg-[#2d5f5d]/20 flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-[#4fd1c5]" />
      </div>
      <div>
        <div className="text-2xl font-bold text-white leading-none mb-1">{count}</div>
        <div className="text-xs text-[#9ca3af]">{label}</div>
      </div>
    </div>
  )
}

export function PostEvent({ onLogout }: PostEventProps) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [posterPreview, setPosterPreview] = useState<string | null>(null)
  const [posterFile, setPosterFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [events, setEvents] = useState<any[]>([])

  // ✅ Popup state
  const [showSuccessPopup, setShowSuccessPopup] = useState(false)
  const [createdEventId, setCreatedEventId] = useState<number | null>(null)
  const [createdEventTitle, setCreatedEventTitle] = useState('')

  const today = new Date().toISOString().split('T')[0]

  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    description: '',
    price: '',
    location: '',
    max_capacity: ''
  })

  const minTime = formData.date === today
    ? new Date().toTimeString().slice(0, 5)
    : '00:00'

  useEffect(() => {
    axios.get('http://localhost:3000/api/events')
      .then(res => setEvents(res.data))
      .catch(err => console.error('Error fetching events:', err))
  }, [])

  const totalEvents = events.length
  const upcomingEvents = events.filter(e => computeStatus(e.event_date, e.event_time) === 'Upcoming').length
  const liveEvents = events.filter(e => computeStatus(e.event_date, e.event_time) === 'Live').length
  const pastEvents = events.filter(e => computeStatus(e.event_date, e.event_time) === 'Past').length

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const updated = { ...formData, [e.target.name]: e.target.value }
    if (e.target.name === 'date' && e.target.value === today) {
      const currentTime = new Date().toTimeString().slice(0, 5)
      if (updated.time && updated.time < currentTime) {
        updated.time = ''
      }
    }
    setFormData(updated)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPosterFile(file)
      const reader = new FileReader()
      reader.onloadend = () => setPosterPreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const removePoster = () => {
    setPosterPreview(null)
    setPosterFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const dataToSend = new FormData()
      dataToSend.append('title', formData.title)
      dataToSend.append('event_date', formData.date)
      dataToSend.append('event_time', formData.time)
      dataToSend.append('description', formData.description)
      dataToSend.append('price', formData.price)
      dataToSend.append('location', formData.location)
      dataToSend.append('max_capacity', formData.max_capacity)
      if (posterFile) dataToSend.append('poster', posterFile)

      const response = await fetch('http://localhost:3000/api/events/post', {
        method: 'POST',
        body: dataToSend
      })

      const data = await response.json()

      if (response.ok) {
        // ✅ Store event info and show popup — NO alert(), NO navigate() here
        setCreatedEventId(data.id)
        setCreatedEventTitle(formData.title)
        setFormData({ title: '', date: '', time: '', description: '', price: '', location: '', max_capacity: '' })
        setPosterPreview(null)
        setPosterFile(null)
        setShowSuccessPopup(true)
      } else {
        alert('Error: ' + data.error)
      }
    } catch (error) {
      console.error('Error posting event:', error)
      alert('Failed to connect to server')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-[#0d1117]">
      <Sidebar onLogout={onLogout} />

      <div className="flex-1 min-h-screen p-8 ml-64">
        {/* Header */}
        <header className="mb-8">
          <button
            onClick={() => navigate('/events')}
            className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Event Management
          </button>
          <h1 className="text-3xl font-bold text-white mb-1">Create New Event</h1>
          <p className="text-sm text-gray-400">Fill in the details below to post a new event.</p>
        </header>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard icon={CalendarDays} count={totalEvents} label="Total Events" />
          <StatCard icon={Clock} count={upcomingEvents + liveEvents} label="Upcoming & Live" />
          <StatCard icon={Archive} count={pastEvents} label="Past Events" />
        </div>

        {/* Form Card */}
        <div className="bg-[#161b22]/80 backdrop-blur-sm border border-gray-800 rounded-xl p-8">
          <div className="flex items-center space-x-3 mb-8">
            <div className="p-2.5 rounded-lg bg-[#2d5f5d]/20 text-[#4fd1c5]">
              <CalendarPlus className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-semibold text-white">Post an Event</h2>
          </div>

          <form onSubmit={handlePost} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <Input name="title" value={formData.title} onChange={handleChange} label="Event Title" placeholder="Annual Team Retreat" required />
              <Input name="date" type="date" value={formData.date} onChange={handleChange} label="Date" min={today} required />
              <Input name="time" type="time" value={formData.time} onChange={handleChange} label="Time" min={minTime} required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <Input name="location" value={formData.location} onChange={handleChange} label="Event Location" placeholder="Kathmandu, Nepal" required />
              <Input name="price" type="number" value={formData.price} onChange={handleChange} label="Event Price (Rs)" placeholder="0 for free" min="0" required />
              <Input name="max_capacity" type="number" value={formData.max_capacity} onChange={handleChange} label="Max Capacity" placeholder="100" min="1" required />
            </div>

            <Textarea name="description" value={formData.description} onChange={handleChange} label="Description" placeholder="Enter event details, location, and agenda..." rows={4} required />

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Event Poster</label>
              {posterPreview ? (
                <div className="relative rounded-xl overflow-hidden border border-gray-800 bg-[#0d1117]">
                  <img src={posterPreview} alt="Event poster preview" className="w-full h-56 object-cover" />
                  <button type="button" onClick={removePoster} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white hover:bg-black/80 transition-colors">
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-gray-800 rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer hover:border-[#2d5f5d]/50 transition-colors bg-[#0d1117]/50">
                  <Upload className="w-8 h-8 text-gray-600 mb-3" />
                  <p className="text-sm text-gray-400">Click to upload poster (JPG, PNG)</p>
                </div>
              )}
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png" onChange={handleFileChange} className="hidden" />
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" isLoading={isLoading} className="min-w-[160px]">Post Event</Button>
            </div>
          </form>
        </div>
      </div>

      {/* ✅ Success Popup */}
      {showSuccessPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-8 w-full max-w-md shadow-2xl text-center mx-4">

            {/* Check icon */}
            <div className="w-16 h-16 rounded-full bg-[#2d5f5d]/20 flex items-center justify-center mx-auto mb-5">
              <svg className="w-8 h-8 text-[#4fd1c5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h2 className="text-xl font-bold text-white mb-2">Event Created Successfully!</h2>
            <p className="text-sm text-[#9ca3af] mb-1">
              <span className="text-[#4fd1c5] font-medium">"{createdEventTitle}"</span> has been posted.
            </p>
            <p className="text-sm text-[#9ca3af] mb-7">
              Would you like to set up an event management team by creating departments for this event?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowSuccessPopup(false)
                  navigate('/events')
                }}
                className="flex-1 px-4 py-2.5 rounded-lg border border-[#30363d] text-sm text-[#9ca3af] hover:text-white hover:border-[#4fd1c5]/40 transition-colors"
              >
                No, maybe later
              </button>
              <button
                onClick={() => {
                  setShowSuccessPopup(false)
                  navigate(`/departments?event_id=${createdEventId}&event_title=${encodeURIComponent(createdEventTitle)}`)
                }}
                className="flex-1 px-4 py-2.5 rounded-lg bg-[#2d5f5d] hover:bg-[#3a7a78] text-sm text-white font-medium transition-colors"
              >
                Yes, create team →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}