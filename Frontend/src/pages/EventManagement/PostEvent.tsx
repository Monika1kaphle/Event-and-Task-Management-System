import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarPlus, ArrowLeft, Upload, X } from 'lucide-react'
import { Sidebar } from '../../components/layout/Sidebar'
import { Input } from '../../components/ui/Input'
import { Textarea } from '../../components/ui/Textarea'
import { Button } from '../../components/ui/Button'
interface PostEventProps {
  onLogout: () => void
}
export function PostEvent({ onLogout }: PostEventProps) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [posterPreview, setPosterPreview] = useState<string | null>(null)
  const [posterFile, setPosterFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    description: '',
  })
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPosterFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPosterPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }
  const removePoster = () => {
    setPosterPreview(null)
    setPosterFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }
  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const response = await fetch(
        'http://localhost:5000/api/admin/post-event',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: formData.title,
            event_date: formData.date,
            event_time: formData.time,
            description: formData.description,
          }),
        },
      )
      const data = await response.json()
      if (response.ok) {
        alert('Event Posted Successfully!')
        setFormData({
          title: '',
          date: '',
          time: '',
          description: '',
        })
        setPosterPreview(null)
        setPosterFile(null)
        navigate('/events')
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
          <h1 className="text-3xl font-bold text-white mb-1">
            Create New Event
          </h1>
          <p className="text-sm text-gray-400">
            Fill in the details below to post a new event.
          </p>
        </header>

        {/* Form Card */}
        <div className="bg-[#161b22]/80 backdrop-blur-sm border border-gray-800 rounded-xl p-8 max-w-4xl">
          <div className="flex items-center space-x-3 mb-8">
            <div className="p-2.5 rounded-lg bg-[#2d5f5d]/20 text-[#4fd1c5]">
              <CalendarPlus className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-semibold text-white">Post an Event</h2>
          </div>

          <form onSubmit={handlePost} className="space-y-6">
            {/* Title, Date, Time */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <Input
                name="title"
                value={formData.title}
                onChange={handleChange}
                label="Event Title"
                placeholder="Annual Team Retreat"
              />
              <Input
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                label="Date"
              />
              <Input
                name="time"
                type="time"
                value={formData.time}
                onChange={handleChange}
                label="Time"
              />
            </div>

            {/* Description */}
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              label="Description"
              placeholder="Enter event details, location, and agenda..."
              rows={4}
            />

            {/* Event Poster Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Event Poster
              </label>

              {posterPreview ? (
                <div className="relative rounded-xl overflow-hidden border border-gray-800 bg-[#0d1117]">
                  <img
                    src={posterPreview}
                    alt="Event poster preview"
                    className="w-full h-56 object-cover"
                  />
                  <button
                    type="button"
                    onClick={removePoster}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white hover:bg-black/80 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-800 rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer hover:border-[#2d5f5d]/50 transition-colors bg-[#0d1117]/50"
                >
                  <Upload className="w-8 h-8 text-gray-600 mb-3" />
                  <p className="text-sm text-gray-400">
                    Click to upload poster (JPG, PNG)
                  </p>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* Submit */}
            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                isLoading={isLoading}
                className="min-w-[160px]"
              >
                Post Event
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
