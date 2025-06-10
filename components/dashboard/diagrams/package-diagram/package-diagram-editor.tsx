"use client"

import React, { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Package, BrainCircuit, Trash2, ZoomIn, ZoomOut, MousePointer, MoveRight, Undo2, CheckCircle, XCircle } from "lucide-react"
import { PackageDiagramSidebar } from "./package-diagram-sidebar"

// --- Constantes y Tipos ---
const ELEMENT_TYPES = { 
    PACKAGE: 'PACKAGE',
    DEPENDENCY: 'DEPENDENCY'
};
const DATA_TRANSFER_TYPE = "application/package-diagram-object";

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
    const handleSubmit = (e) => { e.preventDefault(); if (projectName.trim() && packageName.trim()) { onSubmit(projectName.trim(), packageName.trim()); } };
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-xl w-96">
                <h3 className="text-lg font-bold mb-4">Detalles del Proyecto</h3>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Proyecto</label>
                    <input type="text" value={projectName} onChange={(e) => setProjectName(e.target.value)} className="border border-gray-300 p-2 rounded-md w-full" placeholder="MiGranSistema" />
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

export function PackageDiagramEditor() {
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

    const drawPackage = (el) => {
        const tabHeight = 25;
        const tabWidth = el.width * 0.4;
        ctx.fillStyle = '#bae6fd'; ctx.strokeStyle = '#0369a1'; ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(el.x, el.y + tabHeight); ctx.lineTo(el.x, el.y + el.height);
        ctx.lineTo(el.x + el.width, el.y + el.height); ctx.lineTo(el.x + el.width, el.y + tabHeight);
        ctx.stroke(); ctx.fill();
        ctx.beginPath();
        ctx.moveTo(el.x, el.y + tabHeight); ctx.lineTo(el.x, el.y);
        ctx.lineTo(el.x + tabWidth, el.y); ctx.lineTo(el.x + tabWidth, el.y + tabHeight);
        ctx.closePath(); ctx.stroke(); ctx.fill();
        ctx.fillStyle = '#0c4a6e'; ctx.font = 'bold 14px Arial'; ctx.textAlign = 'center';
        ctx.fillText(el.name, el.x + el.width / 2, el.y + el.height / 2 + tabHeight / 2);
    };
    
    const drawDependency = (dep) => {
        const source = elements.find(e => e.id === dep.sourceId);
        const target = elements.find(e => e.id === dep.targetId);
        if (!source || !target) return;
        const points = [
            { x: source.x + source.width / 2, y: source.y }, { x: source.x + source.width / 2, y: source.y + source.height },
            { x: source.x, y: source.y + source.height / 2 }, { x: source.x + source.width, y: source.y + source.height / 2 },
        ];
        const targetPoints = [
            { x: target.x + target.width / 2, y: target.y }, { x: target.x + target.width / 2, y: target.y + target.height },
            { x: target.x, y: target.y + target.height / 2 }, { x: target.x + target.width, y: target.y + target.height / 2 },
        ];
        let minDistance = Infinity; let startPoint, endPoint;
        for (const p1 of points) { for (const p2 of targetPoints) {
            const d = Math.sqrt((p1.x - p2.x)**2 + (p1.y - p2.y)**2);
            if (d < minDistance) { minDistance = d; startPoint = p1; endPoint = p2; }
        }}
        ctx.strokeStyle = '#7c3aed'; ctx.lineWidth = 1.5; ctx.setLineDash([8, 4]);
        ctx.beginPath(); ctx.moveTo(startPoint.x, startPoint.y); ctx.lineTo(endPoint.x, endPoint.y); ctx.stroke();
        const angle = Math.atan2(endPoint.y - startPoint.y, endPoint.x - startPoint.x);
        ctx.setLineDash([]); ctx.beginPath();
        ctx.moveTo(endPoint.x, endPoint.y); ctx.lineTo(endPoint.x - 12 * Math.cos(angle - Math.PI / 10), endPoint.y - 12 * Math.sin(angle - Math.PI / 10));
        ctx.moveTo(endPoint.x, endPoint.y); ctx.lineTo(endPoint.x - 12 * Math.cos(angle + Math.PI / 10), endPoint.y - 12 * Math.sin(angle + Math.PI / 10));
        ctx.stroke();
    };

    elements.forEach(el => { if (el.type === ELEMENT_TYPES.DEPENDENCY) drawDependency(el); });
    elements.forEach(el => { if (el.type === ELEMENT_TYPES.PACKAGE) drawPackage(el); });
    
    if (isDrawingLine && lineStart && linePreview) {
        ctx.strokeStyle = '#dc2626'; ctx.lineWidth = 2; ctx.setLineDash([8, 4]);
        ctx.beginPath(); ctx.moveTo(lineStart.x, lineStart.y);
        ctx.lineTo(linePreview.x, linePreview.y); ctx.stroke();
        ctx.setLineDash([]);
    }
    ctx.restore();
  }, [elements, scale, isDrawingLine, lineStart, linePreview]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
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
    return [...elements].reverse().find(el => el.type === ELEMENT_TYPES.PACKAGE && pos.x > el.x && pos.x < el.x + el.width && pos.y > el.y && pos.y < el.y + el.height);
  };

  const handleMouseDown = (e) => {
    const pos = getMousePos(e.nativeEvent);
    const target = getElementAtPos(pos);
    if (tool === 'select' && target) {
        saveStateToHistory(); setIsDragging(true); setSelectedElementId(target.id);
        setDragOffset({ x: pos.x - target.x, y: pos.y - target.y });
    } else if (tool === ELEMENT_TYPES.DEPENDENCY && target) {
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
            saveStateToHistory();
            const newDep = { id: Date.now(), type: ELEMENT_TYPES.DEPENDENCY, sourceId: lineStart.sourceId, targetId: target.id };
            setElements(prev => [...prev, newDep]);
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
    if(type === ELEMENT_TYPES.PACKAGE) { setNewElementInfo({ type, x: pos.x, y: pos.y }); }
  };
  
  const handleAddElement = (name) => {
      if (!newElementInfo) return; saveStateToHistory();
      const { type, x, y } = newElementInfo;
      const newPackage = { id: Date.now(), type, name, x, y, width: 200, height: 100 };
      setElements(prev => [...prev, newPackage]);
      setNewElementInfo(null);
  }

  const clearCanvas = () => { saveStateToHistory(); setElements([]); };
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
    
    const promptText = `Analiza la imagen de un diagrama de Paquetes UML. El objetivo es convertir este diagrama en una estructura JSON de clases. Reglas: 1. Cada 'Paquete' (la forma de carpeta) debe ser interpretado como una clase ('className') dentro de un paquete global. 2. Las flechas punteadas de dependencia de un paquete a otro indican una relación. Infiere el tipo de relación (OneToMany, ManyToOne, etc.) y los campos necesarios para representarla. 3. Infiere 'isEntity' (generalmente 'false' para paquetes, a menos que representen un módulo de dominio claro) y los campos basándote en los nombres. El objetivo es mapear el diagrama a la estructura de clases JSON proporcionada.`;
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
    return { title: "Nombre del Paquete", placeholder: "Ej: User Interface", buttonText: "Crear Paquete" };
  };
  const modalInfo = getModalInfoForNewElement();

  return (
    <div className="flex h-full">
      <PackageDiagramSidebar />
      <div className="flex-grow h-full flex flex-col">
        {/* Toolbar */}
        <div className="bg-white border-b p-2 flex items-center justify-between z-10 shadow-sm">
            <div className="flex items-center space-x-2">
                <Button variant={tool === 'select' ? 'secondary' : 'ghost'} size="icon" onClick={() => setTool('select')} title="Seleccionar y Mover (V)"><MousePointer className="h-4 w-4" /></Button>
                <Button variant={tool === ELEMENT_TYPES.DEPENDENCY ? 'secondary' : 'ghost'} size="icon" onClick={() => setTool(ELEMENT_TYPES.DEPENDENCY)} title="Crear Dependencia (L)"><MoveRight className="h-4 w-4" /></Button>
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
