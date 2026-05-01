'use client'

import { useState } from 'react'
import { Calendar, Clock, MapPin, CheckCircle } from 'lucide-react'

interface Props {
  application: any
}

export default function InterviewCard({ application }: Props) {
  const [copied, setCopied] = useState(false)

  if (application.status !== 'interview_scheduled' || !application.interview_at) return null

  const date = new Date(application.interview_at)
  const isPast = date < new Date()
  const collegeName = application.colleges?.name ?? application.college?.name ?? ''
  const courseName  = application.courses?.name  ?? application.course?.name  ?? ''

  const formattedDate = date.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const formattedTime = date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' })

  const calendarUrl = `https://calendar.google.com/calendar/r/eventedit?text=${encodeURIComponent(`Interview — ${collegeName}`)}&dates=${date.toISOString().replace(/[-:]/g,'').split('.')[0]}Z/${new Date(date.getTime()+3600000).toISOString().replace(/[-:]/g,'').split('.')[0]}Z&details=${encodeURIComponent(`Interview for ${courseName}`)}`

  return (
    <div className="bg-purple-50 border border-purple-200 rounded-2xl p-5 mb-4">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center shrink-0">
          <Calendar className="w-5 h-5 text-purple-700" />
        </div>
        <div>
          <h3 className="font-bold text-purple-900 text-sm">Interview Scheduled</h3>
          <p className="text-purple-700 text-xs mt-0.5">{collegeName} has scheduled an interview.</p>
        </div>
      </div>
      <div className="bg-white border border-purple-100 rounded-xl p-4 space-y-3 mb-4">
        <div className="flex items-center gap-3 text-sm">
          <Calendar className="w-4 h-4 text-purple-500 shrink-0" />
          <span className="font-semibold">{formattedDate}</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Clock className="w-4 h-4 text-purple-500 shrink-0" />
          <span className="font-semibold">{formattedTime} IST</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <MapPin className="w-4 h-4 text-purple-500 shrink-0" />
          <span>Contact the college for venue / video link</span>
        </div>
      </div>
      {isPast ? (
        <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
          <CheckCircle className="w-3.5 h-3.5 text-green-500" />
          Interview date has passed. Check your application status.
        </div>
      ) : (
        <div className="flex gap-2 flex-wrap">
          <a href={calendarUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-purple-600 text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-purple-700 transition-colors">
            <Calendar className="w-3.5 h-3.5" /> Add to Google Calendar
          </a>
          <button onClick={() => {
              navigator.clipboard.writeText(`Interview on ${formattedDate} at ${formattedTime} IST — ${collegeName}`)
                .then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
            }}
            className="flex items-center gap-1.5 border border-purple-200 text-purple-700 text-xs font-medium px-4 py-2 rounded-xl hover:bg-purple-50 transition-colors">
            {copied ? <CheckCircle className="w-3.5 h-3.5 text-green-500" /> : <Clock className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : 'Copy details'}
          </button>
        </div>
      )}
    </div>
  )
}
