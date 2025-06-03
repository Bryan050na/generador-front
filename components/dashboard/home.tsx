"use client"
import { useState } from "react"
import Sidebar from "./sidebar"
import Header from "./header"
import { ProjectsSection } from "./projects-section"
import { SettingsSection } from "./settings-section"
import { ProfileSection } from "./profile-section"
import { EnhancedDiagramEditor } from "./enhanced-diagram-editor"

export default function Home() {
  const [activeSection, setActiveSection] = useState("generate")

  const renderContent = () => {
    switch (activeSection) {
      case "generate":
        return <EnhancedDiagramEditor />
      case "projects":
        return <ProjectsSection />
      case "settings":
        return <SettingsSection />
      case "profile":
        return <ProfileSection />
      default:
        return <EnhancedDiagramEditor />
    }
  }

  return (
    <div className="h-screen w-full bg-white relative flex overflow-hidden">
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />

      <div className="w-full h-full flex flex-col">
        <Header />

        {/* Contenido dinámico según la sección activa */}
        <main className="flex-1 bg-gray-50">{renderContent()}</main>
      </div>
    </div>
  )
}
