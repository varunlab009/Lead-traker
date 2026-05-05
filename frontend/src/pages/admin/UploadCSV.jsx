import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import Papa from 'papaparse'
import api from '../../lib/api'
import { Upload, CheckCircle, XCircle, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react'

const LEAD_FIELDS = [
  { key: 'name',          label: 'Name',          required: true },
  { key: 'contact',       label: 'Contact / Phone', required: true },
  { key: 'business_name', label: 'Business Name',  required: false },
  { key: 'email',         label: 'Email',          required: false },
  { key: 'city',          label: 'City',           required: false },
  { key: 'niche',         label: 'Niche',          required: false },
  { key: 'address',       label: 'Address',        required: false },
  { key: 'source',        label: 'Source',         required: false },
  { key: 'status',        label: 'Status',         required: false },
  { key: 'notes',         label: 'Notes',          required: false },
  { key: 'assigned_user', label: 'Assigned User (email)', required: false },
]

const AUTO_MAP = {
  name:          ['name', 'full name', 'lead name', 'customer name', 'client name'],
  contact:       ['contact', 'phone', 'phone number', 'mobile', 'mobile number', 'number', 'cell', 'telephone'],
  business_name: ['business name', 'business', 'company', 'company name', 'organisation', 'organization'],
  email:         ['email', 'email address', 'e-mail', 'mail'],
  city:          ['city', 'location', 'town'],
  niche:         ['niche', 'industry', 'category', 'sector', 'vertical'],
  address:       ['address', 'full address', 'street address'],
  source:        ['source', 'lead source', 'origin'],
  status:        ['status', 'lead status', 'stage'],
  notes:         ['notes', 'note', 'comments', 'comment', 'remarks', 'description'],
  assigned_user: ['assigned user', 'assigned to', 'agent', 'user', 'sales agent', 'rep', 'owner'],
}

function autoDetect(headers) {
  const mapping = {}
  for (const field of LEAD_FIELDS) {
    const synonyms = AUTO_MAP[field.key]
    const match = headers.find(h => synonyms.includes(h.toLowerCase().trim()))
    mapping[field.key] = match || ''
  }
  return mapping
}

function applyMapping(rows, mapping) {
  return rows.map(row => {
    const out = {}
    for (const field of LEAD_FIELDS) {
      const csvCol = mapping[field.key]
      if (csvCol) out[field.key] = row[csvCol] ?? ''
    }
    return out
  })
}

const TABS = [
  { key: 'valid',      label: 'Valid',      icon: CheckCircle, color: 'text-green-600' },
  { key: 'errors',     label: 'Errors',     icon: XCircle,     color: 'text-red-600' },
  { key: 'duplicates', label: 'Duplicates', icon: AlertCircle, color: 'text-amber-600' },
]

export default function UploadCSV() {
  const [step, setStep] = useState('upload')   // upload | map | preview
  const [file, setFile] = useState(null)
  const [csvHeaders, setCsvHeaders] = useState([])
  const [rawRows, setRawRows] = useState([])
  const [mapping, setMapping] = useState({})
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [tab, setTab] = useState('valid')
  const fileRef = useRef(null)
  const navigate = useNavigate()

  function handleFile(f) {
    if (!f) return
    setFile(f)
    setPreview(null)
    Papa.parse(f, {
      header: true,
      skipEmptyLines: true,
      complete: ({ data, meta }) => {
        const headers = meta.fields || []
        setCsvHeaders(headers)
        setRawRows(data)
        setMapping(autoDetect(headers))
        setStep('map')
      },
    })
  }

  async function handlePreview() {
    const requiredMissing = LEAD_FIELDS.filter(f => f.required && !mapping[f.key])
    if (requiredMissing.length) {
      toast.error(`Map required fields: ${requiredMissing.map(f => f.label).join(', ')}`)
      return
    }
    const mapped = applyMapping(rawRows, mapping)
    setLoading(true)
    try {
      const { data } = await api.post('/uploads/preview', { rows: mapped })
      setPreview(data)
      setTab('valid')
      setStep('preview')
    } catch {
      toast.error('Preview failed')
    } finally {
      setLoading(false)
    }
  }

  async function confirmUpload() {
    if (!preview?.preview?.valid?.length) return
    setConfirming(true)
    try {
      await api.post('/uploads/confirm', {
        rows: preview.preview.valid,
        filename: file.name,
        totals: { total: preview.total, valid: preview.valid, duplicates: preview.duplicates },
      })
      toast.success(`${preview.valid} leads uploaded successfully`)
      navigate('/admin/leads')
    } catch {
      toast.error('Upload failed')
    } finally {
      setConfirming(false)
    }
  }

  function reset() {
    setStep('upload')
    setFile(null)
    setCsvHeaders([])
    setRawRows([])
    setMapping({})
    setPreview(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  const previewRows = preview?.preview?.[tab] || []

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Upload CSV</h2>
          <p className="text-sm text-slate-500 mt-0.5">Import leads from any CSV — map your columns to lead fields</p>
        </div>
        {step !== 'upload' && (
          <button onClick={reset} className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1">
            <ArrowLeft size={14} /> Start over
          </button>
        )}
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 text-xs font-medium">
        {['upload', 'map', 'preview'].map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold
              ${step === s ? 'bg-blue-600 text-white' : (
                ['upload','map','preview'].indexOf(step) > i ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-500'
              )}`}>{i + 1}</span>
            <span className={step === s ? 'text-blue-600' : 'text-slate-400'}>
              {s === 'upload' ? 'Upload' : s === 'map' ? 'Map Columns' : 'Preview'}
            </span>
            {i < 2 && <span className="text-slate-300">›</span>}
          </div>
        ))}
      </div>

      {/* Step 1: Upload */}
      {step === 'upload' && (
        <div
          className="bg-white border-2 border-dashed border-slate-300 rounded-lg p-12 text-center cursor-pointer hover:border-blue-400 transition"
          onClick={() => fileRef.current?.click()}
          onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]) }}
          onDragOver={e => e.preventDefault()}
        >
          <Upload size={32} className="mx-auto text-slate-400 mb-3" />
          <p className="text-sm font-medium text-slate-700">Click or drag & drop a CSV file</p>
          <p className="text-xs text-slate-400 mt-1">Any column names — you'll map them next · Max 10 MB</p>
          <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={e => handleFile(e.target.files[0])} />
        </div>
      )}

      {/* Step 2: Column Mapping */}
      {step === 'map' && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm text-blue-700">
            <strong>{rawRows.length}</strong> rows detected in <strong>{file?.name}</strong>. Map your CSV columns to lead fields below.
          </div>

          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider w-1/3">Lead Field</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Your CSV Column</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider w-1/4">Sample Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {LEAD_FIELDS.map(field => {
                  const sample = mapping[field.key] ? (rawRows[0]?.[mapping[field.key]] ?? '') : ''
                  return (
                    <tr key={field.key} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-medium text-slate-800">
                        {field.label}
                        {field.required && <span className="ml-1 text-red-500 text-xs">*</span>}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={mapping[field.key] || ''}
                          onChange={e => setMapping(m => ({ ...m, [field.key]: e.target.value }))}
                          className={`w-full border rounded px-2.5 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                            ${field.required && !mapping[field.key] ? 'border-red-300 bg-red-50' : 'border-slate-300'}`}
                        >
                          <option value="">— Skip —</option>
                          {csvHeaders.map(h => (
                            <option key={h} value={h}>{h}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-slate-500 font-mono text-xs truncate max-w-xs">
                        {sample || <span className="text-slate-300 italic">no sample</span>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePreview}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded transition"
            >
              {loading ? 'Validating…' : 'Preview Import'}
              {!loading && <ArrowRight size={14} />}
            </button>
            <p className="text-xs text-slate-400">Fields marked <span className="text-red-500">*</span> are required</p>
          </div>
        </div>
      )}

      {/* Step 3: Preview */}
      {step === 'preview' && preview && (
        <div className="space-y-4">
          <div className="flex gap-2 border-b border-slate-200">
            {TABS.map(({ key, label, icon: Icon, color }) => {
              const count = preview[key]
              return (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition -mb-px
                    ${tab === key ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                  <Icon size={14} className={color} />
                  {label}
                  <span className={`text-xs font-bold ${color}`}>({count ?? 0})</span>
                </button>
              )
            })}
          </div>

          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200">
                    {['Name','Business Name','Contact','Email','City','Niche','Address','Source','Status','Error'].map(h => (
                      <th key={h} className="px-3 py-2 text-left text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {previewRows.length === 0 && (
                    <tr><td colSpan={10} className="px-3 py-6 text-center text-slate-400">No rows in this category</td></tr>
                  )}
                  {previewRows.map((row, i) => (
                    <tr key={i} className={tab === 'valid' ? 'bg-green-50/40' : tab === 'errors' ? 'bg-red-50/40' : 'bg-amber-50/40'}>
                      <td className="px-3 py-2 text-slate-800 font-medium">{row.name || '—'}</td>
                      <td className="px-3 py-2 text-slate-600">{row.business_name || '—'}</td>
                      <td className="px-3 py-2 font-mono text-slate-600">{row.contact || '—'}</td>
                      <td className="px-3 py-2 text-slate-600">{row.email || '—'}</td>
                      <td className="px-3 py-2 text-slate-600">{row.city || '—'}</td>
                      <td className="px-3 py-2 text-slate-600">{row.niche || '—'}</td>
                      <td className="px-3 py-2 text-slate-500 max-w-32 truncate">{row.address || '—'}</td>
                      <td className="px-3 py-2 text-slate-600">{row.source || '—'}</td>
                      <td className="px-3 py-2 text-slate-600">{row.status || '—'}</td>
                      <td className="px-3 py-2 text-red-600 font-medium">{row.error || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <button
              onClick={() => setStep('map')}
              className="flex items-center gap-1.5 px-4 py-2 border border-slate-300 text-sm text-slate-600 rounded hover:bg-slate-50 transition"
            >
              <ArrowLeft size={14} /> Edit Mapping
            </button>
            {preview.valid > 0 && (
              <>
                <p className="text-sm text-slate-600">
                  <span className="font-semibold text-green-600">{preview.valid}</span> rows ready to import
                </p>
                <button
                  onClick={confirmUpload}
                  disabled={confirming}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded transition"
                >
                  {confirming ? 'Uploading…' : `Confirm Import (${preview.valid} leads)`}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
