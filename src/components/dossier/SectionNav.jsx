import { useEffect, useRef, useState } from 'react'
import { DOSSIER_SECTIONS } from '../../data/dossierSchema'

const STATUS_DOT = {
  complete: 'bg-sage',
  searching: 'bg-amber-400 animate-pulse',
  error: 'bg-red-400',
  pending: 'bg-gray-300',
  skipped: 'bg-gray-200',
}

export default function SectionNav({ sections }) {
  const [activeKey, setActiveKey] = useState(DOSSIER_SECTIONS[0].key)

  useEffect(() => {
    const observers = []
    DOSSIER_SECTIONS.forEach(({ key }) => {
      const el = document.getElementById(`section-${key}`)
      if (!el) return
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveKey(key) },
        { rootMargin: '-30% 0px -60% 0px' }
      )
      obs.observe(el)
      observers.push(obs)
    })
    return () => observers.forEach(o => o.disconnect())
  }, [])

  function scrollTo(key) {
    const el = document.getElementById(`section-${key}`)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <nav className="w-52 flex-shrink-0 hidden xl:block">
      <div className="sticky top-6">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2">Sections</p>
        <div className="space-y-0.5">
          {DOSSIER_SECTIONS.map(({ key, title }) => {
            const status = sections?.[key]?.status || 'pending'
            return (
              <button
                key={key}
                onClick={() => scrollTo(key)}
                className={`w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-left text-sm transition-colors ${
                  activeKey === key
                    ? 'bg-sage-50 text-navy font-medium'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${STATUS_DOT[status]}`} />
                <span className="leading-tight text-xs">{title}</span>
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
