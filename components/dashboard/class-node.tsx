"use client"

import type React from "react"

import { useState } from "react"
import type { ClassNodeData } from "@/types/diagram-types"
import { ChevronDown, ChevronUp, Edit, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

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
  const [showAttributes, setShowAttributes] = useState(true)
  const [showMethods, setShowMethods] = useState(true)
  const [className, setClassName] = useState(data.name)
  const [attributes, setAttributes] = useState(data.attributes)
  const [methods, setMethods] = useState(data.methods)

  const handleSave = () => {
    const updatedData = {
      ...data,
      name: className,
      attributes,
      methods,
    }
    onUpdate(updatedData)
    setIsEditing(false)
  }

  const addAttribute = () => {
    setAttributes([...attributes, { name: "nuevo", type: "String", visibility: "public" }])
  }

  const removeAttribute = (index: number) => {
    const newAttributes = [...attributes]
    newAttributes.splice(index, 1)
    setAttributes(newAttributes)
  }

  const updateAttribute = (index: number, field: string, value: string) => {
    const newAttributes = [...attributes]
    ;(newAttributes[index] as any)[field] = value
    setAttributes(newAttributes)
  }

  const addMethod = () => {
    setMethods([...methods, { name: "nuevo", returnType: "void", parameters: [], visibility: "public" }])
  }

  const removeMethod = (index: number) => {
    const newMethods = [...methods]
    newMethods.splice(index, 1)
    setMethods(newMethods)
  }

  const updateMethod = (index: number, field: string, value: string) => {
    const newMethods = [...methods]
    ;(newMethods[index] as any)[field] = value
    setMethods(newMethods)
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

  const handleNodeClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isLocked) {
      onSelect(data.id)
    }
  }

  return (
    <div
      className={`absolute bg-white border-2 rounded shadow-lg min-w-[200px] max-w-[300px] cursor-move ${
        isSelected ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-300"
      }`}
      style={{
        left: `${data.position.x}px`,
        top: `${data.position.y}px`,
      }}
      onClick={handleNodeClick}
    >
      <div className="absolute -top-3 -left-3 w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center cursor-grab"></div>

      {/* Class Name */}
      <div className="border-b p-2 bg-gray-100 font-bold text-center relative">
        {isEditing ? (
          <Input value={className} onChange={(e) => setClassName(e.target.value)} className="mb-1" />
        ) : (
          <div className="text-lg">{data.name}</div>
        )}
        {!isEditing && !isLocked && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1 h-6 w-6"
            onClick={(e) => {
              e.stopPropagation()
              setIsEditing(true)
            }}
          >
            <Edit className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Attributes */}
      <div className="border-b">
        <div
          className="p-1 bg-gray-50 font-semibold flex justify-between cursor-pointer hover:bg-gray-100 transition-colors"
          onClick={(e) => {
            e.stopPropagation()
            setShowAttributes(!showAttributes)
          }}
        >
          <span className="text-sm">Atributos</span>
          {showAttributes ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
        {showAttributes && (
          <div className="p-2">
            {isEditing ? (
              <div className="space-y-2">
                {attributes.map((attr, index) => (
                  <div key={index} className="flex items-center gap-1">
                    <select
                      value={attr.visibility}
                      onChange={(e) => updateAttribute(index, "visibility", e.target.value)}
                      className="w-20 px-2 py-1 border border-gray-300 rounded text-xs"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <option value="public">Público</option>
                      <option value="private">Privado</option>
                      <option value="protected">Protegido</option>
                    </select>
                    <Input
                      value={attr.name}
                      onChange={(e) => updateAttribute(index, "name", e.target.value)}
                      className="flex-1 text-xs"
                      placeholder="Nombre"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <Input
                      value={attr.type}
                      onChange={(e) => updateAttribute(index, "type", e.target.value)}
                      className="flex-1 text-xs"
                      placeholder="Tipo"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeAttribute(index)
                      }}
                      className="h-6 w-6"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    addAttribute()
                  }}
                  className="w-full mt-1"
                >
                  <Plus className="h-3 w-3 mr-1" /> Añadir atributo
                </Button>
              </div>
            ) : (
              <div className="space-y-1 text-sm">
                {attributes.length === 0 ? (
                  <div className="text-gray-500 italic text-xs">Sin atributos</div>
                ) : (
                  attributes.map((attr, index) => (
                    <div key={index} className="font-mono text-xs">
                      {getVisibilitySymbol(attr.visibility)} {attr.name}: {attr.type}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Methods */}
      <div>
        <div
          className="p-1 bg-gray-50 font-semibold flex justify-between cursor-pointer hover:bg-gray-100 transition-colors"
          onClick={(e) => {
            e.stopPropagation()
            setShowMethods(!showMethods)
          }}
        >
          <span className="text-sm">Métodos</span>
          {showMethods ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
        {showMethods && (
          <div className="p-2">
            {isEditing ? (
              <div className="space-y-2">
                {methods.map((method, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center gap-1">
                      <select
                        value={method.visibility}
                        onChange={(e) => updateMethod(index, "visibility", e.target.value)}
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-xs"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <option value="public">Público</option>
                        <option value="private">Privado</option>
                        <option value="protected">Protegido</option>
                      </select>
                      <Input
                        value={method.name}
                        onChange={(e) => updateMethod(index, "name", e.target.value)}
                        className="flex-1 text-xs"
                        placeholder="Nombre"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <Input
                        value={method.returnType}
                        onChange={(e) => updateMethod(index, "returnType", e.target.value)}
                        className="flex-1 text-xs"
                        placeholder="Retorno"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation()
                          removeMethod(index)
                        }}
                        className="h-6 w-6"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    addMethod()
                  }}
                  className="w-full mt-1"
                >
                  <Plus className="h-3 w-3 mr-1" /> Añadir método
                </Button>
              </div>
            ) : (
              <div className="space-y-1 text-sm">
                {methods.length === 0 ? (
                  <div className="text-gray-500 italic text-xs">Sin métodos</div>
                ) : (
                  methods.map((method, index) => (
                    <div key={index} className="font-mono text-xs">
                      {getVisibilitySymbol(method.visibility)} {method.name}(): {method.returnType}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {isEditing && (
        <div className="p-2 border-t bg-gray-50 flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              setIsEditing(false)
            }}
          >
            Cancelar
          </Button>
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              handleSave()
            }}
          >
            Guardar
          </Button>
        </div>
      )}

      {isSelected && !isLocked && (
        <Button
          variant="destructive"
          size="icon"
          className="absolute -top-3 -right-3 h-6 w-6 rounded-full"
          onClick={(e) => {
            e.stopPropagation()
            onDelete(data.id)
          }}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      )}
    </div>
  )
}
