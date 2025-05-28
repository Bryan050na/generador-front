"use client"

import type { DragEvent } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Boxes, GitFork } from "lucide-react"

export function ClassNodeSidebar() {
  const onDragStart = (event: DragEvent<HTMLDivElement>, nodeType: string) => {
    event.dataTransfer.setData("application/diagramainador", nodeType)
    event.dataTransfer.effectAllowed = "move"
  }

  return (
    <div className="w-64 border-r bg-gray-50 p-4 overflow-y-auto">
      <h2 className="text-lg font-semibold mb-4">Elementos</h2>

      <Card className="mb-4">
        <CardHeader className="py-3">
          <CardTitle className="text-sm">Clase</CardTitle>
          <CardDescription>Arrastra para crear una clase</CardDescription>
        </CardHeader>
        <CardContent className="py-2">
          <div
            className="border-2 border-dashed border-gray-300 p-3 rounded-md bg-white cursor-grab flex items-center justify-center hover:border-blue-400 hover:bg-blue-50 transition-colors duration-200"
            onDragStart={(event) => onDragStart(event, "classNode")}
            draggable
          >
            <Boxes className="mr-2 h-5 w-5" />
            <span>Clase</span>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6">
        <h3 className="text-sm font-medium mb-2">Relaciones</h3>
        <p className="text-xs text-gray-500 mb-2">
          Para crear relaciones, selecciona dos clases y usa el botón "Crear relación".
        </p>
        <div className="flex items-center text-xs text-gray-600 mb-1">
          <GitFork className="h-3 w-3 mr-1" />
          <span>Herencia, Asociación, etc.</span>
        </div>
      </div>
    </div>
  )
}
