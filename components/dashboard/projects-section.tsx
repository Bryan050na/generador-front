"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, History, Calendar, FileText, Trash2 } from "lucide-react"

interface Project {
  id: string
  name: string
  description: string
  lastModified: string
  type: "class" | "sequence" | "usecase"
  isFavorite: boolean
  classes: number
  relationships: number
}

const sampleProjects: Project[] = [
  {
    id: "1",
    name: "Sistema de Gestión Universitaria",
    description: "Diagrama de clases para un sistema de gestión de estudiantes y cursos",
    lastModified: "2024-01-15",
    type: "class",
    isFavorite: true,
    classes: 8,
    relationships: 12,
  },
  {
    id: "2",
    name: "E-commerce Platform",
    description: "Arquitectura completa de una plataforma de comercio electrónico",
    lastModified: "2024-01-10",
    type: "class",
    isFavorite: false,
    classes: 15,
    relationships: 23,
  },
  {
    id: "3",
    name: "Sistema de Biblioteca",
    description: "Gestión de libros, usuarios y préstamos",
    lastModified: "2024-01-08",
    type: "class",
    isFavorite: true,
    classes: 6,
    relationships: 8,
  },
  {
    id: "4",
    name: "API de Autenticación",
    description: "Diagrama de secuencia para proceso de login",
    lastModified: "2024-01-05",
    type: "sequence",
    isFavorite: false,
    classes: 4,
    relationships: 6,
  },
  {
    id: "5",
    name: "Sistema de Reservas",
    description: "Gestión de reservas para hotel",
    lastModified: "2024-01-03",
    type: "class",
    isFavorite: true,
    classes: 10,
    relationships: 15,
  },
  {
    id: "6",
    name: "Aplicación de Tareas",
    description: "Sistema simple de gestión de tareas personales",
    lastModified: "2024-01-01",
    type: "class",
    isFavorite: false,
    classes: 5,
    relationships: 7,
  },
]

export function ProjectsSection() {
  const [activeTab, setActiveTab] = useState<"history" | "favorites">("history")
  const [projects, setProjects] = useState<Project[]>(sampleProjects)

  const toggleFavorite = (projectId: string) => {
    setProjects(
      projects.map((project) => (project.id === projectId ? { ...project, isFavorite: !project.isFavorite } : project)),
    )
  }

  const removeFromFavorites = (projectId: string) => {
    setProjects(projects.map((project) => (project.id === projectId ? { ...project, isFavorite: false } : project)))
  }

  const getTypeIcon = (type: Project["type"]) => {
    switch (type) {
      case "class":
        return "📊"
      case "sequence":
        return "🔄"
      case "usecase":
        return "👤"
      default:
        return "📄"
    }
  }

  const getTypeName = (type: Project["type"]) => {
    switch (type) {
      case "class":
        return "Diagrama de Clases"
      case "sequence":
        return "Diagrama de Secuencia"
      case "usecase":
        return "Casos de Uso"
      default:
        return "Diagrama"
    }
  }

  const filteredProjects = activeTab === "favorites" ? projects.filter((project) => project.isFavorite) : projects

  const sortedProjects = [...filteredProjects].sort(
    (a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime(),
  )

  return (
    <div className="h-full p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mis Proyectos</h1>
          <p className="text-gray-600">Gestiona y organiza todos tus diagramas</p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("history")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "history"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  <History className="h-4 w-4" />
                  Historial ({projects.length})
                </div>
              </button>
              <button
                onClick={() => setActiveTab("favorites")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "favorites"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  Favoritos ({projects.filter((p) => p.isFavorite).length})
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedProjects.map((project) => (
            <Card key={project.id} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getTypeIcon(project.type)}</span>
                    <div>
                      <CardTitle className="text-lg">{project.name}</CardTitle>
                      <Badge variant="secondary" className="text-xs mt-1">
                        {getTypeName(project.type)}
                      </Badge>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => toggleFavorite(project.id)} className="h-8 w-8">
                    <Heart
                      className={`h-4 w-4 ${
                        project.isFavorite ? "fill-red-500 text-red-500" : "text-gray-400 hover:text-red-500"
                      }`}
                    />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4 line-clamp-2">{project.description}</CardDescription>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(project.lastModified).toLocaleDateString("es-ES")}
                  </div>
                  <div className="flex items-center gap-3">
                    <span>{project.classes} clases</span>
                    <span>{project.relationships} relaciones</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" className="flex-1">
                    <FileText className="h-3 w-3 mr-1" />
                    Abrir
                  </Button>
                  {activeTab === "favorites" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeFromFavorites(project.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {sortedProjects.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">{activeTab === "favorites" ? "💔" : "📁"}</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {activeTab === "favorites" ? "No tienes proyectos favoritos" : "No hay proyectos"}
            </h3>
            <p className="text-gray-500">
              {activeTab === "favorites"
                ? "Marca algunos proyectos como favoritos para verlos aquí"
                : "Crea tu primer diagrama para comenzar"}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
