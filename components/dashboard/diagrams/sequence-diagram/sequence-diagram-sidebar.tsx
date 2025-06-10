"use client"

import type { DragEvent } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MousePointer } from "lucide-react"

// Definimos el tipo de dato que se usará para el drag-and-drop
const DATA_TRANSFER_TYPE = "application/diagram-generator-object";

export function SequenceDiagramSidebar() {
  const onDragStart = (event: DragEvent<HTMLDivElement>) => {
    // Establecemos los datos que se transferirán al arrastrar
    event.dataTransfer.setData(DATA_TRANSFER_TYPE, "OBJECT")
    event.dataTransfer.effectAllowed = "move"
  }

  return (
    <div className="w-72 border-r bg-gray-50 p-4 overflow-y-auto">
      <h2 className="text-lg font-semibold mb-4">Elementos</h2>

      <Card className="mb-4">
        <CardHeader className="py-3">
          <CardTitle className="text-base">Objeto / Clase</CardTitle>
          <CardDescription className="text-xs">Arrastra para crear un nuevo objeto en el lienzo.</CardDescription>
        </CardHeader>
        <CardContent className="py-2">
          <div
            className="border-2 border-dashed border-gray-300 p-4 rounded-md bg-white cursor-grab flex items-center justify-center hover:border-blue-400 hover:bg-blue-50 transition-colors duration-200"
            onDragStart={onDragStart}
            draggable
          >
            <div className="w-10 h-6 border-2 border-blue-600 rounded-sm mr-3"></div>
            <span>Objeto</span>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 p-3 bg-blue-50 rounded-lg">
        <h3 className="text-sm font-medium mb-2">Instrucciones</h3>
        <ul className="space-y-2 text-xs text-gray-700">
            <li><strong className="font-semibold">Mover objetos:</strong> Usa el modo <MousePointer className="inline h-3 w-3" /> (Selección).</li>
            <li><strong className="font-semibold">Crear mensajes:</strong> Cambia al modo "Mensaje" y arrastra una línea entre dos objetos.</li>
        </ul>
      </div>
    </div>
  )
}
