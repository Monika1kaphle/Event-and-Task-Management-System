import React, { useState } from 'react'
import { CalendarPlus, Upload, X } from 'lucide-react'
import { Input } from '../ui/Input'
import { Textarea } from '../ui/Textarea'
import { Button } from '../ui/Button'

export function PostEventCard() {
  const [isLoading, setIsLoading] = useState(false)
  const [posterFile, setPosterFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    description: '',
    price: '',
    location: '',
    max_capacity: ''
  })

  const today = new Date().toISOString().split('T')[0]

  const minTime = formData.date === today
    ? new Date().toTimeString().slice(0, 5)
    : '00:00'

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
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const removePoster = () => {
    setPosterFile(null)
    setPreviewUrl(null)
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
      if (posterFile) {
        dataToSend.append('poster', posterFile)
      }

      const response = await fetch('http://localhost:3000/api/events/post', {
        method: 'POST',
        body: dataToSend
      })

      const result = await response.json()

      if (response.ok) {
        alert('Event Posted Successfully!')
        setFormData({ title: '', date: '', time: '', description: '', price: '', location: '', max_capacity: '' })
        removePoster()
      } else {
        alert('Error: ' + result.error)
      }
    } catch (error) {
      console.error('Error posting event:', error)
      alert('Failed to connect to server')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-[#161b22]/80 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6 shadow-2xl hover:border-[#2d5f5d]/30 transition-all duration-300">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 rounded-lg bg-[#2d5f5d]/10 text-[#2d5f5d]">
          <CalendarPlus className="h-5 w-5" />
        </div>
        <h3 className="text-lg font-semibold text-white">Post an Event</h3>
      </div>

      <form onSubmit={handlePost} className="space-y-4">
        {/* Row 1: Title, Date, Time */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            name="title"
            value={formData.title}
            onChange={handleChange}
            label="Event Title"
            placeholder="Annual Team Retreat"
            required
          />
          <Input
            name="date"
            type="date"
            value={formData.date}
            onChange={handleChange}
            label="Date"
            min={today}
            required
          />
          <Input
            name="time"
            type="time"
            value={formData.time}
            onChange={handleChange}
            label="Time"
            min={minTime}
            required
          />
        </div>

        {/* Row 2: Location, Price, Max Capacity */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            name="location"
            value={formData.location}
            onChange={handleChange}
            label="Event Location"
            placeholder="Kathmandu, Nepal"
            required
          />
          <Input
            name="price"
            type="number"
            value={formData.price}
            onChange={handleChange}
            label="Event Price (Rs)"
            placeholder="0 for free"
            min="0"
            required
          />
          <Input
            name="max_capacity"
            type="number"
            value={formData.max_capacity}
            onChange={handleChange}
            label="Max Capacity"
            placeholder="100"
            min="1"
            required
          />
        </div>

        {/* Description */}
        <Textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          label="Description"
          placeholder="Enter event details..."
          rows={3}
          required
        />

        {/* Poster Upload Section */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-400">Event Poster</label>
          {!previewUrl ? (
            <div className="border-2 border-dashed border-gray-700 rounded-xl p-8 flex flex-col items-center justify-center hover:border-[#2d5f5d]/50 transition-colors cursor-pointer relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <Upload className="h-8 w-8 text-gray-500 mb-2" />
              <p className="text-sm text-gray-500">Click to upload poster (JPG, PNG)</p>
            </div>
          ) : (
            <div className="relative w-full max-w-xs rounded-lg overflow-hidden border border-gray-700">
              <img src={previewUrl} alt="Preview" className="w-full h-40 object-cover" />
              <button
                type="button"
                onClick={removePoster}
                className="absolute top-2 right-2 p-1 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
              >
                <X className="h-4 w-4 text-white" />
              </button>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            isLoading={isLoading}
            className="w-full md:w-auto min-w-[150px]"
          >
            Post Event
          </Button>
        </div>
      </form>
    </div>
  )
}