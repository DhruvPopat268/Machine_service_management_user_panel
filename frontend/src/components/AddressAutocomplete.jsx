import { useState, useEffect, useRef, useCallback } from 'react'

const DEBOUNCE_MS = 400

export default function AddressAutocomplete({ value, onChange, onSelect, error, placeholder = 'Search address in India...' }) {
  const [suggestions, setSuggestions] = useState([])
  const [open, setOpen] = useState(false)
  const serviceRef = useRef(null)
  const sessionTokenRef = useRef(null)
  const debounceTimer = useRef(null)
  const containerRef = useRef(null)

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const getService = () => {
    if (!serviceRef.current && window.google) {
      serviceRef.current = new window.google.maps.places.AutocompleteService()
    }
    return serviceRef.current
  }

  const getSessionToken = () => {
    if (!sessionTokenRef.current && window.google) {
      sessionTokenRef.current = new window.google.maps.places.AutocompleteSessionToken()
    }
    return sessionTokenRef.current
  }

  const fetchSuggestions = useCallback((input) => {
    const svc = getService()
    if (!svc || !input.trim()) { setSuggestions([]); setOpen(false); return }

    svc.getPlacePredictions(
      {
        input,
        componentRestrictions: { country: 'in' },
        sessionToken: getSessionToken(),
      },
      (predictions, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
          setSuggestions(predictions)
          setOpen(true)
        } else {
          setSuggestions([])
          setOpen(false)
        }
      }
    )
  }, [])

  const handleChange = (e) => {
    const val = e.target.value
    onChange(val)
    clearTimeout(debounceTimer.current)
    if (!val.trim()) { setSuggestions([]); setOpen(false); return }
    debounceTimer.current = setTimeout(() => fetchSuggestions(val), DEBOUNCE_MS)
  }

  const handleSelect = (prediction) => {
    setOpen(false)
    setSuggestions([])
    onChange(prediction.description)

    const placesService = new window.google.maps.places.PlacesService(
      document.createElement('div')
    )
    placesService.getDetails(
      {
        placeId: prediction.place_id,
        fields: ['geometry'],
        sessionToken: sessionTokenRef.current,
      },
      (place, status) => {
        sessionTokenRef.current = null
        if (status === window.google.maps.places.PlacesServiceStatus.OK && place.geometry) {
          onSelect({
            address: prediction.description,
            latitude: place.geometry.location.lat(),
            longitude: place.geometry.location.lng(),
          })
        }
      }
    )
  }

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${error ? 'border-red-400' : 'border-gray-300'}`}
      />
      {open && suggestions.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-56 overflow-y-auto">
          {suggestions.map((s) => (
            <li
              key={s.place_id}
              onMouseDown={() => handleSelect(s)}
              className="px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 cursor-pointer leading-snug"
            >
              <span className="font-medium text-gray-800">{s.structured_formatting.main_text}</span>
              <span className="text-gray-400 text-xs ml-1">{s.structured_formatting.secondary_text}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
