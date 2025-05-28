"use client"
import { useState } from "react"
import Sidebar from "./sidebar"
import Header from "./header"
import { SimpleDiagramEditor } from "./simple-diagram-editor"
import { ProjectsSection } from "./projects-section"
import { SettingsSection } from "./settings-section"
import { ProfileSection } from "./profile-section"

export default function Home() {
  const [activeSection, setActiveSection] = useState("generate")

  const renderContent = () => {
    switch (activeSection) {
      case "generate":
        return <SimpleDiagramEditor />
      case "projects":
        return <ProjectsSection />
      case "settings":
        return <SettingsSection />
      case "profile":
        return <ProfileSection />
      default:
        return <SimpleDiagramEditor />
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
