"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { ClassNodeSidebar } from "./class-node-sidebar"
import { ClassNode } from "./class-node"
import { RelationshipLine } from "./relationship-line"
import type { ClassNodeData, DiagramData, Relationship } from "@/types/diagram-types"
import { Button } from "@/components/ui/button"
import { Download, Upload, Trash2, ZoomIn, ZoomOut, MousePointer, Lock, Unlock } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export function SimpleDiagramEditor() {
  const [classes, setClasses] = useState<ClassNodeData[]>([])
  const [relationships, setRelationships] = useState<Relationship[]>([])
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null)
  const [selectedRelationshipId, setSelectedRelationshipId] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [scale, setScale] = useState(1)
  const [relationMode, setRelationMode] = useState(false)
  const [relationSource, setRelationSource] = useState<string | null>(null)
  const [isLocked, setIsLocked] = useState(false)
  const [showRelationDialog, setShowRelationDialog] = useState(false)
  const [newRelationship, setNewRelationship] = useState<{
    source: string
    target: string
    type: Relationship["type"]
  }>({
    source: "",
    target: "",
    type: "association",
  })

  const canvasRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Handle canvas click to deselect
  const handleCanvasClick = () => {
    if (!isLocked) {
      setSelectedClassId(null)
      setSelectedRelationshipId(null)
    }
  }

  // Handle class selection
  const handleSelectClass = (id: string) => {
    if (isLocked) return

    if (relationMode && relationSource) {
      // Create relationship
      if (relationSource !== id) {
        // Mostrar diálogo para seleccionar tipo de relación
        setNewRelationship({
          source: relationSource,
          target: id,
          type: "association",
        })
        setShowRelationDialog(true)
      }
    } else {
      setSelectedClassId(id)
      setSelectedRelationshipId(null)

      if (relationMode) {
        setRelationSource(id)
      }
    }
  }

  // Crear relación después de seleccionar el tipo
  const handleCreateRelationship = () => {
    const relationship: Relationship = {
      id: `rel_${Date.now()}`,
      source: newRelationship.source,
      target: newRelationship.target,
      type: newRelationship.type,
    }

    setRelationships([...relationships, relationship])
    setRelationMode(false)
    setRelationSource(null)
    setShowRelationDialog(false)
  }

  // Handle relationship selection
  const handleSelectRelationship = (id: string) => {
    if (!isLocked) {
      setSelectedRelationshipId(id)
      setSelectedClassId(null)
    }
  }

  // Handle class update
  const handleUpdateClass = (updatedClass: ClassNodeData) => {
    if (!isLocked) {
      setClasses(classes.map((c) => (c.id === updatedClass.id ? updatedClass : c)))
    }
  }

  // Handle relationship update
  const handleUpdateRelationship = (updatedRelationship: Relationship) => {
    if (!isLocked) {
      setRelationships(relationships.map((r) => (r.id === updatedRelationship.id ? updatedRelationship : r)))
    }
  }

  // Handle class deletion
  const handleDeleteClass = (id: string) => {
    if (!isLocked) {
      setClasses(classes.filter((c) => c.id !== id))
      // Also delete relationships connected to this class
      setRelationships(relationships.filter((r) => r.source !== id && r.target !== id))
      setSelectedClassId(null)
    }
  }

  // Handle relationship deletion
  const handleDeleteRelationship = (id: string) => {
    if (!isLocked) {
      setRelationships(relationships.filter((r) => r.id !== id))
      setSelectedRelationshipId(null)
    }
  }

  // Handle drag over for dropping new classes
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (!isLocked) {
      e.preventDefault()
      e.dataTransfer.dropEffect = "move"
    }
  }

  // Handle drop for new classes
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    if (isLocked) return

    e.preventDefault()

    const nodeType = e.dataTransfer.getData("application/diagramainador")

    if (nodeType !== "classNode" || !canvasRef.current) return

    const canvasRect = canvasRef.current.getBoundingClientRect()
    const x = (e.clientX - canvasRect.left) / scale
    const y = (e.clientY - canvasRect.top) / scale

    const newClass: ClassNodeData = {
      id: `class_${Date.now()}`,
      name: `Clase${classes.length + 1}`,
      attributes: [{ name: "atributo1", type: "String", visibility: "public" }],
      methods: [{ name: "metodo1", returnType: "void", parameters: [], visibility: "public" }],
      position: { x, y },
    }

    setClasses([...classes, newClass])
  }

  // Handle mouse down for dragging classes
  const handleMouseDown = (e: React.MouseEvent, classId: string) => {
    if (isLocked || selectedClassId !== classId) return

    e.preventDefault()
    setIsDragging(true)

    const selectedClass = classes.find((c) => c.id === classId)
    if (!selectedClass || !canvasRef.current) return

    const canvasRect = canvasRef.current.getBoundingClientRect()
    const offsetX = (e.clientX - canvasRect.left) / scale - selectedClass.position.x
    const offsetY = (e.clientY - canvasRect.top) / scale - selectedClass.position.y

    setDragOffset({ x: offsetX, y: offsetY })
  }

  // Handle mouse move for dragging classes
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !selectedClassId || !canvasRef.current || isLocked) return

    e.preventDefault()
    const canvasRect = canvasRef.current.getBoundingClientRect()
    const x = Math.max(0, (e.clientX - canvasRect.left) / scale - dragOffset.x)
    const y = Math.max(0, (e.clientY - canvasRect.top) / scale - dragOffset.y)

    setClasses(classes.map((c) => (c.id === selectedClassId ? { ...c, position: { x, y } } : c)))
  }

  // Handle mouse up to stop dragging
  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Export diagram to JSON
  const exportToJson = () => {
    const diagramData: DiagramData = {
      classes,
      relationships,
    }

    const dataStr = JSON.stringify(diagramData, null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)

    const exportFileDefaultName = `diagrama-clases-${new Date().toISOString().split("T")[0]}.json`

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }

  // Import diagram from JSON
  const importFromJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isLocked) return

    const fileReader = new FileReader()
    if (e.target.files && e.target.files.length > 0) {
      fileReader.readAsText(e.target.files[0], "UTF-8")
      fileReader.onload = (event) => {
        if (event.target?.result && typeof event.target.result === "string") {
          try {
            const diagramData: DiagramData = JSON.parse(event.target.result)
            if (diagramData.classes && diagramData.relationships) {
              setClasses(diagramData.classes)
              setRelationships(diagramData.relationships)
            }
          } catch (error) {
            console.error("Error al importar el archivo JSON:", error)
            alert("Error al importar el archivo. Verifica que sea un archivo JSON válido.")
          }
        }
      }
    }
  }

  // Clear diagram
  const clearDiagram = () => {
    if (isLocked) return

    if (confirm("¿Estás seguro de que quieres limpiar todo el diagrama?")) {
      setClasses([])
      setRelationships([])
      setSelectedClassId(null)
      setSelectedRelationshipId(null)
    }
  }

  // Zoom in
  const zoomIn = () => {
    setScale((prevScale) => Math.min(prevScale + 0.1, 2))
  }

  // Zoom out
  const zoomOut = () => {
    setScale((prevScale) => Math.max(prevScale - 0.1, 0.5))
  }

  // Toggle relation mode
  const toggleRelationMode = () => {
    if (isLocked) return

    setRelationMode(!relationMode)
    if (!relationMode) {
      setSelectedClassId(null)
      setSelectedRelationshipId(null)
      setRelationSource(null)
    }
  }

  // Toggle lock mode
  const toggleLock = () => {
    setIsLocked(!isLocked)
    if (!isLocked) {
      // When locking, clear selections and exit relation mode
      setSelectedClassId(null)
      setSelectedRelationshipId(null)
      setRelationMode(false)
      setRelationSource(null)
    }
  }

  // Set up event listeners
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false)
    }

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isDragging || !selectedClassId || !canvasRef.current || isLocked) return

      const canvasRect = canvasRef.current.getBoundingClientRect()
      const x = Math.max(0, (e.clientX - canvasRect.left) / scale - dragOffset.x)
      const y = Math.max(0, (e.clientY - canvasRect.top) / scale - dragOffset.y)

      setClasses(classes.map((c) => (c.id === selectedClassId ? { ...c, position: { x, y } } : c)))
    }

    window.addEventListener("mouseup", handleGlobalMouseUp)
    window.addEventListener("mousemove", handleGlobalMouseMove)

    return () => {
      window.removeEventListener("mouseup", handleGlobalMouseUp)
      window.removeEventListener("mousemove", handleGlobalMouseMove)
    }
  }, [isDragging, selectedClassId, dragOffset, scale, classes, isLocked])

  // Obtener nombres de las clases para el diálogo de relación
  const getClassName = (id: string) => {
    const classObj = classes.find((c) => c.id === id)
    return classObj ? classObj.name : "Clase"
  }

  return (
    <div className="flex h-full">
      <ClassNodeSidebar />

      <div className="flex-grow h-full flex flex-col" ref={containerRef}>
        {/* Toolbar */}
        <div className="bg-white border-b p-2 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              variant={isLocked ? "destructive" : "outline"}
              size="sm"
              onClick={toggleLock}
              className="flex items-center gap-1"
              title={isLocked ? "Desbloquear edición" : "Bloquear edición"}
            >
              {isLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
              {isLocked ? "Bloqueado" : "Desbloqueado"}
            </Button>

            <Button
              variant={relationMode ? "default" : "outline"}
              size="sm"
              onClick={toggleRelationMode}
              className="flex items-center gap-1"
              title={relationMode ? "Cancelar relación" : "Crear relación"}
              disabled={isLocked}
            >
              <MousePointer className="h-4 w-4" />
              {relationMode ? "Selecciona dos clases" : "Relación"}
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" onClick={zoomOut} title="Alejar">
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm">{Math.round(scale * 100)}%</span>
            <Button variant="outline" size="icon" onClick={zoomIn} title="Acercar">
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              onClick={exportToJson}
              size="sm"
              className="flex items-center gap-1"
              title="Exportar diagrama a JSON"
            >
              <Download className="h-4 w-4" />
              Exportar
            </Button>

            <div className="relative">
              <Button
                size="sm"
                className="flex items-center gap-1"
                title="Importar diagrama desde JSON"
                disabled={isLocked}
              >
                <Upload className="h-4 w-4" />
                Importar
              </Button>
              {!isLocked && (
                <input
                  type="file"
                  accept=".json"
                  onChange={importFromJson}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              )}
            </div>

            <Button
              onClick={clearDiagram}
              variant="destructive"
              size="sm"
              className="flex items-center gap-1"
              title="Limpiar diagrama"
              disabled={isLocked}
            >
              <Trash2 className="h-4 w-4" />
              Limpiar
            </Button>
          </div>
        </div>

        {/* Canvas */}
        <div
          ref={canvasRef}
          className={`flex-grow bg-gray-100 overflow-auto relative ${isLocked ? "cursor-not-allowed" : ""}`}
          onClick={handleCanvasClick}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          <div
            className="absolute top-0 left-0 w-full h-full"
            style={{
              backgroundImage: "radial-gradient(#e5e7eb 1px, transparent 1px)",
              backgroundSize: `${20 * scale}px ${20 * scale}px`,
              transform: `scale(${scale})`,
              transformOrigin: "0 0",
              minWidth: "2000px",
              minHeight: "2000px",
            }}
          >
            {/* Relationship lines */}
            {relationships.map((relationship) => (
              <RelationshipLine
                key={relationship.id}
                relationship={relationship}
                classes={classes}
                onUpdate={handleUpdateRelationship}
                onDelete={handleDeleteRelationship}
                isSelected={selectedRelationshipId === relationship.id}
                onSelect={handleSelectRelationship}
                isLocked={isLocked}
              />
            ))}

            {/* Class nodes */}
            {classes.map((classData) => (
              <div
                key={classData.id}
                onMouseDown={(e) => handleMouseDown(e, classData.id)}
                style={{ cursor: isLocked ? "not-allowed" : selectedClassId === classData.id ? "move" : "pointer" }}
              >
                <ClassNode
                  data={classData}
                  isSelected={selectedClassId === classData.id}
                  onSelect={handleSelectClass}
                  onUpdate={handleUpdateClass}
                  onDelete={handleDeleteClass}
                  isLocked={isLocked}
                />
              </div>
            ))}

            {/* Relation mode indicator */}
            {relationMode && relationSource && !isLocked && (
              <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-3 py-2 rounded-md shadow-lg z-50">
                Selecciona la clase destino para crear la relación
              </div>
            )}

            {/* Lock mode indicator */}
            {isLocked && (
              <div className="fixed bottom-4 left-4 bg-red-600 text-white px-3 py-2 rounded-md shadow-lg z-50">
                Modo bloqueado - No se pueden hacer cambios
              </div>
            )}
          </div>
        </div>

        {/* Diálogo para seleccionar tipo de relación */}
        <Dialog open={showRelationDialog} onOpenChange={setShowRelationDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Selecciona el tipo de relación</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-gray-500 mb-4">
                Creando relación de <strong>{getClassName(newRelationship.source)}</strong> a{" "}
                <strong>{getClassName(newRelationship.target)}</strong>
              </p>
              <RadioGroup
                value={newRelationship.type}
                onValueChange={(value) =>
                  setNewRelationship({ ...newRelationship, type: value as Relationship["type"] })
                }
                className="space-y-3"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="association" id="association" />
                  <Label htmlFor="association" className="font-medium">
                    Asociación
                  </Label>
                  <span className="text-xs text-gray-500">- Relación simple entre clases</span>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="inheritance" id="inheritance" />
                  <Label htmlFor="inheritance" className="font-medium">
                    Herencia
                  </Label>
                  <span className="text-xs text-gray-500">- Clase hija hereda de clase padre</span>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="implementation" id="implementation" />
                  <Label htmlFor="implementation" className="font-medium">
                    Implementación
                  </Label>
                  <span className="text-xs text-gray-500">- Clase implementa una interfaz</span>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="aggregation" id="aggregation" />
                  <Label htmlFor="aggregation" className="font-medium">
                    Agregación
                  </Label>
                  <span className="text-xs text-gray-500">- Relación "tiene un" (débil)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="composition" id="composition" />
                  <Label htmlFor="composition" className="font-medium">
                    Composición
                  </Label>
                  <span className="text-xs text-gray-500">- Relación "contiene" (fuerte)</span>
                </div>
              </RadioGroup>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowRelationDialog(false)
                  setRelationMode(false)
                  setRelationSource(null)
                }}
              >
                Cancelar
              </Button>
              <Button onClick={handleCreateRelationship}>Crear Relación</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
