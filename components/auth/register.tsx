"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { auth } from "@/lib/firebase"

export default function Register() {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showCard, setShowCard] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      console.log("Usuario registrado:", userCredential.user)

      setSuccess("¡Cuenta creada exitosamente!")
      // Aquí puedes redirigir, por ejemplo, a login o dashboard
    } catch (err: any) {
      setError(err.message)
    }
  }

  useEffect(() => {
    setShowCard(true)
  }, [])

  return (
    <div
      className="flex h-screen w-full items-center justify-center bg-gray-900 bg-cover bg-no-repeat"
      style={{
        backgroundImage: "url('/images/background.jpg')",
      }}
    >
      <div
        className={`rounded-xl bg-gray-800 bg-opacity-50 px-16 py-10 shadow-lg backdrop-blur-md max-sm:px-8 transition-all duration-700 ease-out transform ${
          showCard ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <div className="text-white">
          <div className="mb-8 flex flex-col items-center">
            <Image src="/images/logo.png" width={150} height={150} alt="Logo" />
            <h1 className="mb-2 text-2xl">Diagramainador</h1>
            <span className="text-gray-300">Crea una cuenta</span>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="mb-4 text-lg">
              <input
                type="text"
                name="username"
                placeholder="Nombre de usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="rounded-3xl border-none bg-gray-400 bg-opacity-50 px-6 py-2 text-center placeholder-slate-200 shadow-lg outline-none backdrop-blur-md"
              />
            </div>

            <div className="mb-4 text-lg">
              <input
                type="email"
                name="email"
                placeholder="id@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-3xl border-none bg-gray-400 bg-opacity-50 px-6 py-2 text-center placeholder-slate-200 shadow-lg outline-none backdrop-blur-md"
              />
            </div>

            <div className="mb-4 text-lg">
              <input
                type="password"
                name="password"
                placeholder="*********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-3xl border-none bg-gray-400 bg-opacity-50 px-6 py-2 text-center placeholder-slate-200 shadow-lg outline-none backdrop-blur-md"
              />
            </div>

            {error && <p className="text-red-400 text-center mb-2">{error}</p>}
            {success && <p className="text-green-400 text-center mb-2">{success}</p>}

            <div className="mt-8 flex justify-center text-lg text-black">
              <button
                type="submit"
                className="rounded-3xl bg-gray-400 bg-opacity-50 px-10 py-2 text-white shadow-xl backdrop-blur-md transition-colors duration-300 hover:bg-gray-700"
              >
                Registrarse
              </button>
            </div>
          </form>
          <div className="mt-6 text-center text-gray-300">
            <span>¿Ya tienes cuenta?</span>
            <Link href="/" className="ml-2 text-gray-400 hover:text-gray-700 transition-colors duration-300">
              Inicia sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
