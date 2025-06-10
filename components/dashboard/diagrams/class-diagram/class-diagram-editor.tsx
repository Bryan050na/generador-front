"use client"

import React, { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Layers, BrainCircuit, Trash2, ZoomIn, ZoomOut, MousePointer, Share2, Undo2, CheckCircle, XCircle } from "lucide-react"
import { ClassDiagramSidebar } from "./class-diagram-sidebar"

// --- Constantes y Tipos ---
const ELEMENT_TYPES = { 
    CLASS: 'CLASS',
    RELATIONSHIP: 'RELATIONSHIP'
};
const RELATIONSHIP_TYPES = {
    ASSOCIATION: 'ASSOCIATION',
    AGGREGATION: 'AGGREGATION',
    COMPOSITION: 'COMPOSITION',
    INHERITANCE: 'INHERITANCE',
    DEPENDENCY: 'DEPENDENCY',
};
const VISIBILITY_MAP = {
    public: '+',
    private: '-',
    protected: '#'
};
const DATA_TRANSFER_TYPE = "application/class-diagram-object";

// --- Componentes Modales ---
const ClassEditModal = ({ onSubmit, onCancel, classData }) => {
    const [name, setName] = useState(classData?.name || '');
    const [attributes, setAttributes] = useState(classData?.attributes || [{ id: Date.now(), visibility: 'private', name: 'id', type: 'int' }]);
    const [methods, setMethods] = useState(classData?.methods || [{ id: Date.now(), visibility: 'public', name: 'myMethod', type: 'void' }]);
    const addAttribute = () => setAttributes([...attributes, { id: Date.now(), visibility: 'private', name: '', type: '' }]);
    const addMethod = () => setMethods([...methods, { id: Date.now(), visibility: 'public', name: '', type: '' }]);
    const handleAttrChange = (id, field, value) => setAttributes(attributes.map(a => a.id === id ? { ...a, [field]: value } : a));
    const handleMethodChange = (id, field, value) => setMethods(methods.map(m => m.id === id ? { ...m, [field]: value } : m));
    const handleRemoveAttr = (id) => setAttributes(attributes.filter(a => a.id !== id));
    const handleRemoveMethod = (id) => setMethods(methods.filter(m => m.id !== id));
    const handleSubmit = (e) => { e.preventDefault(); onSubmit({ name, attributes, methods }); };
    const renderFieldList = (items, handler, remover) => items.map((item) => (
        <div key={item.id} className="flex items-center gap-2 mb-2">
            <select value={item.visibility} onChange={(e) => handler(item.id, 'visibility', e.target.value)} className="p-1 border rounded-md bg-gray-50 text-xs">
                <option value="public">+</option> <option value="private">-</option> <option value="protected">#</option>
            </select>
            <input type="text" placeholder="nombre" value={item.name} onChange={(e) => handler(item.id, 'name', e.target.value)} className="p-1 border rounded-md flex-grow text-sm"/>
            <span className="text-gray-400">:</span>
            <input type="text" placeholder="tipo" value={item.type} onChange={(e) => handler(item.id, 'type', e.target.value)} className="p-1 border rounded-md flex-grow text-sm"/>
            <Button type="button" variant="ghost" size="icon" onClick={() => remover(item.id)} className="h-7 w-7 text-red-500 hover:text-red-700"><Trash2 size={16}/></Button>
        </div>
    ));
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
                <h3 className="text-xl font-bold mb-4">Editar Clase</h3>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Clase</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="p-2 border rounded-md w-full text-lg" placeholder="NombreDeLaClase" required/>
                </div>
                <div className="flex-grow overflow-y-auto pr-2">
                    <div className="mb-4">
                        <h4 className="font-semibold mb-2 text-gray-800">Atributos</h4>
                        {renderFieldList(attributes, handleAttrChange, handleRemoveAttr)}
                        <Button type="button" variant="link" onClick={addAttribute} className="text-sm p-0 h-auto">+ Añadir Atributo</Button>
                    </div>
                    <hr className="my-4"/>
                    <div>
                        <h4 className="font-semibold mb-2 text-gray-800">Métodos</h4>
                        {renderFieldList(methods, handleMethodChange, handleRemoveMethod)}
                        <Button type="button" variant="link" onClick={addMethod} className="text-sm p-0 h-auto">+ Añadir Método</Button>
                    </div>
                </div>
                <div className="flex justify-end space-x-2 pt-4 border-t mt-4">
                    <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
                    <Button type="submit">Guardar</Button>
                </div>
            </form>
        </div>
    );
};

const RelationshipTypeModal = ({ onSubmit, onCancel }) => (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-xl w-96">
            <h3 className="text-lg font-bold mb-4">Tipo de Relación</h3>
            <div className="grid grid-cols-1 gap-4">
                <Button variant="outline" className="justify-start" onClick={() => onSubmit(RELATIONSHIP_TYPES.ASSOCIATION)}>Asociación (Línea)</Button>
                <Button variant="outline" className="justify-start" onClick={() => onSubmit(RELATIONSHIP_TYPES.DEPENDENCY)}>Dependencia (Punteada)</Button>
                <Button variant="outline" className="justify-start" onClick={() => onSubmit(RELATIONSHIP_TYPES.AGGREGATION)}>Agregación (Rombo hueco)</Button>
                <Button variant="outline" className="justify-start" onClick={() => onSubmit(RELATIONSHIP_TYPES.COMPOSITION)}>Composición (Rombo relleno)</Button>
                <Button variant="outline" className="justify-start" onClick={() => onSubmit(RELATIONSHIP_TYPES.INHERITANCE)}>Herencia (Triángulo)</Button>
            </div>
            <div className="flex justify-end mt-6">
                <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
            </div>
        </div>
    </div>
);

const GenerateModal = ({ onSubmit, onCancel }) => {
    const [projectName, setProjectName] = useState('');
    const [packageName, setPackageName] = useState('');
    const handleSubmit = (e) => { e.preventDefault(); if (projectName.trim() && packageName.trim()) { onSubmit(projectName.trim(), packageName.trim()); } };
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-xl w-96">
                <h3 className="text-lg font-bold mb-4">Detalles del Proyecto</h3>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Proyecto</label>
                    <input type="text" value={projectName} onChange={(e) => setProjectName(e.target.value)} className="border border-gray-300 p-2 rounded-md w-full" placeholder="MiSistema" />
                </div>
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Paquete Principal</label>
                    <input type="text" value={packageName} onChange={(e) => setPackageName(e.target.value)} className="border border-gray-300 p-2 rounded-md w-full" placeholder="com.miempresa.app" />
                </div>
                <div className="flex justify-end space-x-2">
                     <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
                     <Button type="submit">Generar y Enviar</Button>
                </div>
            </form>
        </div>
    );
};

const Notification = ({ message, type, onClose }) => {
    if (!message) return null;
    const baseClasses = "fixed top-5 right-5 p-4 rounded-lg shadow-lg flex items-center z-[100] border";
    const typeClasses = {
        success: "bg-green-100 border-green-400 text-green-700",
        error: "bg-red-100 border-red-400 text-red-700",
    };
    return (
        <div className={`${baseClasses} ${typeClasses[type]}`}>
            {type === 'success' ? <CheckCircle className="mr-3" /> : <XCircle className="mr-3" />}
            <span>{message}</span>
            <button onClick={onClose} className="ml-4 text-xl font-bold">&times;</button>
        </div>
    );
};

export function ClassDiagramEditor() {
  const [elements, setElements] = useState([]);
  const [history, setHistory] = useState([]);
  const [tool, setTool] = useState('select');
  const [scale, setScale] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  
  const [editingElement, setEditingElement] = useState(null);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  
  const [selectedElementId, setSelectedElementId] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({x: 0, y: 0});
  
  const [isDrawingLine, setIsDrawingLine] = useState(false);
  const [lineStart, setLineStart] = useState(null);
  const [linePreview, setLinePreview] = useState(null);
  const [pendingConnection, setPendingConnection] = useState(null);
  
  const canvasRef = useRef(null);
  const PADDING = 10;
  const LINE_HEIGHT = 18;
  const FONT = '13px Arial';

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => { setNotification({ show: false, message: '', type: '' }); }, 5000);
  };

  const saveStateToHistory = useCallback(() => {
    setHistory(prev => [...prev, elements]);
  }, [elements]);
  
  const calculateClassDimensions = useCallback((ctx, el) => {
      ctx.font = `bold ${FONT}`;
      const nameWidth = ctx.measureText(el.name).width;
      ctx.font = FONT;
      const attrWidths = el.attributes.map(a => ctx.measureText(`${VISIBILITY_MAP[a.visibility]} ${a.name}: ${a.type}`).width);
      const methodWidths = el.methods.map(m => ctx.measureText(`${VISIBILITY_MAP[m.visibility]} ${m.name}(): ${m.type}`).width);
      const maxWidth = Math.max(nameWidth, ...attrWidths, ...methodWidths, 150);
      const width = maxWidth + PADDING * 2;
      const nameHeight = LINE_HEIGHT * 1.5;
      const attrHeight = el.attributes.length * LINE_HEIGHT + PADDING;
      const methodHeight = el.methods.length * LINE_HEIGHT + PADDING;
      const height = nameHeight + attrHeight + methodHeight;
      return { width, height, nameHeight, attrHeight };
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.scale(scale, scale);
    const drawClass = (el) => {
        const dims = calculateClassDimensions(ctx, el);
        ctx.shadowColor = 'rgba(0,0,0,0.1)'; ctx.shadowBlur = 5; ctx.shadowOffsetX = 3; ctx.shadowOffsetY = 3;
        ctx.fillStyle = '#fffff0'; ctx.strokeStyle = '#4d515a'; ctx.lineWidth = 1.5;
        ctx.fillRect(el.x, el.y, dims.width, dims.height);
        ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;
        ctx.strokeRect(el.x, el.y, dims.width, dims.height);
        ctx.fillStyle = '#000000'; ctx.font = `bold ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(el.name, el.x + dims.width / 2, el.y + dims.nameHeight / 2);
        ctx.beginPath();
        ctx.moveTo(el.x, el.y + dims.nameHeight); ctx.lineTo(el.x + dims.width, el.y + dims.nameHeight);
        ctx.moveTo(el.x, el.y + dims.nameHeight + dims.attrHeight); ctx.lineTo(el.x + dims.width, el.y + dims.nameHeight + dims.attrHeight);
        ctx.stroke();
        ctx.font = FONT; ctx.textAlign = 'left';
        let currentY = el.y + dims.nameHeight + PADDING;
        el.attributes.forEach(a => { ctx.fillText(`${VISIBILITY_MAP[a.visibility]} ${a.name}: ${a.type}`, el.x + PADDING, currentY); currentY += LINE_HEIGHT; });
        currentY = el.y + dims.nameHeight + dims.attrHeight + PADDING;
        el.methods.forEach(m => { ctx.fillText(`${VISIBILITY_MAP[m.visibility]} ${m.name}(): ${m.type}`, el.x + PADDING, currentY); currentY += LINE_HEIGHT; });
    };
    const drawRelationship = (rel) => {
        const source = elements.find(e => e.id === rel.sourceId);
        const target = elements.find(e => e.id === rel.targetId);
        if (!source || !target) return;
        const sourceDims = calculateClassDimensions(ctx, source);
        const targetDims = calculateClassDimensions(ctx, target);
        const sPoints = [{x:source.x+sourceDims.width/2,y:source.y}, {x:source.x+sourceDims.width/2,y:source.y+sourceDims.height}, {x:source.x,y:source.y+sourceDims.height/2}, {x:source.x+sourceDims.width,y:source.y+sourceDims.height/2}];
        const tPoints = [{x:target.x+targetDims.width/2,y:target.y}, {x:target.x+targetDims.width/2,y:target.y+targetDims.height}, {x:target.x,y:target.y+targetDims.height/2}, {x:target.x+targetDims.width,y:target.y+targetDims.height/2}];
        let minD = Infinity, sp, ep;
        sPoints.forEach(p1 => tPoints.forEach(p2 => { const d = (p1.x-p2.x)**2 + (p1.y-p2.y)**2; if(d<minD) { minD=d; sp=p1; ep=p2; } }));
        ctx.strokeStyle = '#4d515a'; ctx.fillStyle = ctx.strokeStyle; ctx.lineWidth = 1.5;
        rel.relationshipType === RELATIONSHIP_TYPES.DEPENDENCY ? ctx.setLineDash([5, 5]) : ctx.setLineDash([]);
        ctx.beginPath(); ctx.moveTo(sp.x, sp.y); ctx.lineTo(ep.x, ep.y); ctx.stroke(); ctx.setLineDash([]);
        const angle = Math.atan2(ep.y - sp.y, ep.x - sp.x);
        if(rel.relationshipType === RELATIONSHIP_TYPES.INHERITANCE) {
            ctx.fillStyle = '#fffff0'; ctx.beginPath(); ctx.moveTo(ep.x, ep.y);
            ctx.lineTo(ep.x - 15 * Math.cos(angle - Math.PI / 8), ep.y - 15 * Math.sin(angle - Math.PI / 8));
            ctx.lineTo(ep.x - 15 * Math.cos(angle + Math.PI / 8), ep.y - 15 * Math.sin(angle + Math.PI / 8));
            ctx.closePath(); ctx.fill(); ctx.stroke();
        } else if (rel.relationshipType === RELATIONSHIP_TYPES.AGGREGATION || rel.relationshipType === RELATIONSHIP_TYPES.COMPOSITION) {
            ctx.save(); ctx.translate(sp.x, sp.y); ctx.rotate(angle + Math.PI);
            ctx.fillStyle = rel.relationshipType === RELATIONSHIP_TYPES.COMPOSITION ? '#4d515a' : '#fffff0';
            ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(10, 7); ctx.lineTo(20, 0); ctx.lineTo(10, -7);
            ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
        }
    };
    elements.forEach(el => { if(el.type === ELEMENT_TYPES.RELATIONSHIP) drawRelationship(el); });
    elements.forEach(el => { if(el.type === ELEMENT_TYPES.CLASS) drawClass(el); });
    if (isDrawingLine && lineStart && linePreview) {
        ctx.strokeStyle = '#dc2626'; ctx.lineWidth = 2; ctx.setLineDash([8, 4]);
        ctx.beginPath(); ctx.moveTo(lineStart.x, lineStart.y); ctx.lineTo(linePreview.x, linePreview.y); ctx.stroke(); ctx.setLineDash([]);
    }
    ctx.restore();
  }, [elements, scale, isDrawingLine, lineStart, linePreview, calculateClassDimensions]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const resizeObserver = new ResizeObserver(() => { if (!canvas) return; const container = canvas.parentElement; canvas.width = container.clientWidth; canvas.height = container.clientHeight; draw(); });
    resizeObserver.observe(canvas.parentElement); return () => resizeObserver.disconnect();
  }, [draw]);
  
  useEffect(draw, [draw]);
  
  const getMousePos = (e) => {
    const canvas = canvasRef.current; if (!canvas) return {x:0, y:0};
    const rect = canvas.getBoundingClientRect();
    return { x: (e.clientX - rect.left) / scale, y: (e.clientY - rect.top) / scale };
  };

  const getElementAtPos = useCallback((pos) => {
    const ctx = canvasRef.current.getContext('2d');
    return [...elements].reverse().find(el => {
        if (el.type !== ELEMENT_TYPES.CLASS) return false;
        const dims = calculateClassDimensions(ctx, el);
        return pos.x > el.x && pos.x < el.x + dims.width && pos.y > el.y && pos.y < el.y + dims.height;
    });
  }, [elements, calculateClassDimensions]);
  
  const handleAddOrUpdateClass = (classDetails) => {
      saveStateToHistory();
      const existing = elements.find(el => el.id === editingElement.id);
      if (existing) {
          setElements(elements.map(el => el.id === editingElement.id ? { ...el, ...classDetails } : el));
      } else {
          setElements([...elements, { ...editingElement, ...classDetails }]);
      }
      setEditingElement(null);
  };
  
  const createConnection = (type) => {
      if (!pendingConnection) return;
      saveStateToHistory();
      const newRel = { id: Date.now(), type: ELEMENT_TYPES.RELATIONSHIP, ...pendingConnection, relationshipType: type };
      setElements(prev => [...prev, newRel]);
      setPendingConnection(null);
  }

  const handleMouseDown = (e) => {
    const pos = getMousePos(e.nativeEvent);
    const target = getElementAtPos(pos);
    if (tool === 'select' && target) {
        saveStateToHistory(); setIsDragging(true); setSelectedElementId(target.id);
        setDragOffset({ x: pos.x - target.x, y: pos.y - target.y });
    } else if (tool === ELEMENT_TYPES.RELATIONSHIP && target) {
        setIsDrawingLine(true); setLineStart({x: pos.x, y: pos.y, sourceId: target.id});
    }
  };
  const handleMouseMove = (e) => {
    const pos = getMousePos(e.nativeEvent);
    if (isDragging && selectedElementId) {
        setElements(prev => prev.map(el => el.id === selectedElementId ? {...el, x: pos.x - dragOffset.x, y: pos.y - dragOffset.y} : el));
    }
    if (isDrawingLine) { setLinePreview({x: pos.x, y: pos.y}); }
  };
  const handleMouseUp = (e) => {
    if(isDrawingLine && lineStart) {
        const pos = getMousePos(e.nativeEvent);
        const target = getElementAtPos(pos);
        if(target && target.id !== lineStart.sourceId) {
            setPendingConnection({ sourceId: lineStart.sourceId, targetId: target.id });
        }
    }
    setIsDragging(false); setSelectedElementId(null);
    setIsDrawingLine(false); setLineStart(null); setLinePreview(null);
  };
  
  const handleDragOver = (e) => { e.preventDefault(); };
  const handleDrop = (e) => {
    e.preventDefault();
    const type = e.dataTransfer.getData(DATA_TRANSFER_TYPE);
    if(type === ELEMENT_TYPES.CLASS) {
        const pos = getMousePos(e);
        const newClass = { id: Date.now(), type: ELEMENT_TYPES.CLASS, x: pos.x, y: pos.y, name: `Clase${elements.filter(e=>e.type === ELEMENT_TYPES.CLASS).length+1}`, attributes: [], methods: [] };
        setEditingElement(newClass);
    }
  };
  
  const handleDoubleClick = (e) => {
      const pos = getMousePos(e.nativeEvent);
      const target = getElementAtPos(pos);
      if(target) {
          setEditingElement(target);
      }
  };

  const handleGenerateAndSend = async (projectName, packageName) => {
    setIsLoading(true); setIsGenerateModalOpen(false);
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
        showNotification("La API Key de Gemini no está configurada en .env.local", "error");
        setIsLoading(false);
        return;
    }
    await new Promise(resolve => setTimeout(resolve, 100));
    const canvas = canvasRef.current; if (!canvas) return; 
    const dataUrl = canvas.toDataURL('image/png'); const base64ImageData = dataUrl.split(',')[1];
    
    const promptText = `Analiza la imagen de un diagrama de Clases UML. Cada rectángulo con compartimentos es una clase. La sección superior es el nombre, la del medio los atributos y la inferior los métodos. Las líneas con diferentes puntas son relaciones (Herencia, Composición, Agregación, Dependencia). Convierte esto a la estructura JSON solicitada. Interpreta la visibilidad: + es public, - es private, # es protected.`;
    const schema = { type: "ARRAY", items: { type: "OBJECT", properties: { projectName: { type: "STRING" }, package: { type: "ARRAY", items: { type: "OBJECT", properties: { packageName: { type: "STRING" }, classes: { type: "ARRAY", items: { type: "OBJECT", properties: { className: { type: "STRING" }, isEntity: { type: "BOOLEAN" }, fields: { type: "ARRAY", items: { type: "OBJECT", properties: { name: { type: "STRING" }, type: { type: "STRING" }, isIdField: { type: "BOOLEAN" }, generationStrategy: { type: "STRING" } }, required: ["name", "type"] } }, relationships: { type: "ARRAY", items: { type: "OBJECT", properties: { type: { type: "STRING" }, mappedBy: { type: "STRING" }, cascade: { type: "ARRAY", items: { type: "STRING" } }, fetch: { type: "STRING" } }, required: ["type", "mappedBy", "cascade", "fetch"] } } }, required: ["className", "isEntity"] } } }, required: ["packageName", "classes"], propertyOrdering: ["packageName", "classes"] } }, class: { type: "OBJECT", properties: { className: { type: "STRING" }, isEntity: { type: "BOOLEAN" }, fields: { type: "ARRAY", items: { type: "OBJECT", properties: { name: { type: "STRING" }, type: { type: "STRING" } }, required: ["name", "type"] } } } } }, required: ["projectName"] } };
    const payload = { contents: [{ role: "user", parts: [{ text: promptText }, { inlineData: { mimeType: "image/png", data: base64ImageData } }] }], generationConfig: { responseMimeType: "application/json", responseSchema: schema } };
    
    try {
        const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
        const geminiResponse = await fetch(geminiApiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (!geminiResponse.ok) { const errorBody = await geminiResponse.json(); throw new Error(`Error en la API de Gemini: ${geminiResponse.status} - ${errorBody.error.message}`); }
        const result = await geminiResponse.json();
        if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
            const jsonText = result.candidates[0].content.parts[0].text;
            let parsedJson = JSON.parse(jsonText);
            if (Array.isArray(parsedJson) && parsedJson.length > 0) {
              parsedJson[0].projectName = projectName;
              if (parsedJson[0].package && Array.isArray(parsedJson[0].package) && parsedJson[0].package.length > 0) {
                parsedJson[0].package[0].packageName = packageName;
              }
            }
            const backendEndpoint = '/api/generate';
            const backendResponse = await fetch(backendEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(parsedJson) });
            if (!backendResponse.ok) { throw new Error(`Error en el backend: ${backendResponse.status} - ${await backendResponse.text()}`); }
            showNotification('¡Diagrama enviado al backend con éxito!', 'success');
        } else { throw new Error("La respuesta de la API de Gemini no tuvo el formato esperado."); }
    } catch (error) { 
        console.error("Error en el proceso:", error);
        showNotification(error.message, 'error');
    } 
    finally { setIsLoading(false); }
  };

  const clearCanvas = () => { saveStateToHistory(); setElements([]); };
  const handleUndo = () => {
    if (history.length > 0) {
      const previousState = history[history.length - 1];
      setElements(previousState);
      setHistory(history.slice(0, -1));
    }
  };
  
  return (
    <div className="flex h-full">
      <ClassDiagramSidebar />
      <div className="flex-grow h-full flex flex-col">
        <div className="bg-white border-b p-2 flex items-center justify-between z-10 shadow-sm">
            <div className="flex items-center space-x-2">
                <Button variant={tool === 'select' ? 'secondary' : 'ghost'} size="icon" onClick={() => setTool('select')} title="Seleccionar y Mover (V)"><MousePointer className="h-4 w-4" /></Button>
                <Button variant={tool === ELEMENT_TYPES.RELATIONSHIP ? 'secondary' : 'ghost'} size="icon" onClick={() => setTool(ELEMENT_TYPES.RELATIONSHIP)} title="Crear Relación (L)"><Share2 className="h-4 w-4" /></Button>
                <Button variant="outline" size="icon" onClick={handleUndo} title="Deshacer (Ctrl+Z)" disabled={history.length === 0}><Undo2 className="h-4 w-4" /></Button>
            </div>
            <div className="flex items-center space-x-2">
                <Button variant="outline" size="icon" onClick={() => setScale(s => Math.max(s - 0.1, 0.5))} title="Alejar"><ZoomOut className="h-4 w-4" /></Button>
                <span className="text-sm w-16 text-center">{Math.round(scale * 100)}%</span>
                <Button variant="outline" size="icon" onClick={() => setScale(s => Math.min(s + 0.1, 2))} title="Acercar"><ZoomIn className="h-4 w-4" /></Button>
            </div>
            <div className="flex items-center space-x-2">
                <Button size="sm" className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white" onClick={() => setIsGenerateModalOpen(true)} disabled={isLoading}>
                    <BrainCircuit className="h-4 w-4" />
                    {isLoading ? 'Generando y Enviando...' : 'Generar y Enviar'}
                </Button>
                <Button onClick={clearCanvas} variant="destructive" size="sm" className="flex items-center gap-1" title="Limpiar diagrama">
                    <Trash2 className="h-4 w-4" />
                    Limpiar
                </Button>
            </div>
        </div>
        <div className="flex-grow bg-gray-50 relative overflow-hidden" onDragOver={handleDragOver} onDrop={handleDrop}>
          <canvas ref={canvasRef} className="absolute top-0 left-0" onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} onDoubleClick={handleDoubleClick} style={{ cursor: tool === 'select' ? (isDragging ? 'grabbing' : 'grab') : (isDrawingLine ? 'crosshair' : 'default') }} />
        </div>
      </div>
       {editingElement && <ClassEditModal onSubmit={handleAddOrUpdateClass} onCancel={() => setEditingElement(null)} classData={editingElement} />}
       {pendingConnection && <RelationshipTypeModal onSubmit={createConnection} onCancel={() => setPendingConnection(null)} />}
       {isGenerateModalOpen && <GenerateModal onSubmit={handleGenerateAndSend} onCancel={() => setIsGenerateModalOpen(false)} />}
       {notification.show && <Notification message={notification.message} type={notification.type} onClose={() => setNotification({ show: false, message: '', type: '' })} />}
    </div>
  )
}
