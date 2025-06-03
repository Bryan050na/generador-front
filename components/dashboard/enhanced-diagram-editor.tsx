"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { PackageNodeSidebar } from "./package-node-sidebar"
import { ClassNode } from "./class-node"
import { PackageNode } from "./package-node"
import { RelationshipLine } from "./relationship-line"
import { PackageClassLine } from "./package-class-line"
import type {
  ClassNodeData,
  PackageNodeData,
  DiagramData,
  Relationship,
  PackageClassRelation,
  ExportProject,
  ExportPackage,
} from "@/types/diagram-types"
import { Button } from "@/components/ui/button"
import { Download, Upload, Trash2, ZoomIn, ZoomOut, MousePointer, Lock, Unlock, Link } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Input } from "@/components/ui/input"

export function EnhancedDiagramEditor() {
  const [classes, setClasses] = useState<ClassNodeData[]>([])
  const [packages, setPackages] = useState<PackageNodeData[]>([])
  const [relationships, setRelationships] = useState<Relationship[]>([])
  const [packageClassRelations, setPackageClassRelations] = useState<PackageClassRelation[]>([])
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null)
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null)
  const [selectedRelationshipId, setSelectedRelationshipId] = useState<string | null>(null)
  const [selectedPackageClassId, setSelectedPackageClassId] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [scale, setScale] = useState(1)
  const [relationMode, setRelationMode] = useState(false)
  const [packageClassMode, setPackageClassMode] = useState(false)
  const [relationSource, setRelationSource] = useState<string | null>(null)
  const [isLocked, setIsLocked] = useState(false)
  const [showRelationDialog, setShowRelationDialog] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [projectName, setProjectName] = useState("Mi Proyecto")
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
      setSelectedPackageId(null)
      setSelectedRelationshipId(null)
      setSelectedPackageClassId(null)
    }
  }

  // Handle class selection
  const handleSelectClass = (id: string) => {
    if (isLocked) return

    if (relationMode && relationSource) {
      if (relationSource !== id) {
        setNewRelationship({
          source: relationSource,
          target: id,
          type: "association",
        })
        setShowRelationDialog(true)
      }
    } else if (packageClassMode && relationSource) {
      // Crear relación paquete-clase
      if (relationSource !== id) {
        const isPackageSource = packages.find((p) => p.id === relationSource)
        if (isPackageSource) {
          const newRelation: PackageClassRelation = {
            id: `pkg_cls_${Date.now()}`,
            packageId: relationSource,
            classId: id,
          }
          setPackageClassRelations([...packageClassRelations, newRelation])
        }
        setPackageClassMode(false)
        setRelationSource(null)
      }
    } else {
      setSelectedClassId(id)
      setSelectedPackageId(null)
      setSelectedRelationshipId(null)
      setSelectedPackageClassId(null)

      if (relationMode || packageClassMode) {
        setRelationSource(id)
      }
    }
  }

  // Handle package selection
  const handleSelectPackage = (id: string) => {
    if (isLocked) return

    if (packageClassMode && relationSource) {
      // Crear relación paquete-clase
      if (relationSource !== id) {
        const isClassSource = classes.find((c) => c.id === relationSource)
        if (isClassSource) {
          const newRelation: PackageClassRelation = {
            id: `pkg_cls_${Date.now()}`,
            packageId: id,
            classId: relationSource,
          }
          setPackageClassRelations([...packageClassRelations, newRelation])
        }
        setPackageClassMode(false)
        setRelationSource(null)
      }
    } else {
      setSelectedPackageId(id)
      setSelectedClassId(null)
      setSelectedRelationshipId(null)
      setSelectedPackageClassId(null)

      if (packageClassMode) {
        setRelationSource(id)
      }
    }
  }

  // Handle relationship selection
  const handleSelectRelationship = (id: string) => {
    if (!isLocked) {
      setSelectedRelationshipId(id)
      setSelectedClassId(null)
      setSelectedPackageId(null)
      setSelectedPackageClassId(null)
    }
  }

  // Handle package-class relation selection
  const handleSelectPackageClass = (id: string) => {
    if (!isLocked) {
      setSelectedPackageClassId(id)
      setSelectedClassId(null)
      setSelectedPackageId(null)
      setSelectedRelationshipId(null)
    }
  }

  // Create relationship
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

  // Handle class update
  const handleUpdateClass = (updatedClass: ClassNodeData) => {
    if (!isLocked) {
      setClasses(classes.map((c) => (c.id === updatedClass.id ? updatedClass : c)))
    }
  }

  // Handle package update
  const handleUpdatePackage = (updatedPackage: PackageNodeData) => {
    if (!isLocked) {
      setPackages(packages.map((p) => (p.id === updatedPackage.id ? updatedPackage : p)))
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
      setRelationships(relationships.filter((r) => r.source !== id && r.target !== id))
      setPackageClassRelations(packageClassRelations.filter((r) => r.classId !== id))
      setSelectedClassId(null)
    }
  }

  // Handle package deletion
  const handleDeletePackage = (id: string) => {
    if (!isLocked) {
      setPackages(packages.filter((p) => p.id !== id))
      setPackageClassRelations(packageClassRelations.filter((r) => r.packageId !== id))
      setSelectedPackageId(null)
    }
  }

  // Handle relationship deletion
  const handleDeleteRelationship = (id: string) => {
    if (!isLocked) {
      setRelationships(relationships.filter((r) => r.id !== id))
      setSelectedRelationshipId(null)
    }
  }

  // Handle package-class relation deletion
  const handleDeletePackageClassRelation = (id: string) => {
    if (!isLocked) {
      setPackageClassRelations(packageClassRelations.filter((r) => r.id !== id))
      setSelectedPackageClassId(null)
    }
  }

  // Handle drag over
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (!isLocked) {
      e.preventDefault()
      e.dataTransfer.dropEffect = "move"
    }
  }

  // Handle drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    if (isLocked) return

    e.preventDefault()

    const nodeType = e.dataTransfer.getData("application/diagramainador")
    if (!canvasRef.current) return

    const canvasRect = canvasRef.current.getBoundingClientRect()
    const x = (e.clientX - canvasRect.left) / scale
    const y = (e.clientY - canvasRect.top) / scale

    if (nodeType === "classNode") {
      const newClass: ClassNodeData = {
        id: `class_${Date.now()}`,
        name: `Clase${classes.length + 1}`,
        attributes: [{ name: "atributo1", type: "String", visibility: "public" }],
        methods: [{ name: "metodo1", returnType: "void", parameters: [], visibility: "public" }],
        position: { x, y },
        isEntity: true,
        fields: [{ name: "id", type: "Long", isIdField: true, generationStrategy: "AUTO" }],
        relationships: [],
      }

      setClasses([...classes, newClass])
    } else if (nodeType === "packageNode") {
      const newPackage: PackageNodeData = {
        id: `package_${Date.now()}`,
        name: `Paquete${packages.length + 1}`,
        position: { x, y },
        size: { width: 250, height: 150 }, // Tamaño inicial más grande
      }

      setPackages([...packages, newPackage])
    }
  }

  // Handle mouse down for dragging (evitar interferencia con resize)
  const handleMouseDown = (e: React.MouseEvent, itemId: string, itemType: "class" | "package") => {
    if (isLocked) return

    // Verificar si el click fue en un handle de resize
    const target = e.target as HTMLElement
    if (target.style.cursor && target.style.cursor.includes("resize")) {
      return // No iniciar drag si es un handle de resize
    }

    e.preventDefault()
    setIsDragging(true)

    if (!canvasRef.current) return

    const canvasRect = canvasRef.current.getBoundingClientRect()

    if (itemType === "class") {
      const selectedClass = classes.find((c) => c.id === itemId)
      if (!selectedClass) return

      const offsetX = (e.clientX - canvasRect.left) / scale - selectedClass.position.x
      const offsetY = (e.clientY - canvasRect.top) / scale - selectedClass.position.y
      setDragOffset({ x: offsetX, y: offsetY })
    } else {
      const selectedPackage = packages.find((p) => p.id === itemId)
      if (!selectedPackage) return

      const offsetX = (e.clientX - canvasRect.left) / scale - selectedPackage.position.x
      const offsetY = (e.clientY - canvasRect.top) / scale - selectedPackage.position.y
      setDragOffset({ x: offsetX, y: offsetY })
    }
  }

  // Handle mouse move for dragging
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !canvasRef.current || isLocked) return

    e.preventDefault()
    const canvasRect = canvasRef.current.getBoundingClientRect()
    const x = Math.max(0, (e.clientX - canvasRect.left) / scale - dragOffset.x)
    const y = Math.max(0, (e.clientY - canvasRect.top) / scale - dragOffset.y)

    if (selectedClassId) {
      setClasses(classes.map((c) => (c.id === selectedClassId ? { ...c, position: { x, y } } : c)))
    } else if (selectedPackageId) {
      setPackages(packages.map((p) => (p.id === selectedPackageId ? { ...p, position: { x, y } } : p)))
    }
  }

  // Handle mouse up
  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false)
    }
  }

  // Export to new JSON format
  const exportToNewFormat = () => {
    const exportData: ExportProject[] = [
      {
        projectName,
        package: packages.map((pkg) => {
          const packageClasses = packageClassRelations
            .filter((rel) => rel.packageId === pkg.id)
            .map((rel) => classes.find((cls) => cls.id === rel.classId))
            .filter(Boolean) as ClassNodeData[]

          return {
            packageName: pkg.name,
            classes: packageClasses.map((cls) => ({
              className: cls.name,
              isEntity: cls.isEntity || true,
              fields: cls.fields || [{ name: "id", type: "Long", isIdField: true, generationStrategy: "AUTO" }],
              relationships: cls.relationships || [],
            })),
          } as ExportPackage
        }),
        class: classes.find((cls) => !packageClassRelations.some((rel) => rel.classId === cls.id))
          ? {
              className:
                classes.filter((cls) => !packageClassRelations.some((rel) => rel.classId === cls.id))[0]?.name ||
                "ClaseSuelta",
              isEntity: false,
              fields:
                classes.filter((cls) => !packageClassRelations.some((rel) => rel.classId === cls.id))[0]?.fields || [],
            }
          : undefined,
      },
    ]

    const dataStr = JSON.stringify(exportData, null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)

    const exportFileDefaultName = `${projectName.replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.json`

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()

    setShowExportDialog(false)
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
            if (diagramData.classes) {
              setClasses(diagramData.classes)
            }
            if (diagramData.packages) {
              setPackages(diagramData.packages)
            }
            if (diagramData.relationships) {
              setRelationships(diagramData.relationships)
            }
            if (diagramData.packageClassRelations) {
              setPackageClassRelations(diagramData.packageClassRelations)
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
      setPackages([])
      setRelationships([])
      setPackageClassRelations([])
      setSelectedClassId(null)
      setSelectedPackageId(null)
      setSelectedRelationshipId(null)
      setSelectedPackageClassId(null)
    }
  }

  // Zoom functions
  const zoomIn = () => setScale((prevScale) => Math.min(prevScale + 0.1, 2))
  const zoomOut = () => setScale((prevScale) => Math.max(prevScale - 0.1, 0.5))

  // Toggle relation mode
  const toggleRelationMode = () => {
    if (isLocked) return

    setRelationMode(!relationMode)
    setPackageClassMode(false)
    if (!relationMode) {
      setSelectedClassId(null)
      setSelectedPackageId(null)
      setSelectedRelationshipId(null)
      setSelectedPackageClassId(null)
      setRelationSource(null)
    }
  }

  // Toggle package-class mode
  const togglePackageClassMode = () => {
    if (isLocked) return

    setPackageClassMode(!packageClassMode)
    setRelationMode(false)
    if (!packageClassMode) {
      setSelectedClassId(null)
      setSelectedPackageId(null)
      setSelectedRelationshipId(null)
      setSelectedPackageClassId(null)
      setRelationSource(null)
    }
  }

  // Toggle lock mode
  const toggleLock = () => {
    setIsLocked(!isLocked)
    if (!isLocked) {
      setSelectedClassId(null)
      setSelectedPackageId(null)
      setSelectedRelationshipId(null)
      setSelectedPackageClassId(null)
      setRelationMode(false)
      setPackageClassMode(false)
      setRelationSource(null)
    }
  }

  // Set up event listeners
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        setIsDragging(false)
      }
    }

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isDragging || !canvasRef.current || isLocked) return

      const canvasRect = canvasRef.current.getBoundingClientRect()
      const x = Math.max(0, (e.clientX - canvasRect.left) / scale - dragOffset.x)
      const y = Math.max(0, (e.clientY - canvasRect.top) / scale - dragOffset.y)

      if (selectedClassId) {
        setClasses(classes.map((c) => (c.id === selectedClassId ? { ...c, position: { x, y } } : c)))
      } else if (selectedPackageId) {
        setPackages(packages.map((p) => (p.id === selectedPackageId ? { ...p, position: { x, y } } : p)))
      }
    }

    window.addEventListener("mouseup", handleGlobalMouseUp)
    window.addEventListener("mousemove", handleGlobalMouseMove)

    return () => {
      window.removeEventListener("mouseup", handleGlobalMouseUp)
      window.removeEventListener("mousemove", handleGlobalMouseMove)
    }
  }, [isDragging, selectedClassId, selectedPackageId, dragOffset, scale, classes, packages, isLocked])

  // Get class name for dialog
  const getClassName = (id: string) => {
    const classObj = classes.find((c) => c.id === id)
    return classObj ? classObj.name : "Clase"
  }

  return (
    <div className="flex h-full">
      <PackageNodeSidebar />

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

            <Button
              variant={packageClassMode ? "default" : "outline"}
              size="sm"
              onClick={togglePackageClassMode}
              className="flex items-center gap-1"
              title={packageClassMode ? "Cancelar enlace" : "Enlazar paquete-clase"}
              disabled={isLocked}
            >
              <Link className="h-4 w-4" />
              {packageClassMode ? "Selecciona paquete y clase" : "Enlazar"}
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
              onClick={() => setShowExportDialog(true)}
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
            {/* Package nodes */}
            {packages.map((packageData) => (
              <div
                key={packageData.id}
                onMouseDown={(e) => handleMouseDown(e, packageData.id, "package")}
                style={{ cursor: isLocked ? "not-allowed" : selectedPackageId === packageData.id ? "move" : "pointer" }}
              >
                <PackageNode
                  data={packageData}
                  isSelected={selectedPackageId === packageData.id}
                  onSelect={handleSelectPackage}
                  onUpdate={handleUpdatePackage}
                  onDelete={handleDeletePackage}
                  isLocked={isLocked}
                  classCount={packageClassRelations.filter((rel) => rel.packageId === packageData.id).length}
                />
              </div>
            ))}

            {/* Package-Class lines */}
            {packageClassRelations.map((relation) => (
              <PackageClassLine
                key={relation.id}
                relation={relation}
                classes={classes}
                packages={packages}
                onDelete={handleDeletePackageClassRelation}
                isSelected={selectedPackageClassId === relation.id}
                onSelect={handleSelectPackageClass}
                isLocked={isLocked}
              />
            ))}

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
                onMouseDown={(e) => handleMouseDown(e, classData.id, "class")}
                style={{
                  cursor: isLocked ? "not-allowed" : selectedClassId === classData.id ? "move" : "pointer",
                  zIndex: 20,
                }}
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

            {/* Indicators */}
            {relationMode && relationSource && !isLocked && (
              <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-3 py-2 rounded-md shadow-lg z-50">
                Selecciona la clase destino para crear la relación
              </div>
            )}

            {packageClassMode && relationSource && !isLocked && (
              <div className="fixed bottom-4 right-4 bg-green-600 text-white px-3 py-2 rounded-md shadow-lg z-50">
                Selecciona {packages.find((p) => p.id === relationSource) ? "una clase" : "un paquete"} para enlazar
              </div>
            )}

            {isLocked && (
              <div className="fixed bottom-4 left-4 bg-red-600 text-white px-3 py-2 rounded-md shadow-lg z-50">
                Modo bloqueado - No se pueden hacer cambios
              </div>
            )}
          </div>
        </div>

        {/* Export Dialog */}
        <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Exportar Proyecto</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="projectName">Nombre del Proyecto</Label>
              <Input
                id="projectName"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="mt-2"
                placeholder="Ingresa el nombre del proyecto"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowExportDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={exportToNewFormat}>Exportar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Relationship Dialog */}
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
