"use client"
import Image from "next/image"
import Link from "next/link"
import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Header() {
  return (
    <header className="h-16 w-full flex items-center justify-between px-5 bg-gray-800 shadow-lg">
      {/* Logo y nombre */}
      <div className="flex items-center space-x-3 text-white">
        <Image src="/images/logo.png" width={50} height={50} alt="Logo" className="rounded-lg" />
        <h1 className="text-xl font-bold">Diagramainador</h1>
      </div>

      {/* Perfil del usuario y logout */}
      <div className="flex flex-shrink-0 items-center space-x-4 text-white">
        <div className="flex flex-col items-end">
          <div className="text-md font-medium">Peter el Panda</div>
          <div className="text-sm font-regular text-gray-300">Agente Secreto</div>
        </div>
        <div className="h-10 w-10 rounded-full cursor-pointer bg-gray-200 border-2 border-blue-400 hover:border-blue-300 transition-colors duration-200"></div>

        {/* Botón de cerrar sesión */}
        <Link href="/">
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:text-gray-300 hover:bg-gray-700 transition-colors duration-200"
            title="Cerrar sesión"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </Link>
      </div>
    </header>
  )
}
