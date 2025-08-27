'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useWalletStore } from '@/store/wallet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Trash2, ChevronRight, ChevronLeft, AlertCircle } from 'lucide-react'
import { WalletConnect } from '@/components/wallet-connect'

interface MilestoneRow {
  description: string
  amount: string
}

const STEPS = ['Basic Info', 'Budget & Timeline', 'Milestones', 'Review']

export default function NewJobPage() {
  const { address } = useWalletStore()
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<string | null>('')
  const [budget, setBudget] = useState('')
  const [deadline, setDeadline] = useState('')
  const [milestones, setMilestones] = useState<MilestoneRow[]>([{ description: '', amount: '' }])

  if (!address) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-white mb-3">Connect Your Wallet</h1>
        <p className="text-slate-400 mb-6">You need a connected wallet to post a job.</p>
        <WalletConnect />
      </div>
    )
  }

  const milestoneTotal = milestones.reduce((sum, m) => sum + (parseFloat(m.amount) || 0), 0)
  const budgetNum = parseFloat(budget) || 0
  const budgetMismatch = budget && Math.abs(milestoneTotal - budgetNum) > 0.01

  const addMilestone = () => setMilestones([...milestones, { description: '', amount: '' }])
  const removeMilestone = (i: number) => setMilestones(milestones.filter((_, idx) => idx !== i))
  const updateMilestone = (i: number, field: keyof MilestoneRow, value: string) => {
    setMilestones(milestones.map((m, idx) => idx === i ? { ...m, [field]: value } : m))
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-6">Post a Job</h1>
        {/* Step indicator */}
        <div className="flex items-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                i < step ? 'bg-emerald-500 text-white' : i === step ? 'bg-amber-500 text-slate-900' : 'bg-slate-700 text-slate-500'
              }`}>
                {i < step ? '✓' : i + 1}
              </div>
              <span className={`text-sm hidden sm:block ${i === step ? 'text-slate-200' : 'text-slate-500'}`}>{s}</span>
              {i < STEPS.length - 1 && <div className={`h-px flex-1 w-6 ${i < step ? 'bg-emerald-500' : 'bg-slate-700'}`} />}
            </div>
          ))}
        </div>
      </div>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="pt-6 space-y-5">
          {step === 0 && (
            <>
              <div>
                <Label className="text-slate-300 mb-2 block">Job Title</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Build a DeFi Dashboard" className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500" />
              </div>
              <div>
                <Label className="text-slate-300 mb-2 block">Description</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the project in detail..." rows={5} className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500" />
              </div>
              <div>
                <Label className="text-slate-300 mb-2 block">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-200">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {['Development', 'Design', 'Security', 'Writing', 'Marketing', 'Mobile'].map((c) => (
                      <SelectItem key={c} value={c} className="text-slate-200 focus:bg-slate-700">{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <div>
                <Label className="text-slate-300 mb-2 block">Total Budget (XLM)</Label>
                <Input type="number" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="e.g. 5000" className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500 font-mono" />
              </div>
              <div>
                <Label className="text-slate-300 mb-2 block">Deadline</Label>
                <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="bg-slate-800 border-slate-700 text-slate-100" />
              </div>
            </>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-slate-300">Milestones</Label>
                <span className={`text-sm font-mono ${budgetMismatch ? 'text-red-400' : 'text-emerald-400'}`}>
                  {milestoneTotal.toLocaleString()} / {budgetNum.toLocaleString()} XLM
                </span>
              </div>
              {budgetMismatch && (
                <p className="text-xs text-red-400">Milestone amounts must sum to total budget</p>
              )}
              {milestones.map((m, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <div className="flex-1 space-y-2">
                    <Input value={m.description} onChange={(e) => updateMilestone(i, 'description', e.target.value)} placeholder={`Milestone ${i + 1} description`} className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500 text-sm" />
                    <Input type="number" value={m.amount} onChange={(e) => updateMilestone(i, 'amount', e.target.value)} placeholder="Amount (XLM)" className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500 font-mono text-sm" />
                  </div>
                  {milestones.length > 1 && (
                    <Button size="sm" variant="ghost" onClick={() => removeMilestone(i)} className="text-red-400 hover:text-red-300 hover:bg-slate-700 mt-1">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addMilestone} className="border-slate-600 text-slate-300 hover:bg-slate-700 w-full">
                <Plus className="w-4 h-4 mr-1" /> Add Milestone
              </Button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-slate-200 font-semibold">Review your job post</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-slate-400">Title</span><span className="text-slate-200">{title}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Category</span><span className="text-slate-200">{category}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Budget</span><span className="font-mono text-amber-500">{budgetNum.toLocaleString()} XLM</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Deadline</span><span className="text-slate-200">{deadline}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Milestones</span><span className="text-slate-200">{milestones.length}</span></div>
              </div>
              <p className="text-xs text-slate-500">This will create an on-chain job record via Soroban. Funds are only locked when you hire a freelancer.</p>
            </div>
          )}

          <div className="flex justify-between pt-2">
            <Button variant="ghost" onClick={() => setStep(s => s - 1)} disabled={step === 0} className="text-slate-400 hover:text-slate-200 hover:bg-slate-700">
              <ChevronLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            {step < STEPS.length - 1 ? (
              <Button onClick={() => setStep(s => s + 1)} className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold">
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={() => router.push('/dashboard')} className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold">
                Post Job
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
