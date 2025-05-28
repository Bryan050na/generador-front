"use client"
import { Zap, FolderOpen, Settings, User } from "lucide-react"

interface SidebarProps {
  activeSection: string
  onSectionChange: (section: string) => void
}

export default function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  const menuItems = [
    { icon: Zap, label: "Generar", section: "generate" },
    { icon: FolderOpen, label: "Mis Proyectos", section: "projects" },
    { icon: Settings, label: "Configuración", section: "settings" },
    { icon: User, label: "Mi Perfil", section: "profile" },
  ]

  return (
    <aside className="h-full w-16 flex flex-col space-y-10 items-center justify-center relative bg-gray-800 text-white">
      {menuItems.map((item, index) => {
        const IconComponent = item.icon
        const isActive = activeSection === item.section
        return (
          <div
            key={index}
            className={`h-10 w-10 flex items-center justify-center rounded-lg cursor-pointer transition-all duration-300 ease-linear group relative ${
              isActive ? "bg-white text-gray-800" : "hover:text-gray-800 hover:bg-white"
            }`}
            title={item.label}
            onClick={() => onSectionChange(item.section)}
          >
            <IconComponent className="h-6 w-6" />

            {/* Tooltip */}
            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
              {item.label}
            </div>
          </div>
        )
      })}
    </aside>
  )
}
