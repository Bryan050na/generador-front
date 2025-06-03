export interface Position {
  x: number
  y: number
}

export interface ClassAttribute {
  name: string
  type: string
  visibility: "public" | "private" | "protected"
}

export interface ClassMethod {
  name: string
  returnType: string
  parameters: string[]
  visibility: "public" | "private" | "protected"
}

export interface ClassField {
  name: string
  type: string
  isIdField?: boolean
  generationStrategy?: string
}

export interface ClassRelationship {
  type: "OneToMany" | "ManyToOne" | "OneToOne" | "ManyToMany"
  mappedBy?: string
  cascade?: string[]
  fetch?: "LAZY" | "EAGER"
}

export interface ClassNodeData {
  id: string
  name: string
  attributes: ClassAttribute[]
  methods: ClassMethod[]
  position: Position
  isEntity?: boolean
  fields?: ClassField[]
  relationships?: ClassRelationship[]
}

export interface PackageNodeData {
  id: string
  name: string
  position: Position
  size: { width: number; height: number }
}

export interface Relationship {
  id: string
  source: string
  target: string
  type: "association" | "inheritance" | "implementation" | "aggregation" | "composition" | "package-class"
}

export interface PackageClassRelation {
  id: string
  packageId: string
  classId: string
}

export interface DiagramData {
  classes: ClassNodeData[]
  packages: PackageNodeData[]
  relationships: Relationship[]
  packageClassRelations: PackageClassRelation[]
}

// Estructura JSON de exportación
export interface ExportProject {
  projectName: string
  package: ExportPackage[]
  class?: ExportClass
}

export interface ExportPackage {
  packageName: string
  classes: ExportClass[]
}

export interface ExportClass {
  className: string
  isEntity: boolean
  fields: ExportField[]
  relationships?: ExportRelationship[]
}

export interface ExportField {
  name: string
  type: string
  isIdField?: boolean
  generationStrategy?: string
}

export interface ExportRelationship {
  type: string
  mappedBy?: string
  cascade?: string[]
  fetch?: string
}
