"use client"

import type React from "react"
import type { Relationship, ClassNodeData } from "@/types/diagram-types"

interface RelationshipLineProps {
  relationship: Relationship
  classes: ClassNodeData[]
  onUpdate: (relationship: Relationship) => void
  onDelete: (id: string) => void
  isSelected: boolean
  onSelect: (id: string) => void
  isLocked: boolean
}

export function RelationshipLine({
  relationship,
  classes,
  onUpdate,
  onDelete,
  isSelected,
  onSelect,
  isLocked,
}: RelationshipLineProps) {
  const sourceClass = classes.find((c) => c.id === relationship.source)
  const targetClass = classes.find((c) => c.id === relationship.target)

  if (!sourceClass || !targetClass) return null

  // Dimensiones aproximadas de las clases
  const classWidth = 200
  const classHeight = 150

  // Calcular puntos de conexión
  const sourceCenter = {
    x: sourceClass.position.x + classWidth / 2,
    y: sourceClass.position.y + classHeight / 2,
  }

  const targetCenter = {
    x: targetClass.position.x + classWidth / 2,
    y: targetClass.position.y + classHeight / 2,
  }

  // Determinar los puntos de conexión en los bordes de las clases
  const angle = Math.atan2(targetCenter.y - sourceCenter.y, targetCenter.x - sourceCenter.x)

  // Calcular puntos de conexión en los bordes
  let sourceX, sourceY, targetX, targetY

  // Para la clase origen
  if (Math.abs(Math.cos(angle)) > Math.abs(Math.sin(angle))) {
    // Conexión horizontal (izquierda o derecha)
    sourceX = sourceCenter.x + Math.sign(Math.cos(angle)) * (classWidth / 2)
    sourceY = sourceCenter.y + Math.tan(angle) * Math.sign(Math.cos(angle)) * (classWidth / 2)
  } else {
    // Conexión vertical (arriba o abajo)
    sourceX = sourceCenter.x + Math.tan(Math.PI / 2 - angle) * Math.sign(Math.sin(angle)) * (classHeight / 2)
    sourceY = sourceCenter.y + Math.sign(Math.sin(angle)) * (classHeight / 2)
  }

  // Para la clase destino
  if (Math.abs(Math.cos(angle)) > Math.abs(Math.sin(angle))) {
    // Conexión horizontal (izquierda o derecha)
    targetX = targetCenter.x - Math.sign(Math.cos(angle)) * (classWidth / 2)
    targetY = targetCenter.y - Math.tan(angle) * Math.sign(Math.cos(angle)) * (classWidth / 2)
  } else {
    // Conexión vertical (arriba o abajo)
    targetX = targetCenter.x - Math.tan(Math.PI / 2 - angle) * Math.sign(Math.sin(angle)) * (classHeight / 2)
    targetY = targetCenter.y - Math.sign(Math.sin(angle)) * (classHeight / 2)
  }

  // Calcular puntos de control para la curva Bezier
  const dx = targetX - sourceX
  const dy = targetY - sourceY
  const distance = Math.sqrt(dx * dx + dy * dy)

  // Ajustar la curvatura según la distancia
  const curveFactor = Math.min(0.2, 30 / distance)

  const controlPoint1 = {
    x: sourceX + dx * 0.25,
    y: sourceY + dy * 0.25 - distance * curveFactor,
  }

  const controlPoint2 = {
    x: sourceX + dx * 0.75,
    y: sourceY + dy * 0.75 - distance * curveFactor,
  }

  // Crear el path para la curva Bezier
  const pathData = `M ${sourceX} ${sourceY} C ${controlPoint1.x} ${controlPoint1.y}, ${controlPoint2.x} ${controlPoint2.y}, ${targetX} ${targetY}`

  // Calcular punto medio para el texto y selector
  const midPoint = {
    x: sourceX + dx * 0.5,
    y: sourceY + dy * 0.5 - distance * curveFactor,
  }

  // Get marker end based on relationship type
  const getMarkerEnd = () => {
    switch (relationship.type) {
      case "inheritance":
        return "url(#inheritance)"
      case "implementation":
        return "url(#implementation)"
      case "aggregation":
        return "url(#aggregation)"
      case "composition":
        return "url(#composition)"
      default:
        return "url(#association)"
    }
  }

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (isLocked) return

    const newType = e.target.value as Relationship["type"]
    onUpdate({
      ...relationship,
      type: newType,
    })
  }

  const handleLineClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isLocked) {
      onSelect(relationship.id)
    }
  }

  // Obtener el nombre legible del tipo de relación
  const getRelationshipTypeName = () => {
    switch (relationship.type) {
      case "inheritance":
        return "Herencia"
      case "implementation":
        return "Implementación"
      case "aggregation":
        return "Agregación"
      case "composition":
        return "Composición"
      default:
        return "Asociación"
    }
  }

  return (
    <>
      <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ zIndex: 10 }}>
        <defs>
          <marker
            id="association"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#555" />
          </marker>
          <marker
            id="inheritance"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="white" stroke="#555" strokeWidth="1" />
          </marker>
          <marker
            id="implementation"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="white" stroke="#555" strokeWidth="1" strokeDasharray="1" />
          </marker>
          <marker
            id="aggregation"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 5 L 5 0 L 10 5 L 5 10 z" fill="white" stroke="#555" strokeWidth="1" />
          </marker>
          <marker
            id="composition"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 5 L 5 0 L 10 5 L 5 10 z" fill="#555" />
          </marker>
        </defs>

        {/* Área invisible más amplia para facilitar la selección */}
        <path
          d={pathData}
          stroke="transparent"
          strokeWidth="15"
          fill="none"
          style={{ pointerEvents: "auto", cursor: isLocked ? "not-allowed" : "pointer" }}
          onClick={handleLineClick}
        />

        {/* Línea visible */}
        <path
          d={pathData}
          stroke={isSelected ? "#3b82f6" : "#555"}
          strokeWidth={isSelected ? 2 : 1.5}
          strokeDasharray={relationship.type === "implementation" ? "5,5" : "none"}
          fill="none"
          markerEnd={getMarkerEnd()}
          style={{ pointerEvents: "none" }}
        />

        {/* Texto del tipo de relación */}
        <text
          x={midPoint.x}
          y={midPoint.y - 10}
          textAnchor="middle"
          fontSize="12"
          fill="#333"
          stroke="#fff"
          strokeWidth="3"
          paintOrder="stroke"
          style={{ pointerEvents: "none" }}
        >
          {getRelationshipTypeName()}
        </text>
      </svg>

      {isSelected && !isLocked && (
        <div
          className="absolute bg-white border border-gray-300 rounded shadow-md p-2 z-20"
          style={{
            left: `${midPoint.x - 80}px`,
            top: `${midPoint.y + 10}px`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-2">
            <select
              value={relationship.type}
              onChange={handleTypeChange}
              className="text-xs p-1 border border-gray-300 rounded w-32"
              disabled={isLocked}
            >
              <option value="association">Asociación</option>
              <option value="inheritance">Herencia</option>
              <option value="implementation">Implementación</option>
              <option value="aggregation">Agregación</option>
              <option value="composition">Composición</option>
            </select>
            <button
              className="text-red-500 hover:text-red-700 p-1 text-lg font-bold"
              onClick={() => onDelete(relationship.id)}
              disabled={isLocked}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  )
}
