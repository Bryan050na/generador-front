export interface Attribute {
  name: string
  type: string
  visibility: "public" | "private" | "protected"
}

export interface Method {
  name: string
  returnType: string
  parameters: Parameter[]
  visibility: "public" | "private" | "protected"
}

export interface Parameter {
  name: string
  type: string
}

export interface ClassNodeData {
  id: string
  name: string
  attributes: Attribute[]
  methods: Method[]
  position: { x: number; y: number }
}

export interface Relationship {
  id: string
  source: string
  target: string
  type: "association" | "inheritance" | "implementation" | "aggregation" | "composition"
}

export interface DiagramData {
  classes: ClassNodeData[]
  relationships: Relationship[]
}
