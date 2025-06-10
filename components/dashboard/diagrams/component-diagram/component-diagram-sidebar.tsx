"use client"

import type { DragEvent } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Layers } from "lucide-react"

// Este es el identificador único para los elementos de este diagrama.
const DATA_TRANSFER_TYPE = "application/component-diagram-object";

export function ComponentDiagramSidebar() {
  const onDragStart = (event: DragEvent<HTMLDivElement>, nodeType: string) => {
    event.dataTransfer.setData(DATA_TRANSFER_TYPE, nodeType)
    event.dataTransfer.effectAllowed = "move"
  }

  return (
    <div className="w-64 border-r bg-gray-50 p-4 overflow-y-auto">
      <h2 className="text-lg font-semibold mb-4">Elementos</h2>

      <Card className="mb-4">
        <CardHeader className="py-3">
          <CardTitle className="text-sm">Componente</CardTitle>
          <CardDescription>Arrastra para crear un componente.</CardDescription>
        </CardHeader>
        <CardContent className="py-2">
          <div
            className="border-2 border-dashed border-gray-300 p-3 rounded-md bg-white cursor-grab flex items-center justify-center hover:border-blue-400 hover:bg-blue-50 transition-colors duration-200"
            onDragStart={(event) => onDragStart(event, "COMPONENT")}
            draggable
          >
            <Layers className="mr-2 h-5 w-5" />
            <span>Componente</span>
          </div>
        </CardContent>
      </Card>
      
        <div className="mt-6 p-3 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-medium mb-2">Instrucciones</h3>
            <ul className="space-y-2 text-xs text-gray-700">
                <li><strong className="font-semibold">Mover:</strong> Usa el modo Selección.</li>
                <li><strong className="font-semibold">Conectar:</strong> Usa el modo Conexión y arrastra una línea entre los puertos de los componentes.</li>
            </ul>
        </div>
    </div>
  )
}
