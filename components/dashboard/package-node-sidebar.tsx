"use client"

import type React from "react"
import { Package } from "lucide-react"

export function PackageNodeSidebar() {
  const handleDragStartClass = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData("application/diagramainador", "classNode")
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragStartPackage = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData("application/diagramainador", "packageNode")
    e.dataTransfer.effectAllowed = "move"
  }

  return (
    <div className="w-64 bg-white border-r h-full p-4">
      <h2 className="text-lg font-semibold mb-4">Elementos</h2>

      <div className="space-y-4">
        {/* Clase */}
        <div
          className="border border-gray-300 rounded-lg p-3 cursor-move hover:bg-gray-50 transition-colors"
          draggable
          onDragStart={handleDragStartClass}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span className="font-medium">Clase</span>
          </div>
          <p className="text-sm text-gray-600">Arrastra para crear una clase</p>
        </div>

        {/* Paquete */}
        <div
          className="border border-gray-300 rounded-lg p-3 cursor-move hover:bg-gray-50 transition-colors"
          draggable
          onDragStart={handleDragStartPackage}
        >
          <div className="flex items-center gap-2 mb-2">
            <Package className="w-4 h-4 text-blue-600" />
            <span className="font-medium">Paquete</span>
          </div>
          <p className="text-sm text-gray-600">Arrastra para crear un paquete</p>
        </div>

        {/* Instrucciones de relaciones */}
        <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
          <h3 className="font-medium text-sm mb-2">Crear Relaciones</h3>
          <div className="text-xs text-gray-600 space-y-1">
            <p>• Activa el modo "Relación"</p>
            <p>• Selecciona dos elementos</p>
            <p>• Elige el tipo de relación</p>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            <p className="font-medium">Tipos disponibles:</p>
            <p>✓ Herencia</p>
            <p>✓ Asociación</p>
            <p>✓ Agregación</p>
            <p>✓ Composición</p>
            <p>✓ Implementación</p>
          </div>
        </div>
      </div>
    </div>
  )
}
