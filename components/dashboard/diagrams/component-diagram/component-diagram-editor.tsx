"use client"

import React, { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Layers, BrainCircuit, Trash2, ZoomIn, ZoomOut, MousePointer, MoveRight, Undo2, CheckCircle, XCircle } from "lucide-react"
import { ComponentDiagramSidebar } from "./component-diagram-sidebar"

// --- Constantes y Tipos ---
const ELEMENT_TYPES = { 
    COMPONENT: 'COMPONENT',
    PORT: 'PORT',
    CONNECTION: 'CONNECTION'
};
const CONNECTION_TYPES = {
    ASSOCIATION: 'ASSOCIATION', // Línea sólida
    DEPENDENCY: 'DEPENDENCY',   // Línea punteada
    INTERFACE: 'INTERFACE'      // Línea con círculo (lollipop)
};
const DATA_TRANSFER_TYPE = "application/component-diagram-object";

// --- Componentes Modales y de Notificación ---
const InputModal = ({ onSubmit, onCancel, title, placeholder, buttonText }) => {
    const [text, setText] = useState('');
    const inputRef = useRef(null);
    useEffect(() => { inputRef.current?.focus(); }, []);
    const handleSubmit = (e) => { e.preventDefault(); onSubmit(text.trim()); };
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-xl w-96">
                <h3 className="text-lg font-bold mb-4">{title}</h3>
                <input ref={inputRef} type="text" value={text} onChange={(e) => setText(e.target.value)} className="border border-gray-300 p-2 rounded-md w-full mb-4 focus:ring-2 focus:ring-blue-500 outline-none" placeholder={placeholder} />
                <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
                    <Button type="submit">{buttonText}</Button>
                </div>
            </form>
        </div>
    );
};

const ConnectionTypeModal = ({ onSubmit, onCancel }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-96">
                <h3 className="text-lg font-bold mb-4">Tipo de Conexión</h3>
                <div className="grid grid-cols-1 gap-4">
                    <button onClick={() => onSubmit(CONNECTION_TYPES.ASSOCIATION)} className="w-full text-left p-3 bg-gray-100 hover:bg-gray-200 rounded-md">Asociación (Línea Sólida)</button>
                    <button onClick={() => onSubmit(CONNECTION_TYPES.DEPENDENCY)} className="w-full text-left p-3 bg-gray-100 hover:bg-gray-200 rounded-md">Dependencia (Línea Punteada)</button>
                    <button onClick={() => onSubmit(CONNECTION_TYPES.INTERFACE)} className="w-full text-left p-3 bg-gray-100 hover:bg-gray-200 rounded-md">Interfaz (Lollipop)</button>
                </div>
                 <div className="flex justify-end mt-6">
                    <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
                </div>
            </div>
        </div>
    )
}

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
                    <input type="text" value={projectName} onChange={(e) => setProjectName(e.target.value)} className="border border-gray-300 p-2 rounded-md w-full" placeholder="MiSistemaDeComponentes" />
                </div>
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Paquete Principal</label>
                    <input type="text" value={packageName} onChange={(e) => setPackageName(e.target.value)} className="border border-gray-300 p-2 rounded-md w-full" placeholder="com.miempresa.sistema" />
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


export function ComponentDiagramEditor() {
  const [elements, setElements] = useState([]);
  const [history, setHistory] = useState([]);
  const [tool, setTool] = useState('select');
  const [scale, setScale] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  
  const [newElementInfo, setNewElementInfo] = useState(null);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  
  const [selectedElementId, setSelectedElementId] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({x: 0, y: 0});
  
  const [isDrawingLine, setIsDrawingLine] = useState(false);
  const [lineStart, setLineStart] = useState(null);
  const [linePreview, setLinePreview] = useState(null);
  const [pendingConnection, setPendingConnection] = useState(null);
  const [connectionText, setConnectionText] = useState(null);

  const canvasRef = useRef(null);
  const PORT_SIZE = 8;

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => { setNotification({ show: false, message: '', type: '' }); }, 5000);
  };

  const saveStateToHistory = useCallback(() => {
    setHistory(prev => [...prev, elements]);
  }, [elements]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.scale(scale, scale);

    const drawComponent = (el) => {
        ctx.fillStyle = '#fefce8'; ctx.strokeStyle = '#a16207';
        ctx.lineWidth = 2;
        ctx.fillRect(el.x, el.y, el.width, el.height); ctx.strokeRect(el.x, el.y, el.width, el.height);
        ctx.strokeRect(el.x + 10, el.y + 7, 30, 15); ctx.strokeRect(el.x + 5, el.y + 10, 10, 5); ctx.strokeRect(el.x + 5, el.y + 19, 10, 5);
        ctx.fillStyle = '#a16207'; ctx.font = 'bold 14px Arial'; ctx.textAlign = 'center';
        ctx.fillText(el.name, el.x + el.width / 2, el.y + el.height - 15);
    };

    const drawPort = (port) => {
        ctx.fillStyle = '#ffffff'; ctx.strokeStyle = '#4338ca'; ctx.lineWidth = 1.5;
        ctx.fillRect(port.x - PORT_SIZE / 2, port.y - PORT_SIZE / 2, PORT_SIZE, PORT_SIZE);
        ctx.strokeRect(port.x - PORT_SIZE / 2, port.y - PORT_SIZE / 2, PORT_SIZE, PORT_SIZE);
    };

    const drawConnection = (conn) => {
        const sourcePort = elements.flatMap(e => e.ports || []).find(p => p.id === conn.sourceId);
        const targetPort = elements.flatMap(e => e.ports || []).find(p => p.id === conn.targetId);
        if (!sourcePort || !targetPort) return;
        
        ctx.strokeStyle = '#4338ca'; ctx.lineWidth = 1.5;
        
        if(conn.connectionType === CONNECTION_TYPES.DEPENDENCY) {
            ctx.setLineDash([8, 4]);
        } else {
            ctx.setLineDash([]);
        }

        ctx.beginPath(); ctx.moveTo(sourcePort.x, sourcePort.y); ctx.lineTo(targetPort.x, targetPort.y);
        ctx.stroke();
        ctx.setLineDash([]);

        if(conn.connectionType === CONNECTION_TYPES.INTERFACE) {
            ctx.beginPath();
            ctx.arc(targetPort.x, targetPort.y, 10, 0, 2 * Math.PI);
            ctx.stroke();
        }
        
        if (conn.text) {
             ctx.fillStyle = '#4338ca'; ctx.font = 'italic 12px Arial'; ctx.textAlign = 'center';
             const midX = (sourcePort.x + targetPort.x) / 2;
             const midY = (sourcePort.y + targetPort.y) / 2;
             ctx.fillText(conn.text, midX, midY - 8);
        }
    };
    
    elements.forEach(el => { if (el.type === ELEMENT_TYPES.CONNECTION) drawConnection(el); });
    elements.forEach(el => {
        if (el.type === ELEMENT_TYPES.COMPONENT) {
            drawComponent(el);
            (el.ports || []).forEach(port => drawPort(port));
        }
    });
    
    if (isDrawingLine && lineStart && linePreview) {
        ctx.strokeStyle = '#dc2626'; ctx.lineWidth = 2; ctx.setLineDash([8, 4]);
        ctx.beginPath(); ctx.moveTo(lineStart.x, lineStart.y);
        ctx.lineTo(linePreview.x, linePreview.y); ctx.stroke();
        ctx.setLineDash([]);
    }

    ctx.restore();
  }, [elements, scale, isDrawingLine, lineStart, linePreview]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resizeObserver = new ResizeObserver(() => {
        if (!canvas) return; const container = canvas.parentElement;
        canvas.width = container.clientWidth; canvas.height = container.clientHeight; draw();
    });
    resizeObserver.observe(canvas.parentElement); return () => resizeObserver.disconnect();
  }, [draw]);
  
  useEffect(draw, [draw]);
  
  const getMousePos = (e) => {
    const canvas = canvasRef.current; if (!canvas) return {x:0, y:0};
    const rect = canvas.getBoundingClientRect();
    return { x: (e.clientX - rect.left) / scale, y: (e.clientY - rect.top) / scale };
  };
  
  const getElementAtPos = (pos) => {
    const allPorts = elements.flatMap(e => e.ports || []);
    const port = allPorts.find(p => Math.abs(p.x - pos.x) < PORT_SIZE && Math.abs(p.y - pos.y) < PORT_SIZE);
    if (port) return port;
    return [...elements].reverse().find(el => el.type === ELEMENT_TYPES.COMPONENT && pos.x > el.x && pos.x < el.x + el.width && pos.y > el.y && pos.y < el.y + el.height);
  };

  const handleMouseDown = (e) => {
    const pos = getMousePos(e.nativeEvent);
    const target = getElementAtPos(pos);

    if (tool === 'select' && target?.type === ELEMENT_TYPES.COMPONENT) {
        saveStateToHistory(); setIsDragging(true); setSelectedElementId(target.id);
        setDragOffset({ x: pos.x - target.x, y: pos.y - target.y });
    } else if (tool === ELEMENT_TYPES.CONNECTION && target?.type === ELEMENT_TYPES.PORT) {
        setIsDrawingLine(true); setLineStart({ x: target.x, y: target.y, sourceId: target.id });
    }
  };
  const handleMouseMove = (e) => {
    const pos = getMousePos(e.nativeEvent);
    if (isDragging && selectedElementId) {
        const dx = pos.x - dragOffset.x;
        const dy = pos.y - dragOffset.y;
        setElements(prev => prev.map(el => {
            if (el.id === selectedElementId) {
                const portDx = dx - el.x;
                const portDy = dy - el.y;
                return { ...el, x: dx, y: dy, ports: el.ports.map(p => ({...p, x: p.x + portDx, y: p.y + portDy})) };
            }
            return el;
        }));
    }
    if (isDrawingLine) { setLinePreview({x: pos.x, y: pos.y}); }
  };
  const handleMouseUp = (e) => {
    if(isDrawingLine && lineStart) {
        const pos = getMousePos(e.nativeEvent);
        const target = getElementAtPos(pos);
        if(target?.type === ELEMENT_TYPES.PORT && target.id !== lineStart.sourceId) {
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
    const pos = getMousePos(e);
    if(type === ELEMENT_TYPES.COMPONENT) {
      setNewElementInfo({ type, x: pos.x, y: pos.y });
    }
  };
  
  const handleAddElement = (name) => {
      if (!newElementInfo) return; saveStateToHistory();
      const { type, x, y } = newElementInfo;
      const newId = Date.now();
      const newComponent = {
          id: newId, type, name, x, y, width: 150, height: 100,
          ports: [
              { id: newId + 1, parentId: newId, type: ELEMENT_TYPES.PORT, x: x, y: y + 50 },
              { id: newId + 2, parentId: newId, type: ELEMENT_TYPES.PORT, x: x + 150, y: y + 50 },
          ]
      };
      setElements(prev => [...prev, newComponent]);
      setNewElementInfo(null);
  }

  const createConnection = (type) => {
      if (!pendingConnection) return;
      saveStateToHistory();
      setConnectionText({ connection: { ...pendingConnection, connectionType: type }, callback: (text) => addConnection(text) });
      setPendingConnection(null);
  }

  const addConnection = (text) => {
      const { connection } = connectionText;
      const newConnection = { id: Date.now(), type: ELEMENT_TYPES.CONNECTION, ...connection, text };
      setElements(prev => [...prev, newConnection]);
      setConnectionText(null);
  }

  const clearCanvas = () => {
      saveStateToHistory();
      setElements([]);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    setElements(history[history.length - 1]);
    setHistory(history.slice(0, -1));
  };
  
  const handleGenerateAndSend = async (projectName, packageName) => {
    setIsLoading(true); setIsGenerateModalOpen(false);
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
        showNotification("API Key de Gemini no configurada en .env.local", "error");
        setIsLoading(false);
        return;
    }
    await new Promise(resolve => setTimeout(resolve, 100));
    const canvas = canvasRef.current; if (!canvas) return; 
    const dataUrl = canvas.toDataURL('image/png'); const base64ImageData = dataUrl.split(',')[1];
    
    const promptText = `Analiza la imagen de un diagrama de Componentes UML y genera un JSON que represente su estructura de clases. Reglas: 1. Cada 'Componente' (rectángulo grande) debe ser una clase ('className'). 2. Las conexiones entre componentes indican relaciones. Infiere el tipo de relación (OneToMany, ManyToOne, etc.) y los campos necesarios. 3. Los puertos son importantes para las conexiones; su presencia implica interfaces o puntos de conexión. 4. Infiere 'isEntity', campos y sus tipos basándote en los nombres de los componentes. El objetivo es mapear el diagrama a la estructura de clases JSON proporcionada.`;
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

  const getModalInfoForNewElement = () => {
    if (!newElementInfo) return null;
    return { title: "Nombre del Componente", placeholder: "Ej: Gestor de Pedidos", buttonText: "Crear Componente" };
  };
  const modalInfo = getModalInfoForNewElement();

  return (
    <div className="flex h-full">
      <ComponentDiagramSidebar />
      <div className="flex-grow h-full flex flex-col">
        {/* Toolbar */}
        <div className="bg-white border-b p-2 flex items-center justify-between z-10 shadow-sm">
            <div className="flex items-center space-x-2">
                <Button variant={tool === 'select' ? 'secondary' : 'ghost'} size="icon" onClick={() => setTool('select')} title="Seleccionar y Mover (V)"><MousePointer className="h-4 w-4" /></Button>
                <Button variant={tool === ELEMENT_TYPES.CONNECTION ? 'secondary' : 'ghost'} size="icon" onClick={() => setTool(ELEMENT_TYPES.CONNECTION)} title="Crear Conexión (L)"><MoveRight className="h-4 w-4" /></Button>
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
        {/* Canvas */}
        <div className="flex-grow bg-gray-50 relative overflow-hidden" onDragOver={handleDragOver} onDrop={handleDrop}>
          <canvas ref={canvasRef} className="absolute top-0 left-0" onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} style={{ cursor: tool === 'select' ? (isDragging ? 'grabbing' : 'grab') : (isDrawingLine ? 'crosshair' : 'default') }} />
        </div>
      </div>
       {modalInfo && <InputModal onSubmit={handleAddElement} onCancel={() => setNewElementInfo(null)} {...modalInfo} />}
       {pendingConnection && <ConnectionTypeModal onSubmit={createConnection} onCancel={() => setPendingConnection(null)} />}
       {connectionText && <InputModal onSubmit={addConnection} onCancel={() => setConnectionText(null)} title="Texto de la Conexión (Opcional)" placeholder="Ej: <<usa>>" buttonText="Añadir" />}
       {isGenerateModalOpen && <GenerateModal onSubmit={handleGenerateAndSend} onCancel={() => setIsGenerateModalOpen(false)} />}
       {notification.show && <Notification message={notification.message} type={notification.type} onClose={() => setNotification({ show: false, message: '', type: '' })} />}
    </div>
  )
}
