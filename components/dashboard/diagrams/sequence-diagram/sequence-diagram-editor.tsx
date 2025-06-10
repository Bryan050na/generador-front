"use client"

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BrainCircuit, Trash2, ZoomIn, ZoomOut, MousePointer, MoveRight, Undo2, CheckCircle, XCircle } from 'lucide-react';

// --- Constantes y Tipos ---
const ELEMENT_TYPES = { OBJECT: 'OBJECT', MESSAGE: 'MESSAGE' };
const DATA_TRANSFER_TYPE = "application/diagram-generator-object";


// --- Componente de la Barra Lateral (Integrado para evitar error de importación) ---
const SequenceDiagramSidebar = () => {
  const onDragStart = (event: React.DragEvent<HTMLDivElement>) => {
    event.dataTransfer.setData(DATA_TRANSFER_TYPE, "OBJECT");
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <div className="w-72 border-r bg-gray-50 p-4 overflow-y-auto">
      <h2 className="text-lg font-semibold mb-4">Elementos</h2>
      <Card className="mb-4">
        <CardHeader className="py-3">
          <CardTitle className="text-base">Objeto / Clase</CardTitle>
          <CardDescription className="text-xs">Arrastra para crear un nuevo objeto en el lienzo.</CardDescription>
        </CardHeader>
        <CardContent className="py-2">
          <div
            className="border-2 border-dashed border-gray-300 p-4 rounded-md bg-white cursor-grab flex items-center justify-center hover:border-blue-400 hover:bg-blue-50 transition-colors duration-200"
            onDragStart={onDragStart}
            draggable
          >
            <div className="w-10 h-6 border-2 border-blue-600 rounded-sm mr-3"></div>
            <span>Objeto</span>
          </div>
        </CardContent>
      </Card>
      <div className="mt-6 p-3 bg-blue-50 rounded-lg">
        <h3 className="text-sm font-medium mb-2">Instrucciones</h3>
        <ul className="space-y-2 text-xs text-gray-700">
            <li><strong className="font-semibold">Mover objetos:</strong> Usa el modo <MousePointer className="inline h-3 w-3" /> (Selección).</li>
            <li><strong className="font-semibold">Crear mensajes:</strong> Cambia al modo "Mensaje" y arrastra una línea entre dos objetos.</li>
        </ul>
      </div>
    </div>
  );
};


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
                    <input type="text" value={projectName} onChange={(e) => setProjectName(e.target.value)} className="border border-gray-300 p-2 rounded-md w-full focus:ring-2 focus:ring-blue-500 outline-none" placeholder="MiProyectoAsombroso" />
                </div>
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Paquete Principal</label>
                    <input type="text" value={packageName} onChange={(e) => setPackageName(e.target.value)} className="border border-gray-300 p-2 rounded-md w-full focus:ring-2 focus:ring-blue-500 outline-none" placeholder="com.ejemplo.mi-app" />
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


// --- Componente Principal del Editor ---

export function SequenceDiagramEditor() {
  const [objects, setObjects] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activations, setActivations] = useState([]);
  const [history, setHistory] = useState([]);
  
  const [tool, setTool] = useState('select');
  const [scale, setScale] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  
  const [newObjectInfo, setNewObjectInfo] = useState(null);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  
  const [selectedElement, setSelectedElement] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const [isDrawingMessage, setIsDrawingMessage] = useState(false);
  const [messageStart, setMessageStart] = useState(null);
  const [messagePreviewLine, setMessagePreviewLine] = useState(null);
  
  const canvasRef = useRef(null);
  const OBJECT_WIDTH = 140;
  const OBJECT_HEIGHT = 70;

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => { setNotification({ show: false, message: '', type: '' }); }, 5000);
  };

  const saveStateToHistory = useCallback(() => {
    setHistory(prev => [...prev, { objects, messages, activations }]);
  }, [objects, messages, activations]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save(); ctx.scale(scale, scale);

    objects.forEach(obj => {
        ctx.strokeStyle = '#CBD5E0'; ctx.lineWidth = 2; ctx.beginPath();
        ctx.setLineDash([5, 5]); ctx.moveTo(obj.x + OBJECT_WIDTH / 2, obj.y + OBJECT_HEIGHT);
        ctx.lineTo(obj.x + OBJECT_WIDTH / 2, 1000); ctx.stroke(); ctx.setLineDash([]);
    });
    activations.forEach(act => {
        const obj = objects.find(o => o.id === act.objectId); if(!obj) return;
        ctx.fillStyle = '#EBF8FF'; ctx.strokeStyle = '#4299E1'; ctx.lineWidth = 1.5;
        const x = obj.x + OBJECT_WIDTH / 2 - 5;
        ctx.fillRect(x, act.startY, 10, act.endY - act.startY); ctx.strokeRect(x, act.startY, 10, act.endY - act.startY);
    });
    messages.forEach(msg => {
      const sourceObj = objects.find(o => o.id === msg.sourceId); const targetObj = objects.find(o => o.id === msg.targetId); if (!sourceObj || !targetObj) return;
      const startX = sourceObj.x + OBJECT_WIDTH / 2; const endX = targetObj.x + OBJECT_WIDTH / 2;
      ctx.strokeStyle = '#2D3748'; ctx.lineWidth = 1.5; ctx.beginPath();
      ctx.moveTo(startX, msg.y); ctx.lineTo(endX, msg.y); ctx.stroke();
      const angle = Math.atan2(0, endX - startX); ctx.fillStyle = '#2D3748'; ctx.beginPath();
      ctx.moveTo(endX, msg.y);
      ctx.lineTo(endX - 12 * Math.cos(angle - Math.PI / 7), msg.y - 12 * Math.sin(angle - Math.PI / 7));
      ctx.lineTo(endX - 12 * Math.cos(angle + Math.PI / 7), msg.y + 12 * Math.sin(angle + Math.PI / 7));
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#4A5568'; ctx.font = '13px Arial'; ctx.textAlign = 'center'; ctx.fillText(msg.text, (startX + endX) / 2, msg.y - 8);
    });
    objects.forEach(obj => {
      ctx.fillStyle = isDragging && selectedElement?.id === obj.id ? '#E2E8F0' : '#FFFFFF';
      ctx.strokeStyle = '#4A5568'; ctx.lineWidth = 2;
      ctx.strokeRect(obj.x, obj.y, OBJECT_WIDTH, OBJECT_HEIGHT); ctx.fillRect(obj.x, obj.y, OBJECT_WIDTH, OBJECT_HEIGHT);
      ctx.fillStyle = '#1A202C'; ctx.font = 'bold 14px Arial'; ctx.textAlign = 'center';
      ctx.fillText(obj.name, obj.x + OBJECT_WIDTH / 2, obj.y + OBJECT_HEIGHT / 2);
    });
    if (isDrawingMessage && messageStart && messagePreviewLine) {
        ctx.strokeStyle = '#F56565'; ctx.lineWidth = 2; ctx.setLineDash([8, 4]);
        ctx.beginPath(); ctx.moveTo(messageStart.x, messageStart.y);
        ctx.lineTo(messagePreviewLine.x, messagePreviewLine.y); ctx.stroke();
        ctx.setLineDash([]);
    }
    ctx.restore();
  }, [objects, messages, activations, scale, isDragging, selectedElement, isDrawingMessage, messageStart, messagePreviewLine]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const resizeObserver = new ResizeObserver(() => {
        if (!canvas) return; const container = canvas.parentElement;
        canvas.width = container.clientWidth; canvas.height = container.clientHeight; draw();
    });
    resizeObserver.observe(canvas.parentElement); return () => resizeObserver.disconnect();
  }, [draw]);
  
  useEffect(draw, [draw]);
  
  const getMousePos = (e) => {
    const canvas = canvasRef.current; const rect = canvas.getBoundingClientRect();
    return { x: (e.clientX - rect.left) / scale, y: (e.clientY - rect.top) / scale };
  };
  const getObjectAtPos = (pos) => [...objects].reverse().find(obj => pos.x >= obj.x && pos.x <= obj.x + OBJECT_WIDTH && pos.y >= obj.y && pos.y <= obj.y + OBJECT_HEIGHT);
  const getLifelineAtPos = (pos) => [...objects].reverse().find(obj => (pos.x >= obj.x + OBJECT_WIDTH / 2 - 8 && pos.x <= obj.x + OBJECT_WIDTH / 2 + 8) && pos.y >= obj.y + OBJECT_HEIGHT);

  const handleMouseDown = (e) => {
    const pos = getMousePos(e.nativeEvent);
    if (tool === 'select') {
      const clickedObject = getObjectAtPos(pos);
      if (clickedObject) {
          saveStateToHistory(); setIsDragging(true); setSelectedElement({ id: clickedObject.id, type: ELEMENT_TYPES.OBJECT });
      }
    } else if (tool === ELEMENT_TYPES.MESSAGE) {
      const sourceLifeline = getLifelineAtPos(pos);
      if(sourceLifeline) {
        setIsDrawingMessage(true);
        setMessageStart({ x: sourceLifeline.x + OBJECT_WIDTH/2, y: pos.y, sourceId: sourceLifeline.id });
        setMessagePreviewLine({ x: pos.x, y: pos.y });
      }
    }
  };
  const handleMouseMove = (e) => {
    if (isDragging && tool === 'select' && selectedElement) {
      const pos = getMousePos(e.nativeEvent);
      setObjects(prev => prev.map(obj => obj.id === selectedElement.id ? { ...obj, x: pos.x - OBJECT_WIDTH/2, y: pos.y - OBJECT_HEIGHT/2 } : obj ));
    } else if (isDrawingMessage) {
        const pos = getMousePos(e.nativeEvent); setMessagePreviewLine({x: pos.x, y: pos.y});
    }
  };
  const handleMouseUp = (e) => {
    if(isDrawingMessage) {
        const pos = getMousePos(e.nativeEvent); const targetLifeline = getLifelineAtPos(pos);
        if(targetLifeline && messageStart && targetLifeline.id !== messageStart.sourceId) {
            setMessageStart(prev => ({...prev, targetId: targetLifeline.id}));
        } else { setMessageStart(null); }
        setIsDrawingMessage(false); setMessagePreviewLine(null);
    }
    setIsDragging(false); setSelectedElement(null);
  };

  const handleDragOver = (e) => { e.preventDefault(); };
  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.getData(DATA_TRANSFER_TYPE) === ELEMENT_TYPES.OBJECT) {
        const pos = getMousePos(e); setNewObjectInfo({ x: pos.x - OBJECT_WIDTH / 2, y: pos.y });
    }
  };
  
  const handleAddObject = (name) => {
    if (!newObjectInfo) return; saveStateToHistory();
    setObjects(prev => [...prev, { id: Date.now(), name, x: newObjectInfo.x, y: 50 }]);
    setNewObjectInfo(null);
  };
  const handleAddMessage = (text) => {
    if (!messageStart?.sourceId || !messageStart?.targetId) return;
    saveStateToHistory(); const y = messageStart.y;
    setMessages(prev => [...prev, { id: Date.now(), sourceId: messageStart.sourceId, targetId: messageStart.targetId, text, y }]);
    setActivations(prev => [...prev, {id: Date.now(), objectId: messageStart.targetId, startY: y - 5, endY: y + 40}]);
    setMessageStart(null);
  };
  const clearCanvas = () => { saveStateToHistory(); setObjects([]); setMessages([]); setActivations([]); };
  const handleUndo = () => {
    if (history.length === 0) return; const lastState = history[history.length - 1];
    setObjects(lastState.objects); setMessages(lastState.messages); setActivations(lastState.activations);
    setHistory(history.slice(0, -1));
  };
  
  const handleGenerateAndSend = async (projectName, packageName) => {
    setIsLoading(true); setIsGenerateModalOpen(false);
    
    // Leer la API Key desde las variables de entorno
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
        showNotification("La API Key de Gemini no está configurada.", "error");
        setIsLoading(false);
        return;
    }

    await new Promise(resolve => setTimeout(resolve, 100));
    const canvas = canvasRef.current; const dataUrl = canvas.toDataURL('image/png'); const base64ImageData = dataUrl.split(',')[1];
    
    const promptText = `Analiza la imagen de un diagrama de secuencia UML y genera un JSON que represente su estructura. Reglas: 1. El JSON resultante DEBE ser un array con un único objeto. 2. Este objeto debe tener "projectName". 3. También debe tener "package", un array con un objeto. 4. Este objeto debe tener "packageName" y luego "classes". Es CRÍTICO que el orden sea primero "packageName" y después "classes".`;
    const newSchema = { type: "ARRAY", items: { type: "OBJECT", properties: { projectName: { type: "STRING" }, package: { type: "ARRAY", items: { type: "OBJECT", properties: { packageName: { type: "STRING" }, classes: { type: "ARRAY", items: { type: "OBJECT", properties: { className: { type: "STRING" }, isEntity: { type: "BOOLEAN" }, fields: { type: "ARRAY", items: { type: "OBJECT", properties: { name: { type: "STRING" }, type: { type: "STRING" }, isIdField: { type: "BOOLEAN" }, generationStrategy: { type: "STRING" } }, required: ["name", "type"] } }, relationships: { type: "ARRAY", items: { type: "OBJECT", properties: { type: { type: "STRING" }, mappedBy: { type: "STRING" }, cascade: { type: "ARRAY", items: { type: "STRING" } }, fetch: { type: "STRING" } }, required: ["type", "mappedBy", "cascade", "fetch"] } } }, required: ["className", "isEntity"] } } }, required: ["packageName", "classes"], propertyOrdering: ["packageName", "classes"] } }, class: { type: "OBJECT", properties: { className: { type: "STRING" }, isEntity: { type: "BOOLEAN" }, fields: { type: "ARRAY", items: { type: "OBJECT", properties: { name: { type: "STRING" }, type: { type: "STRING" } }, required: ["name", "type"] } } } } }, required: ["projectName"] } };
    const payload = { contents: [{ role: "user", parts: [{ text: promptText }, { inlineData: { mimeType: "image/png", data: base64ImageData } }] }], generationConfig: { responseMimeType: "application/json", responseSchema: newSchema } };
    
    try {
        const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
        const geminiResponse = await fetch(geminiApiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        
        if (!geminiResponse.ok) { 
            const errorBody = await geminiResponse.json(); // Intentar parsear el cuerpo del error como JSON
            throw new Error(`Error en la API de Gemini: ${geminiResponse.status} - ${errorBody.error.message}`); 
        }

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

  return (
    <div className="flex h-full w-full">
      {notification.show && <Notification message={notification.message} type={notification.type} onClose={() => setNotification({ show: false, message: '', type: '' })} />}
      <SequenceDiagramSidebar />
      <div className="flex-grow h-full flex flex-col">
        {/* Toolbar */}
        <div className="bg-white border-b p-2 flex items-center justify-between z-10 shadow-sm">
            <div className="flex items-center space-x-2">
                <Button variant={tool === 'select' ? 'secondary' : 'ghost'} size="icon" onClick={() => setTool('select')} title="Seleccionar y Mover (V)"><MousePointer className="h-4 w-4" /></Button>
                <Button variant={tool === ELEMENT_TYPES.MESSAGE ? 'secondary' : 'ghost'} size="icon" onClick={() => setTool(ELEMENT_TYPES.MESSAGE)} title="Crear Mensaje (M)"><MoveRight className="h-4 w-4" /></Button>
                <Button variant="outline" size="icon" onClick={handleUndo} title="Deshacer (Ctrl+Z)" disabled={!history.length > 0}><Undo2 className="h-4 w-4" /></Button>
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
          <canvas ref={canvasRef} className="absolute top-0 left-0" onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} style={{ cursor: tool === 'select' ? (isDragging ? 'grabbing' : 'grab') : (isDrawingMessage ? 'crosshair' : 'default') }} />
        </div>
      </div>
       {newObjectInfo && <InputModal onSubmit={handleAddObject} onCancel={() => setNewObjectInfo(null)} title="Nombre del Objeto/Clase" placeholder="Ej: Pedido, Usuario" buttonText="Crear" />}
       {messageStart?.targetId && <InputModal onSubmit={handleAddMessage} onCancel={() => setMessageStart(null)} title="Contenido del Mensaje" placeholder="Ej: getBalance(cuentaId)" buttonText="Crear Mensaje" />}
       {isGenerateModalOpen && <GenerateModal onSubmit={handleGenerateAndSend} onCancel={() => setIsGenerateModalOpen(false)} />}
    </div>
  );
}
