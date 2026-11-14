'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createSupabaseBrowserClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [pesan, setPesan] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setPesan('Sedang memproses...')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setPesan(`Gagal login: ${error.message}`)
      setLoading(false)
    } else {
      setPesan('Berhasil login! Mengalihkan ke halaman santri...')
      router.push('/santri')
      router.refresh()
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4 rounded-xl border bg-white p-6 shadow-sm">
        <div>
          <p className="text-xs font-medium text-emerald-700">SIMESTA</p>
          <h1 className="text-xl font-bold text-slate-900">Login Admin / Pengurus</h1>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
          <input
            type="email"
            placeholder="Masukkan email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
          <input
            type="password"
            placeholder="Masukkan password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-emerald-600 p-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:bg-emerald-300"
        >
          {loading ? 'Memproses...' : 'Login'}
        </button>

        {pesan && (
          <p className={`mt-2 text-sm font-medium ${pesan.includes('Gagal') ? 'text-red-600' : 'text-emerald-600'}`}>
            {pesan}
          </p>
        )}
      </form>
    </div>
  )
}