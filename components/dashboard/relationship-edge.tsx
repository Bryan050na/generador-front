"use client"

import { useState } from "react"
import { type EdgeProps, getBezierPath, EdgeLabelRenderer } from "reactflow"

export function RelationshipEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  const [relationshipType, setRelationshipType] = useState("association")

  // Define markers for different relationship types
  const getMarkerEnd = () => {
    switch (relationshipType) {
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

  return (
    <>
      {/* Define SVG markers for different relationship types */}
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

      <path
        id={id}
        style={{
          ...style,
          strokeWidth: 1.5,
          stroke: "#555",
          strokeDasharray: relationshipType === "implementation" ? "5,5" : "none",
        }}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={getMarkerEnd()}
      />

      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: "all",
          }}
          className="nodrag nopan"
        >
          <select
            value={relationshipType}
            onChange={(e) => setRelationshipType(e.target.value)}
            className="w-[120px] h-7 text-xs bg-white border border-gray-300 rounded px-2 shadow-sm"
          >
            <option value="association">Asociación</option>
            <option value="inheritance">Herencia</option>
            <option value="implementation">Implementación</option>
            <option value="aggregation">Agregación</option>
            <option value="composition">Composición</option>
          </select>
        </div>
      </EdgeLabelRenderer>
    </>
  )
}
