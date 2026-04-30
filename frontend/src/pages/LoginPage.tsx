import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { FiMail, FiLock, FiUser, FiPhone, FiBriefcase, FiFileText } from 'react-icons/fi'
import { accessRequestStorage } from '../services/storage'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showRegister, setShowRegister] = useState(false)
  const [registerSuccess, setRegisterSuccess] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  // Register form state
  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPhone, setRegPhone] = useState('')
  const [regCompany, setRegCompany] = useState('')
  const [regReason, setRegReason] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regError, setRegError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Email ou senha inválidos')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault()
    setRegError('')

    if (!regName || !regEmail || !regPhone || !regPassword) {
      setRegError('Preencha todos os campos obrigatórios')
      return
    }

    // Check if email already has a request
    const existing = accessRequestStorage.getAll().find(r => r.email === regEmail)
    if (existing) {
      setRegError('Já existe uma solicitação para este email')
      return
    }

    accessRequestStorage.create({
      name: regName,
      email: regEmail,
      phone: regPhone,
      company: regCompany,
      role: '',
      reason: regReason,
      password: regPassword,
      status: 'PENDING',
      requestDate: new Date().toISOString(),
    })

    setRegisterSuccess(true)
    setRegName('')
    setRegEmail('')
    setRegPhone('')
    setRegCompany('')
    setRegReason('')
    setRegPassword('')
  }

  if (showRegister) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1e3a5f]">
        <div className="w-full max-w-md px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-[#1e3a5f] rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl font-bold">T</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Solicitar Cadastro</h1>
              <p className="text-gray-500 mt-1 text-sm">Preencha seus dados para solicitar acesso</p>
            </div>

            {registerSuccess ? (
              <div className="text-center">
                <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-4">
                  <p className="font-medium">Solicitação enviada!</p>
                  <p className="text-sm mt-1">Aguarde aprovação do administrador.</p>
                </div>
                <button
                  onClick={() => { setShowRegister(false); setRegisterSuccess(false) }}
                  className="text-[#1e3a5f] font-medium hover:underline text-sm"
                >
                  Voltar ao Login
                </button>
              </div>
            ) : (
              <form onSubmit={handleRegister} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome completo *</label>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="input-field pl-10"
                      placeholder="Seu nome completo"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <div className="relative">
                    <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="input-field pl-10"
                      placeholder="seu@email.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefone *</label>
                  <div className="relative">
                    <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="tel"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      className="input-field pl-10"
                      placeholder="(11) 99999-9999"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Empresa / Cargo</label>
                  <div className="relative">
                    <FiBriefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={regCompany}
                      onChange={(e) => setRegCompany(e.target.value)}
                      className="input-field pl-10"
                      placeholder="Empresa ou cargo (opcional)"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Senha desejada *</label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="input-field pl-10"
                      placeholder="Defina sua senha"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Motivo da solicitação</label>
                  <div className="relative">
                    <FiFileText className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                    <textarea
                      value={regReason}
                      onChange={(e) => setRegReason(e.target.value)}
                      className="input-field pl-10 min-h-[80px] resize-none"
                      placeholder="Por que deseja acesso ao sistema?"
                    />
                  </div>
                </div>

                {regError && (
                  <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{regError}</div>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-[#1e3a5f] text-white font-semibold rounded-lg hover:bg-[#152a47] transition-colors"
                >
                  Enviar Solicitação
                </button>

                <button
                  type="button"
                  onClick={() => setShowRegister(false)}
                  className="w-full text-center text-sm text-[#1e3a5f] font-medium hover:underline"
                >
                  Voltar ao Login
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1e3a5f]">
      <div className="w-full max-w-md px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#1e3a5f] rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl font-bold">T</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Terraplanagem</h1>
            <p className="text-gray-500 mt-1 text-sm">Sistema de Gestão</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-10"
                  placeholder="admin@terra.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10"
                  placeholder="********"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-[#1e3a5f] text-white font-semibold rounded-lg hover:bg-[#152a47] disabled:opacity-50 transition-colors"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => setShowRegister(true)}
              className="text-sm text-[#1e3a5f] font-medium hover:underline"
            >
              Não tem acesso? Solicite aqui
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
