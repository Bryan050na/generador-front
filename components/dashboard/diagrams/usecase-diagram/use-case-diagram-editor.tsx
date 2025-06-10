"use client"

import React, { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { BrainCircuit, Trash2, ZoomIn, ZoomOut, MousePointer, MoveRight, Undo2, CheckCircle, XCircle } from "lucide-react"
import { UseCaseDiagramSidebar } from "./use-case-diagram-sidebar"

// --- Constantes y Tipos ---
const ELEMENT_TYPES = { 
    ACTOR: 'ACTOR', 
    USE_CASE: 'USE_CASE',
    SYSTEM_BOUNDARY: 'SYSTEM_BOUNDARY',
    RELATIONSHIP: 'RELATIONSHIP'
};
const DATA_TRANSFER_TYPE = "application/use-case-diagram-object";

// --- Componentes Modales y de Notificación ---
const InputModal = ({ onSubmit, onCancel, title, placeholder, buttonText }) => {
    const [text, setText] = useState('');
    const inputRef = useRef(null);
    useEffect(() => { inputRef.current?.focus(); }, []);
    const handleSubmit = (e) => { e.preventDefault(); if (text.trim()) { onSubmit(text.trim()); } };
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

const GenerateModal = ({ onSubmit, onCancel }) => {
    const [projectName, setProjectName] = useState('');
    const [packageName, setPackageName] = useState('');
    const handleSubmit = (e) => {
        e.preventDefault();
        if (projectName.trim() && packageName.trim()) { onSubmit(projectName.trim(), packageName.trim()); }
    };
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-xl w-96">
                <h3 className="text-lg font-bold mb-4">Detalles del Proyecto</h3>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Proyecto</label>
                    <input type="text" value={projectName} onChange={(e) => setProjectName(e.target.value)} className="border border-gray-300 p-2 rounded-md w-full" placeholder="MiRestauranteApp" />
                </div>
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Paquete Principal</label>
                    <input type="text" value={packageName} onChange={(e) => setPackageName(e.target.value)} className="border border-gray-300 p-2 rounded-md w-full" placeholder="com.miempresa.restaurante" />
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


export function UseCaseDiagramEditor() {
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

  const canvasRef = useRef(null);
  const USE_CASE_RX = 80;
  const USE_CASE_RY = 30;

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

    const drawActor = (el) => {
        ctx.strokeStyle = '#1A202C'; ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(el.x, el.y - 15, 10, 0, Math.PI * 2);
        ctx.moveTo(el.x, el.y - 5); ctx.lineTo(el.x, el.y + 15);
        ctx.moveTo(el.x - 15, el.y + 5); ctx.lineTo(el.x + 15, el.y + 5);
        ctx.moveTo(el.x, el.y + 15); ctx.lineTo(el.x - 10, el.y + 30);
        ctx.moveTo(el.x, el.y + 15); ctx.lineTo(el.x + 10, el.y + 30);
        ctx.stroke();
        ctx.fillStyle = '#1A202C'; ctx.font = 'bold 14px Arial'; ctx.textAlign = 'center';
        ctx.fillText(el.name, el.x, el.y + 45);
    };

    const drawUseCase = (el) => {
        ctx.strokeStyle = '#1A202C'; ctx.lineWidth = 2; ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.ellipse(el.x, el.y, USE_CASE_RX, USE_CASE_RY, 0, 0, 2 * Math.PI);
        ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#1A202C'; ctx.font = '14px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(el.name, el.x, el.y);
    };

    const drawSystemBoundary = (el) => {
        ctx.strokeStyle = '#4A5568'; ctx.lineWidth = 2; ctx.setLineDash([8, 4]);
        ctx.strokeRect(el.x, el.y, el.width, el.height);
        ctx.setLineDash([]);
        ctx.fillStyle = '#4A5568'; ctx.font = 'bold 16px Arial'; ctx.textAlign = 'left';
        ctx.fillText(el.name, el.x + 10, el.y + 20);
    };

    const drawRelationship = (el) => {
        const source = elements.find(e => e.id === el.sourceId);
        const target = elements.find(e => e.id === el.targetId);
        if (!source || !target) return;
        ctx.strokeStyle = '#2D3748'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(source.x, source.y); ctx.lineTo(target.x, target.y);
        ctx.stroke();
    };

    elements.forEach(el => { if (el.type === ELEMENT_TYPES.SYSTEM_BOUNDARY) drawSystemBoundary(el); });
    elements.forEach(el => { if (el.type === ELEMENT_TYPES.RELATIONSHIP) drawRelationship(el); });
    elements.forEach(el => {
        if (el.type === ELEMENT_TYPES.ACTOR) drawActor(el);
        if (el.type === ELEMENT_TYPES.USE_CASE) drawUseCase(el);
    });
    
    if(isDrawingLine && lineStart && linePreview) {
        ctx.strokeStyle = '#F56565'; ctx.lineWidth = 2; ctx.setLineDash([8, 4]);
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
    return [...elements].reverse().find(el => {
        if (el.type === ELEMENT_TYPES.ACTOR) return Math.sqrt((pos.x - el.x) ** 2 + (pos.y - (el.y + 5)) ** 2) < 35;
        if (el.type === ELEMENT_TYPES.USE_CASE) return ((pos.x - el.x) ** 2 / USE_CASE_RX ** 2) + ((pos.y - el.y) ** 2 / USE_CASE_RY ** 2) <= 1;
        if(el.type === ELEMENT_TYPES.SYSTEM_BOUNDARY) return pos.x > el.x && pos.x < el.x + el.width && pos.y > el.y && pos.y < el.y + el.height;
        return false;
    });
  };

  const handleMouseDown = (e) => {
    const pos = getMousePos(e.nativeEvent);
    const targetElement = getElementAtPos(pos);
    if (tool === 'select' && targetElement) {
        saveStateToHistory(); setIsDragging(true); setSelectedElementId(targetElement.id);
        setDragOffset({ x: pos.x - targetElement.x, y: pos.y - targetElement.y });
    } else if (tool === ELEMENT_TYPES.RELATIONSHIP && targetElement) {
        setIsDrawingLine(true); setLineStart({x: pos.x, y: pos.y, sourceId: targetElement.id});
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
        const targetElement = getElementAtPos(pos);
        if(targetElement && targetElement.id !== lineStart.sourceId) {
            saveStateToHistory();
            const newRelationship = { id: Date.now(), type: ELEMENT_TYPES.RELATIONSHIP, sourceId: lineStart.sourceId, targetId: targetElement.id };
            setElements(prev => [...prev, newRelationship]);
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
    if(type) {
      setNewElementInfo({ type, x: pos.x, y: pos.y });
    }
  };
  
  const handleAddElement = (name) => {
      if (!newElementInfo) return; saveStateToHistory();
      const { type, x, y } = newElementInfo;
      let newEl = { id: Date.now(), type, name, x, y };
      if (type === ELEMENT_TYPES.SYSTEM_BOUNDARY) { newEl = { ...newEl, width: 400, height: 500 }; }
      setElements(prev => [...prev, newEl]);
      setNewElementInfo(null);
  }

  const clearCanvas = () => { if(window.confirm("¿Seguro que quieres limpiar todo el diagrama?")){ saveStateToHistory(); setElements([]); }};
  const handleUndo = () => {
    if (history.length === 0) return;
    setElements(history[history.length - 1]);
    setHistory(history.slice(0, -1));
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
    
    const promptText = `Analiza la imagen de un diagrama de Casos de Uso UML y genera un JSON que represente su estructura de clases. Reglas: 1. Los 'Actores' (figuras de palitos) y los 'Casos de Uso' (elipses) deben ser tratados como si fueran clases ('className'). 2. Las líneas que conectan un Actor a un Caso de Uso representan una relación. 3. El rectángulo grande representa el sistema y su nombre debe ser el 'projectName' si no se proporciona otro. 4. Infiere 'isEntity', campos y tipos de relación basándote en los nombres y conexiones. El objetivo es mapear el diagrama de casos de uso a la estructura de clases JSON proporcionada.`;
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
    const { type } = newElementInfo;
    switch(type) {
        case ELEMENT_TYPES.ACTOR: return { title: "Nombre del Actor", placeholder: "Ej: Cliente", buttonText: "Crear Actor" };
        case ELEMENT_TYPES.USE_CASE: return { title: "Nombre del Caso de Uso", placeholder: "Ej: Realizar Pedido", buttonText: "Crear Caso" };
        case ELEMENT_TYPES.SYSTEM_BOUNDARY: return { title: "Nombre del Sistema", placeholder: "Ej: Sistema de Ventas", buttonText: "Crear Sistema" };
        default: return null;
    }
  };
  const modalInfo = getModalInfoForNewElement();

  return (
    <div className="flex h-full">
      <UseCaseDiagramSidebar />
      <div className="flex-grow h-full flex flex-col">
        {/* Toolbar */}
        <div className="bg-white border-b p-2 flex items-center justify-between z-10 shadow-sm">
            <div className="flex items-center space-x-2">
                <Button variant={tool === 'select' ? 'secondary' : 'ghost'} size="icon" onClick={() => setTool('select')} title="Seleccionar y Mover (V)"><MousePointer className="h-4 w-4" /></Button>
                <Button variant={tool === ELEMENT_TYPES.RELATIONSHIP ? 'secondary' : 'ghost'} size="icon" onClick={() => setTool(ELEMENT_TYPES.RELATIONSHIP)} title="Crear Relación (L)"><MoveRight className="h-4 w-4" /></Button>
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
       {isGenerateModalOpen && <GenerateModal onSubmit={handleGenerateAndSend} onCancel={() => setIsGenerateModalOpen(false)} />}
       {notification.show && <Notification message={notification.message} type={notification.type} onClose={() => setNotification({ show: false, message: '', type: '' })} />}
    </div>
  )
}
