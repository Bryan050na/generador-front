"use client"

import type React from "react"
import type { PackageClassRelation, ClassNodeData, PackageNodeData } from "@/types/diagram-types"

interface PackageClassLineProps {
  relation: PackageClassRelation
  classes: ClassNodeData[]
  packages: PackageNodeData[]
  onDelete: (id: string) => void
  isSelected: boolean
  onSelect: (id: string) => void
  isLocked: boolean
}

export function PackageClassLine({
  relation,
  classes,
  packages,
  onDelete,
  isSelected,
  onSelect,
  isLocked,
}: PackageClassLineProps) {
  const packageNode = packages.find((p) => p.id === relation.packageId)
  const classNode = classes.find((c) => c.id === relation.classId)

  if (!packageNode || !classNode) return null

  // Calcular puntos de conexión
  const packageCenter = {
    x: packageNode.position.x + packageNode.size.width / 2,
    y: packageNode.position.y + packageNode.size.height / 2,
  }

  const classCenter = {
    x: classNode.position.x + 100, // Aproximadamente el centro de la clase
    y: classNode.position.y + 75,
  }

  // Crear línea recta
  const pathData = `M ${packageCenter.x} ${packageCenter.y} L ${classCenter.x} ${classCenter.y}`

  // Punto medio para controles
  const midPoint = {
    x: (packageCenter.x + classCenter.x) / 2,
    y: (packageCenter.y + classCenter.y) / 2,
  }

  const handleLineClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isLocked) {
      onSelect(relation.id)
    }
  }

  return (
    <>
      <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ zIndex: 5 }}>
        <defs>
          <marker
            id="package-class"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <circle cx="5" cy="5" r="3" fill="#10b981" stroke="#059669" strokeWidth="1" />
          </marker>
        </defs>

        {/* Área invisible para facilitar la selección */}
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
          stroke={isSelected ? "#10b981" : "#059669"}
          strokeWidth={isSelected ? 3 : 2}
          strokeDasharray="5,5"
          fill="none"
          markerEnd="url(#package-class)"
          style={{ pointerEvents: "none" }}
        />

        {/* Texto de la relación */}
        <text
          x={midPoint.x}
          y={midPoint.y - 10}
          textAnchor="middle"
          fontSize="11"
          fill="#059669"
          stroke="#fff"
          strokeWidth="2"
          paintOrder="stroke"
          style={{ pointerEvents: "none" }}
        >
          contiene
        </text>
      </svg>

      {isSelected && !isLocked && (
        <div
          className="absolute bg-white border border-green-300 rounded shadow-md p-2 z-20"
          style={{
            left: `${midPoint.x - 60}px`,
            top: `${midPoint.y + 10}px`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-2">
            <span className="text-xs text-green-700 font-medium">Relación Paquete-Clase</span>
            <button
              className="text-red-500 hover:text-red-700 p-1 text-lg font-bold"
              onClick={() => onDelete(relation.id)}
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
