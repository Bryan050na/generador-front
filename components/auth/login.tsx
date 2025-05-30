"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "@/lib/firebase"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [showCard, setShowCard] = useState(false)

  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      console.log("Usuario logueado:", userCredential.user)
      router.push("/home") // Redirige al usuario
    } catch (err: any) {
      setError("Credenciales incorrectas o usuario no existe.")
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
            <span className="text-gray-300">Ingrese sus datos de inicio de sesión</span>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="mb-4 text-lg">
              <input
                type="email"
                name="email"
                placeholder="id@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-3xl border-none bg-gray-400 bg-opacity-50 px-6 py-2 text-center text-inherit placeholder-slate-200 shadow-lg outline-none backdrop-blur-md"
              />
            </div>

            <div className="mb-4 text-lg">
              <input
                type="password"
                name="password"
                placeholder="*********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-3xl border-none bg-gray-400 bg-opacity-50 px-6 py-2 text-center text-inherit placeholder-slate-200 shadow-lg outline-none backdrop-blur-md"
              />
            </div>

            {error && <p className="text-red-400 text-center mb-2">{error}</p>}

            <div className="mt-8 flex justify-center text-lg text-black">
              <button
                type="submit"
                className="rounded-3xl bg-gray-400 bg-opacity-50 px-10 py-2 text-white shadow-xl backdrop-blur-md transition-colors duration-300 hover:bg-gray-700"
              >
                Iniciar sesión
              </button>
            </div>
          </form>
          <div className="mt-6 text-center text-gray-300">
            <span>¿Aún no tienes cuenta?</span>
            <Link href="/register" className="ml-2 text-gray-400 hover:text-gray-700 transition-colors duration-300">
              Regístrate
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
