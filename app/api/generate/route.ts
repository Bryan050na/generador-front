// app/api/generate/route.ts

import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // 1. Recibe el JSON que envía el frontend.
    const diagramJson = await request.json();

    // 2. Muestra el JSON en la consola de tu terminal (donde ejecutaste 'npm run dev').
    //    Esto es para que verifiques que está llegando bien.
    console.log("✅ JSON recibido en el backend:");
    console.log(JSON.stringify(diagramJson, null, 2));

    // 3. --- AQUÍ VA TU LÓGICA DE BACKEND ---
    //    En este punto, ya tienes el 'diagramJson' y puedes pasarlo
    //    a tu lógica para generar los archivos de código, etc.
    //    Por ejemplo: generateCodeFrom(diagramJson);

    // 4. Responde al frontend que todo salió bien.
    return NextResponse.json({ 
        message: "JSON procesado con éxito en el backend.",
        dataReceived: diagramJson 
    }, { status: 200 });

  } catch (error) {
    // Si algo falla, informa del error.
    console.error("❌ Error en el endpoint /api/generate:", error);
    
    // Y responde al frontend con un error 500.
    return NextResponse.json({ 
        message: "Error al procesar el JSON en el servidor", 
        error: error.message 
    }, { status: 500 });
  }
}
