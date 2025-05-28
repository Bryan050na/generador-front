"use client"

export function SettingsSection() {
  return (
    <div className="h-full flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="text-8xl mb-6">🎬</div>
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Próximamente</h1>
        <p className="text-xl text-gray-600 mb-2">Solo en cines</p>
        <p className="text-lg text-gray-500 italic">(También en 3D)</p>
        <div className="mt-8 text-sm text-gray-400">🍿 Mientras tanto, disfruta creando diagramas increíbles</div>
      </div>
    </div>
  )
}
