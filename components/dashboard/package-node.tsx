"use client"

import type React from "react"

import { useState } from "react"
import type { PackageNodeData } from "@/types/diagram-types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Package, Edit2, Trash2, Check, X } from "lucide-react"

interface PackageNodeProps {
  data: PackageNodeData
  isSelected: boolean
  onSelect: (id: string) => void
  onUpdate: (data: PackageNodeData) => void
  onDelete: (id: string) => void
  isLocked: boolean
  classCount: number
}

export function PackageNode({
  data,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  isLocked,
  classCount,
}: PackageNodeProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(data.name)
  const [isResizing, setIsResizing] = useState(false)
  const [resizeHandle, setResizeHandle] = useState<string | null>(null)

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isLocked && !isResizing) {
      onSelect(data.id)
    }
  }

  const handleSaveName = () => {
    if (!isLocked) {
      onUpdate({ ...data, name: editName })
      setIsEditing(false)
    }
  }

  const handleCancelEdit = () => {
    setEditName(data.name)
    setIsEditing(false)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isLocked && confirm(`¿Estás seguro de que quieres eliminar el paquete "${data.name}"?`)) {
      onDelete(data.id)
    }
  }

  const handleResizeStart = (e: React.MouseEvent, handle: string) => {
    if (isLocked) return

    e.stopPropagation()
    setIsResizing(true)
    setResizeHandle(handle)
  }

  const handleResizeMove = (e: React.MouseEvent) => {
    if (!isResizing || !resizeHandle || isLocked) return

    e.preventDefault()
    e.stopPropagation()

    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    let newWidth = data.size.width
    let newHeight = data.size.height
    let newX = data.position.x
    let newY = data.position.y

    const minWidth = 150
    const minHeight = 100

    switch (resizeHandle) {
      case "se": // Southeast corner
        newWidth = Math.max(minWidth, x)
        newHeight = Math.max(minHeight, y)
        break
      case "sw": // Southwest corner
        newWidth = Math.max(minWidth, data.size.width - x)
        newHeight = Math.max(minHeight, y)
        newX = data.position.x + (data.size.width - newWidth)
        break
      case "ne": // Northeast corner
        newWidth = Math.max(minWidth, x)
        newHeight = Math.max(minHeight, data.size.height - y)
        newY = data.position.y + (data.size.height - newHeight)
        break
      case "nw": // Northwest corner
        newWidth = Math.max(minWidth, data.size.width - x)
        newHeight = Math.max(minHeight, data.size.height - y)
        newX = data.position.x + (data.size.width - newWidth)
        newY = data.position.y + (data.size.height - newHeight)
        break
      case "e": // East edge
        newWidth = Math.max(minWidth, x)
        break
      case "w": // West edge
        newWidth = Math.max(minWidth, data.size.width - x)
        newX = data.position.x + (data.size.width - newWidth)
        break
      case "s": // South edge
        newHeight = Math.max(minHeight, y)
        break
      case "n": // North edge
        newHeight = Math.max(minHeight, data.size.height - y)
        newY = data.position.y + (data.size.height - newHeight)
        break
    }

    onUpdate({
      ...data,
      position: { x: newX, y: newY },
      size: { width: newWidth, height: newHeight },
    })
  }

  const handleResizeEnd = () => {
    setIsResizing(false)
    setResizeHandle(null)
  }

  return (
    <div
      className={`absolute border-2 border-dashed rounded-lg bg-blue-50/30 ${
        isSelected ? "border-blue-500 shadow-lg" : "border-blue-300"
      } ${isLocked ? "cursor-not-allowed" : "cursor-pointer"}`}
      style={{
        left: data.position.x,
        top: data.position.y,
        width: data.size.width,
        height: data.size.height,
        minWidth: 150,
        minHeight: 100,
      }}
      onClick={handleClick}
      onMouseMove={handleResizeMove}
      onMouseUp={handleResizeEnd}
      onMouseLeave={handleResizeEnd}
    >
      {/* Header del paquete */}
      <div className="bg-blue-100 border-b border-blue-300 p-2 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-blue-600" />
          {isEditing && !isLocked ? (
            <div className="flex items-center gap-1">
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="h-6 text-sm w-32"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveName()
                  if (e.key === "Escape") handleCancelEdit()
                }}
                autoFocus
              />
              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={handleSaveName}>
                <Check className="h-3 w-3" />
              </Button>
              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={handleCancelEdit}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <span className="font-medium text-blue-800 text-sm">{data.name}</span>
          )}
        </div>

        {isSelected && !isLocked && (
          <div className="flex items-center gap-1">
            {!isEditing && (
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation()
                  setIsEditing(true)
                }}
              >
                <Edit2 className="h-3 w-3" />
              </Button>
            )}
            <Button size="icon" variant="ghost" className="h-6 w-6 text-red-600" onClick={handleDelete}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>

      {/* Contenido del paquete */}
      <div className="p-2 h-full">
        <div className="text-xs text-blue-600 mb-2">
          {classCount} {classCount === 1 ? "clase" : "clases"} enlazadas
        </div>
        <div className="text-xs text-gray-500">
          {isSelected && !isLocked
            ? "Arrastra las esquinas para redimensionar"
            : "Usa el botón 'Enlazar' para conectar clases"}
        </div>
      </div>

      {/* Resize handles - solo visible cuando está seleccionado y no bloqueado */}
      {isSelected && !isLocked && (
        <>
          {/* Corner handles */}
          <div
            className="absolute w-3 h-3 bg-blue-500 border border-white rounded-full cursor-nw-resize"
            style={{ top: -6, left: -6 }}
            onMouseDown={(e) => handleResizeStart(e, "nw")}
          />
          <div
            className="absolute w-3 h-3 bg-blue-500 border border-white rounded-full cursor-ne-resize"
            style={{ top: -6, right: -6 }}
            onMouseDown={(e) => handleResizeStart(e, "ne")}
          />
          <div
            className="absolute w-3 h-3 bg-blue-500 border border-white rounded-full cursor-sw-resize"
            style={{ bottom: -6, left: -6 }}
            onMouseDown={(e) => handleResizeStart(e, "sw")}
          />
          <div
            className="absolute w-3 h-3 bg-blue-500 border border-white rounded-full cursor-se-resize"
            style={{ bottom: -6, right: -6 }}
            onMouseDown={(e) => handleResizeStart(e, "se")}
          />

          {/* Edge handles */}
          <div
            className="absolute w-3 h-3 bg-blue-400 border border-white rounded-full cursor-n-resize"
            style={{ top: -6, left: "50%", transform: "translateX(-50%)" }}
            onMouseDown={(e) => handleResizeStart(e, "n")}
          />
          <div
            className="absolute w-3 h-3 bg-blue-400 border border-white rounded-full cursor-s-resize"
            style={{ bottom: -6, left: "50%", transform: "translateX(-50%)" }}
            onMouseDown={(e) => handleResizeStart(e, "s")}
          />
          <div
            className="absolute w-3 h-3 bg-blue-400 border border-white rounded-full cursor-w-resize"
            style={{ top: "50%", left: -6, transform: "translateY(-50%)" }}
            onMouseDown={(e) => handleResizeStart(e, "w")}
          />
          <div
            className="absolute w-3 h-3 bg-blue-400 border border-white rounded-full cursor-e-resize"
            style={{ top: "50%", right: -6, transform: "translateY(-50%)" }}
            onMouseDown={(e) => handleResizeStart(e, "e")}
          />
        </>
      )}

      {/* Indicador de selección */}
      {isSelected && <div className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white" />}
    </div>
  )
}
