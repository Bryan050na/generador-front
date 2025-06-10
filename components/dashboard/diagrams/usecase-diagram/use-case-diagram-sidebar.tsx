"use client"

import type { DragEvent } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { User, RectangleHorizontal } from "lucide-react"

// Este es el identificador único para los elementos de este diagrama.
const DATA_TRANSFER_TYPE = "application/use-case-diagram-object";

export function UseCaseDiagramSidebar() {
  const onDragStart = (event: DragEvent<HTMLDivElement>, nodeType: string) => {
    event.dataTransfer.setData(DATA_TRANSFER_TYPE, nodeType)
    event.dataTransfer.effectAllowed = "move"
  }

  return (
    <div className="w-64 border-r bg-gray-50 p-4 overflow-y-auto">
      <h2 className="text-lg font-semibold mb-4">Elementos</h2>

      <Card className="mb-4">
        <CardHeader className="py-3">
          <CardTitle className="text-sm">Actor</CardTitle>
          <CardDescription>Un usuario o sistema externo.</CardDescription>
        </CardHeader>
        <CardContent className="py-2">
          <div
            className="border-2 border-dashed border-gray-300 p-3 rounded-md bg-white cursor-grab flex items-center justify-center hover:border-blue-400 hover:bg-blue-50 transition-colors duration-200"
            onDragStart={(event) => onDragStart(event, "ACTOR")}
            draggable
          >
            <User className="mr-2 h-5 w-5" />
            <span>Actor</span>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader className="py-3">
          <CardTitle className="text-sm">Caso de Uso</CardTitle>
          <CardDescription>Una acción o funcionalidad.</CardDescription>
        </CardHeader>
        <CardContent className="py-2">
          <div
            className="border-2 border-dashed border-gray-300 p-3 rounded-md bg-white cursor-grab flex items-center justify-center hover:border-blue-400 hover:bg-blue-50 transition-colors duration-200"
            onDragStart={(event) => onDragStart(event, "USE_CASE")}
            draggable
          >
            <div className="h-6 w-12 mx-auto border-2 border-gray-600 rounded-full" />
            <span className="ml-2">Caso de Uso</span>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader className="py-3">
          <CardTitle className="text-sm">Sistema</CardTitle>
          <CardDescription>El límite del sistema.</CardDescription>
        </CardHeader>
        <CardContent className="py-2">
          <div
            className="border-2 border-dashed border-gray-300 p-3 rounded-md bg-white cursor-grab flex items-center justify-center hover:border-blue-400 hover:bg-blue-50 transition-colors duration-200"
            onDragStart={(event) => onDragStart(event, "SYSTEM_BOUNDARY")}
            draggable
          >
            <RectangleHorizontal className="mr-2 h-5 w-5" />
            <span>Sistema</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
