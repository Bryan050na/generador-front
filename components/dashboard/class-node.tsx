"use client"

import type React from "react"

import { useState } from "react"
import type { ClassNodeData } from "@/types/diagram-types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Minus, Edit2, Trash2, Check, X } from "lucide-react"

interface ClassNodeProps {
  data: ClassNodeData
  isSelected: boolean
  onSelect: (id: string) => void
  onUpdate: (data: ClassNodeData) => void
  onDelete: (id: string) => void
  isLocked: boolean
}

export function ClassNode({ data, isSelected, onSelect, onUpdate, onDelete, isLocked }: ClassNodeProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(data.name)

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isLocked) {
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
    if (!isLocked && confirm(`¿Estás seguro de que quieres eliminar la clase "${data.name}"?`)) {
      onDelete(data.id)
    }
  }

  const handleEntityChange = (checked: boolean) => {
    if (!isLocked) {
      onUpdate({ ...data, isEntity: checked })
    }
  }

  const addAttribute = () => {
    if (!isLocked) {
      const newAttribute = { name: "nuevoAtributo", type: "String", visibility: "public" as const }
      onUpdate({ ...data, attributes: [...data.attributes, newAttribute] })
    }
  }

  const removeAttribute = (index: number) => {
    if (!isLocked) {
      const newAttributes = data.attributes.filter((_, i) => i !== index)
      onUpdate({ ...data, attributes: newAttributes })
    }
  }

  const updateAttribute = (index: number, field: string, value: string) => {
    if (!isLocked) {
      const newAttributes = data.attributes.map((attr, i) => (i === index ? { ...attr, [field]: value } : attr))
      onUpdate({ ...data, attributes: newAttributes })
    }
  }

  const addMethod = () => {
    if (!isLocked) {
      const newMethod = { name: "nuevoMetodo", returnType: "void", parameters: [], visibility: "public" as const }
      onUpdate({ ...data, methods: [...data.methods, newMethod] })
    }
  }

  const removeMethod = (index: number) => {
    if (!isLocked) {
      const newMethods = data.methods.filter((_, i) => i !== index)
      onUpdate({ ...data, methods: newMethods })
    }
  }

  const updateMethod = (index: number, field: string, value: string) => {
    if (!isLocked) {
      const newMethods = data.methods.map((method, i) => (i === index ? { ...method, [field]: value } : method))
      onUpdate({ ...data, methods: newMethods })
    }
  }

  const getVisibilitySymbol = (visibility: string) => {
    switch (visibility) {
      case "public":
        return "+"
      case "private":
        return "-"
      case "protected":
        return "#"
      default:
        return "+"
    }
  }

  return (
    <div
      className={`absolute bg-white border-2 rounded-lg shadow-md min-w-[200px] ${
        isSelected ? "border-blue-500 shadow-lg" : "border-gray-300"
      } ${isLocked ? "cursor-not-allowed" : "cursor-pointer"}`}
      style={{
        left: data.position.x,
        top: data.position.y,
      }}
      onClick={handleClick}
    >
      {/* Header */}
      <div className="bg-blue-50 border-b border-gray-200 p-3 rounded-t-lg">
        <div className="flex items-center justify-between mb-2">
          {isEditing && !isLocked ? (
            <div className="flex items-center gap-2 flex-1">
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="h-8 text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveName()
                  if (e.key === "Escape") handleCancelEdit()
                }}
                autoFocus
              />
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleSaveName}>
                <Check className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleCancelEdit}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <>
              <h3 className="font-bold text-center flex-1">{data.name}</h3>
              {isSelected && !isLocked && (
                <div className="flex items-center gap-1">
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
                  <Button size="icon" variant="ghost" className="h-6 w-6 text-red-600" onClick={handleDelete}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Checkbox de entidad */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id={`entity-${data.id}`}
            checked={data.isEntity || false}
            onCheckedChange={handleEntityChange}
            disabled={isLocked}
          />
          <label htmlFor={`entity-${data.id}`} className="text-sm font-medium">
            Es Entidad
          </label>
        </div>
      </div>

      {/* Attributes */}
      <div className="p-3 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold text-sm">Atributos</h4>
          {isSelected && !isLocked && (
            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={addAttribute}>
              <Plus className="h-3 w-3" />
            </Button>
          )}
        </div>
        <div className="space-y-1">
          {data.attributes.map((attr, index) => (
            <div key={index} className="flex items-center gap-1 text-sm">
              {isSelected && !isLocked ? (
                <>
                  <Select
                    value={attr.visibility}
                    onValueChange={(value) => updateAttribute(index, "visibility", value)}
                  >
                    <SelectTrigger className="w-16 h-6 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">+</SelectItem>
                      <SelectItem value="private">-</SelectItem>
                      <SelectItem value="protected">#</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    value={attr.name}
                    onChange={(e) => updateAttribute(index, "name", e.target.value)}
                    className="h-6 text-xs flex-1"
                  />
                  <span className="text-xs">:</span>
                  <Input
                    value={attr.type}
                    onChange={(e) => updateAttribute(index, "type", e.target.value)}
                    className="h-6 text-xs w-20"
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 text-red-600"
                    onClick={() => removeAttribute(index)}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                </>
              ) : (
                <span className="font-mono">
                  {getVisibilitySymbol(attr.visibility)} {attr.name}: {attr.type}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Methods */}
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold text-sm">Métodos</h4>
          {isSelected && !isLocked && (
            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={addMethod}>
              <Plus className="h-3 w-3" />
            </Button>
          )}
        </div>
        <div className="space-y-1">
          {data.methods.map((method, index) => (
            <div key={index} className="flex items-center gap-1 text-sm">
              {isSelected && !isLocked ? (
                <>
                  <Select value={method.visibility} onValueChange={(value) => updateMethod(index, "visibility", value)}>
                    <SelectTrigger className="w-16 h-6 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">+</SelectItem>
                      <SelectItem value="private">-</SelectItem>
                      <SelectItem value="protected">#</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    value={method.name}
                    onChange={(e) => updateMethod(index, "name", e.target.value)}
                    className="h-6 text-xs flex-1"
                  />
                  <span className="text-xs">:</span>
                  <Input
                    value={method.returnType}
                    onChange={(e) => updateMethod(index, "returnType", e.target.value)}
                    className="h-6 text-xs w-20"
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 text-red-600"
                    onClick={() => removeMethod(index)}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                </>
              ) : (
                <span className="font-mono">
                  {getVisibilitySymbol(method.visibility)} {method.name}(): {method.returnType}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Selection indicator */}
      {isSelected && <div className="absolute -top-2 -left-2 w-4 h-4 bg-blue-500 rounded-full border-2 border-white" />}

      {/* Entity indicator */}
      {data.isEntity && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-white" />
      )}
    </div>
  )
}
