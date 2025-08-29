'use client'

import { useState, KeyboardEvent } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Plus, Trash2, X, Calendar, DollarSign, Tag } from 'lucide-react'

interface MilestoneRow {
  description: string
  amount: string
}

const CATEGORIES = ['Development', 'Design', 'Security', 'Writing', 'Marketing', 'Mobile'] as const
type Category = (typeof CATEGORIES)[number]

interface FormErrors {
  title?: string
  category?: string
  description?: string
  startingPrice?: string
  deadline?: string
  milestones?: string
}

export default function NewJobPage() {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<Category | ''>('')
  const [description, setDescription] = useState('')
  const [startingPrice, setStartingPrice] = useState('')
  const [deadline, setDeadline] = useState('')
  const [milestones, setMilestones] = useState<MilestoneRow[]>([{ description: '', amount: '' }])
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitted, setSubmitted] = useState(false)

  const addMilestone = () => setMilestones([...milestones, { description: '', amount: '' }])
  const removeMilestone = (i: number) => {
    if (milestones.length === 1) return
    setMilestones(milestones.filter((_, idx) => idx !== i))
  }
  const updateMilestone = (i: number, field: keyof MilestoneRow, value: string) =>
    setMilestones(milestones.map((m, idx) => (idx === i ? { ...m, [field]: value } : m)))

  const addTag = () => {
    const t = tagInput.trim()
    if (t && !tags.includes(t)) setTags([...tags, t])
    setTagInput('')
  }
  const onTagKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { e.preventDefault(); addTag() }
  }
  const removeTag = (t: string) => setTags(tags.filter((x) => x !== t))

  function validate(): FormErrors {
    const e: FormErrors = {}
    if (!title.trim()) e.title = 'Title is required'
    if (!category) e.category = 'Category is required'
    if (!description.trim()) e.description = 'Description is required'
    if (!startingPrice || isNaN(Number(startingPrice)) || Number(startingPrice) <= 0)
      e.startingPrice = 'Valid starting price required'
    if (!deadline) e.deadline = 'Deadline is required'
    const badMilestone = milestones.some((m) => !m.description.trim() || !m.amount || Number(m.amount) <= 0)
    if (badMilestone) e.milestones = 'All milestones need a description and valid amount'
    return e
  }

  function handleSubmit() {
    const e = validate()
    setErrors(e)
    setSubmitted(true)
    if (Object.keys(e).length > 0) return
    const formData = { title, category, description, startingPrice: Number(startingPrice), deadline, milestones, tags }
    console.log(formData)
  }

  const milestoneTotal = milestones.reduce((s, m) => s + (Number(m.amount) || 0), 0)

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold text-white mb-8">Post a Job</h1>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        {/* Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title */}
          <div>
            <Label className="text-white/60 mb-2 block">Job Title <span className="text-red-400">*</span></Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Build a DeFi Dashboard"
              className="bg-white/5 border-white/8 text-white placeholder:text-white/30"
            />
            {submitted && errors.title && <p className="text-xs text-red-400 mt-1">{errors.title}</p>}
          </div>

          {/* Category */}
          <div>
            <Label className="text-white/60 mb-2 block">Category <span className="text-red-400">*</span></Label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={`px-4 py-1.5 rounded-full border text-sm font-medium transition-colors ${
                    category === c
                      ? 'bg-[#dddddd] text-black border-[#dddddd]'
                      : 'border-slate-700 text-white/40 hover:border-slate-500 hover:text-white'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
            {submitted && errors.category && <p className="text-xs text-red-400 mt-1">{errors.category}</p>}
          </div>

          {/* Description */}
          <div>
            <Label className="text-white/60 mb-2 block">Description <span className="text-red-400">*</span></Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the project in detail — scope, requirements, deliverables..."
              rows={6}
              className="bg-white/5 border-white/8 text-white placeholder:text-white/30 resize-none"
            />
            {submitted && errors.description && <p className="text-xs text-red-400 mt-1">{errors.description}</p>}
          </div>

          {/* Price + Deadline */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-white/60 mb-2 block">
                Starting price (XLM) <span className="text-red-400">*</span>
                <span className="block text-xs text-white/30 font-normal mt-0.5">Freelancers can bid any amount</span>
              </Label>
              <Input
                type="number"
                value={startingPrice}
                onChange={(e) => setStartingPrice(e.target.value)}
                placeholder="e.g. 2000"
                className="bg-white/5 border-white/8 text-white placeholder:text-white/30 font-mono"
              />
              {submitted && errors.startingPrice && <p className="text-xs text-red-400 mt-1">{errors.startingPrice}</p>}
            </div>
            <div>
              <Label className="text-white/60 mb-2 block">Deadline <span className="text-red-400">*</span></Label>
              <Input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="bg-white/5 border-white/8 text-white"
              />
              {submitted && errors.deadline && <p className="text-xs text-red-400 mt-1">{errors.deadline}</p>}
            </div>
          </div>

          {/* Milestones */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-white/60">Milestones <span className="text-red-400">*</span></Label>
              {milestoneTotal > 0 && (
                <span className="text-xs font-mono text-white/40">
                  Total: <span className="text-[#dddddd] font-semibold">{milestoneTotal.toLocaleString()} XLM</span>
                </span>
              )}
            </div>
            <div className="space-y-2">
              {milestones.map((m, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <span className="w-6 h-9 flex items-center justify-center text-xs font-mono text-white/30 shrink-0">{i + 1}</span>
                  <Input
                    value={m.description}
                    onChange={(e) => updateMilestone(i, 'description', e.target.value)}
                    placeholder={`Milestone ${i + 1} description`}
                    className="bg-white/5 border-white/8 text-white placeholder:text-white/30 text-sm flex-1"
                  />
                  <Input
                    type="number"
                    value={m.amount}
                    onChange={(e) => updateMilestone(i, 'amount', e.target.value)}
                    placeholder="XLM"
                    className="bg-white/5 border-white/8 text-white placeholder:text-white/30 font-mono text-sm w-28 shrink-0"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => removeMilestone(i)}
                    disabled={milestones.length === 1}
                    className="text-red-400 hover:text-red-300 hover:bg-white/8 disabled:opacity-30 shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
            {submitted && errors.milestones && <p className="text-xs text-red-400 mt-1">{errors.milestones}</p>}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addMilestone}
              className="border-slate-700 text-white/60 hover:bg-white/8 w-full mt-2"
            >
              <Plus className="w-4 h-4 mr-1" /> Add Milestone
            </Button>
          </div>

          {/* Tags */}
          <div>
            <Label className="text-white/60 mb-2 block">Tags</Label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={onTagKey}
                placeholder="Type tag + Enter"
                className="bg-white/5 border-white/8 text-white placeholder:text-white/30 flex-1"
              />
              <Button type="button" variant="outline" size="sm" onClick={addTag} className="border-slate-700 text-white/60 hover:bg-white/8 shrink-0">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {tags.map((t) => (
                  <Badge key={t} variant="secondary" className="bg-white/8 text-white/60 gap-1 pr-1">
                    {t}
                    <button onClick={() => removeTag(t)} className="hover:text-white transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <Button
            onClick={handleSubmit}
            variant="tile" className="w-full font-semibold h-11 text-base"
          >
            Post Job
          </Button>
        </div>

        {/* Preview sidebar */}
        <div className="lg:sticky lg:top-6">
          <Card className="glass">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-white/40 font-medium uppercase tracking-wider">Live Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {title ? (
                <h3 className="text-white font-bold leading-snug">{title}</h3>
              ) : (
                <div className="h-5 bg-white/5 rounded w-3/4" />
              )}

              <div className="flex flex-wrap gap-1.5">
                {category && <Badge className="bg-white/8 text-[#dddddd] border-white/15 text-xs">{category}</Badge>}
                <Badge variant="outline" className="border-slate-700 text-white/30 text-xs">open</Badge>
              </div>

              {description ? (
                <p className="text-white/40 text-xs leading-relaxed line-clamp-4">{description}</p>
              ) : (
                <div className="space-y-1.5">
                  <div className="h-2.5 bg-white/5 rounded w-full" />
                  <div className="h-2.5 bg-white/5 rounded w-5/6" />
                  <div className="h-2.5 bg-white/5 rounded w-4/6" />
                </div>
              )}

              <Separator className="bg-slate-800" />

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-white/30 flex items-center gap-1"><DollarSign className="w-3 h-3" /> Starting price</span>
                  <span className="font-mono text-amber-400 font-semibold">
                    {startingPrice ? `${Number(startingPrice).toLocaleString()} XLM` : '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/30 flex items-center gap-1"><Calendar className="w-3 h-3" /> Deadline</span>
                  <span className="text-white/60">
                    {deadline ? new Date(deadline).toLocaleDateString() : '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/30">Milestones</span>
                  <span className="text-white/60">{milestones.length}</span>
                </div>
                {milestoneTotal > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-white/30">Total value</span>
                    <span className="font-mono text-[#dddddd] font-semibold">{milestoneTotal.toLocaleString()} XLM</span>
                  </div>
                )}
              </div>

              {tags.length > 0 && (
                <>
                  <Separator className="bg-slate-800" />
                  <div className="flex flex-wrap gap-1">
                    <Tag className="w-3 h-3 text-white/30 mt-0.5 shrink-0" />
                    {tags.map((t) => (
                      <Badge key={t} variant="secondary" className="bg-white/8 text-white/40 text-xs">{t}</Badge>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
