"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ClassDiagramEditor } from "./diagrams/class-diagram/class-diagram-editor"
import { SequenceDiagramEditor } from "./diagrams/sequence-diagram/sequence-diagram-editor"
import { UseCaseDiagramEditor } from "./diagrams/usecase-diagram/use-case-diagram-editor"
import { ComponentDiagramEditor } from "./diagrams/component-diagram/component-diagram-editor"
import { PackageDiagramEditor } from "./diagrams/package-diagram/package-diagram-editor"
import { Box, ArrowRightLeft, Users, Puzzle, Package } from "lucide-react"

export function EnhancedDiagramEditor() {
  const [activeTab, setActiveTab] = useState("class")

  return (
    <div className="h-full flex flex-col">
      <Tabs defaultValue="class" value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
        <div className="border-b bg-white p-2">
          <TabsList className="grid grid-cols-5">
            <TabsTrigger value="class" className="flex items-center gap-2">
              <Box className="h-4 w-4" />
              <span className="hidden sm:inline">Diagrama de Clases</span>
              <span className="inline sm:hidden">Clases</span>
            </TabsTrigger>
            <TabsTrigger value="sequence" className="flex items-center gap-2">
              <ArrowRightLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Diagrama de Secuencia</span>
              <span className="inline sm:hidden">Secuencia</span>
            </TabsTrigger>
            <TabsTrigger value="usecase" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Diagrama de Casos de Uso</span>
              <span className="inline sm:hidden">Casos de Uso</span>
            </TabsTrigger>
            <TabsTrigger value="component" className="flex items-center gap-2">
              <Puzzle className="h-4 w-4" />
              <span className="hidden sm:inline">Diagrama de Componentes</span>
              <span className="inline sm:hidden">Componentes</span>
            </TabsTrigger>
            <TabsTrigger value="package" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Diagrama de Paquetes</span>
              <span className="inline sm:hidden">Paquetes</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-grow overflow-hidden">
          <TabsContent value="class" className="h-full m-0 p-0 border-none">
            <ClassDiagramEditor />
          </TabsContent>
          <TabsContent value="sequence" className="h-full m-0 p-0 border-none">
            <SequenceDiagramEditor />
          </TabsContent>
          <TabsContent value="usecase" className="h-full m-0 p-0 border-none">
            <UseCaseDiagramEditor />
          </TabsContent>
          <TabsContent value="component" className="h-full m-0 p-0 border-none">
            <ComponentDiagramEditor />
          </TabsContent>
          <TabsContent value="package" className="h-full m-0 p-0 border-none">
            <PackageDiagramEditor />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
