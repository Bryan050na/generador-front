"use client"

import type React from "react"
import { useState, useCallback, useRef } from "react"
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  MiniMap,
  Background,
  type Connection,
  type Edge,
  type Node,
  type NodeTypes,
  type EdgeTypes,
  Panel,
} from "reactflow"
import "reactflow/dist/style.css"
import { ClassNode } from "./class-node"
import type { ClassNodeData } from "@/types/diagram-types"
import { ClassNodeSidebar } from "./class-node-sidebar"
import { RelationshipEdge } from "./relationship-edge"
import { Button } from "@/components/ui/button"
import { Download, Upload, Trash2 } from "lucide-react"

const nodeTypes: NodeTypes = {
  classNode: ClassNode,
}

const edgeTypes: EdgeTypes = {
  relationship: RelationshipEdge,
}

const initialNodes: Node<ClassNodeData>[] = []
const initialEdges: Edge[] = []

export function ClassDiagramEditor() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null)

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge({ ...params, type: "relationship", animated: true }, eds))
    },
    [setEdges],
  )

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = "move"
  }, [])

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault()

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect()
      const type = event.dataTransfer.getData("application/reactflow")

      // check if the dropped element is valid
      if (typeof type === "undefined" || !type || !reactFlowBounds || !reactFlowInstance) {
        return
      }

      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      })

      const newNode: Node<ClassNodeData> = {
        id: `class_${Date.now()}`,
        type: "classNode",
        position,
        data: {
          name: `Clase${nodes.length + 1}`,
          attributes: [{ name: "atributo1", type: "String", visibility: "public" }],
          methods: [{ name: "metodo1", returnType: "void", parameters: [], visibility: "public" }],
        },
      }

      setNodes((nds) => nds.concat(newNode))
    },
    [reactFlowInstance, nodes, setNodes],
  )

  const exportToJson = () => {
    if (reactFlowInstance) {
      const flow = reactFlowInstance.toObject()
      const dataStr = JSON.stringify(flow, null, 2)
      const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)

      const exportFileDefaultName = `diagrama-clases-${new Date().toISOString().split("T")[0]}.json`

      const linkElement = document.createElement("a")
      linkElement.setAttribute("href", dataUri)
      linkElement.setAttribute("download", exportFileDefaultName)
      linkElement.click()
    }
  }

  const importFromJson = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader()
    if (event.target.files && event.target.files.length > 0) {
      fileReader.readAsText(event.target.files[0], "UTF-8")
      fileReader.onload = (e) => {
        if (e.target?.result && typeof e.target.result === "string") {
          try {
            const flow = JSON.parse(e.target.result)
            if (flow.nodes && flow.edges) {
              setNodes(flow.nodes || [])
              setEdges(flow.edges || [])
            }
          } catch (error) {
            console.error("Error al importar el archivo JSON:", error)
            alert("Error al importar el archivo. Verifica que sea un archivo JSON válido.")
          }
        }
      }
    }
  }

  const clearDiagram = () => {
    if (confirm("¿Estás seguro de que quieres limpiar todo el diagrama?")) {
      setNodes([])
      setEdges([])
    }
  }

  return (
    <div className="flex h-full">
      <ClassNodeSidebar />
      <div className="flex-grow h-full" ref={reactFlowWrapper}>
        <ReactFlowProvider>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            snapToGrid
            snapGrid={[15, 15]}
            defaultViewport={{ x: 0, y: 0, zoom: 1 }}
            minZoom={0.2}
            maxZoom={2}
          >
            <Controls />
            <MiniMap
              nodeColor={(node) => {
                switch (node.type) {
                  case "classNode":
                    return "#3b82f6"
                  default:
                    return "#ff0072"
                }
              }}
            />
            <Background variant="dots" gap={12} size={1} />
            <Panel position="top-right">
              <div className="flex gap-2 bg-white p-2 rounded-lg shadow-lg">
                <Button onClick={exportToJson} size="sm" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Exportar JSON
                </Button>
                <div className="relative">
                  <Button size="sm" className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Importar JSON
                  </Button>
                  <input
                    type="file"
                    accept=".json"
                    onChange={importFromJson}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
                <Button onClick={clearDiagram} variant="destructive" size="sm" className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4" />
                  Limpiar
                </Button>
              </div>
            </Panel>
          </ReactFlow>
        </ReactFlowProvider>
      </div>
    </div>
  )
}
