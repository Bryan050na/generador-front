"use client"
import Image from "next/image"
import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { onAuthStateChanged, signOut, User } from "firebase/auth"
import { doc, onSnapshot } from "firebase/firestore"
import { auth, db } from "@/lib/firebase" 
import { useRouter } from "next/navigation"

export default function Header() {
  const [user, setUser] = useState<{ email: string | null; displayName: string | null } | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Escucha cambios de autenticación
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser: User | null) => {
      if (currentUser) {
        // El usuario está autenticado. Ahora, escucha cambios en su perfil de Firestore en tiempo real.
        const docRef = doc(db, "users", currentUser.uid);
        const unsubscribeProfile = onSnapshot(docRef, (docSnap) => {
            let displayName = "Usuario sin nombre";
            if (docSnap.exists() && docSnap.data().name) {
              // Si el documento existe y tiene un nombre, lo usamos
              displayName = docSnap.data().name;
            } else if (currentUser.displayName) {
              // Si no, usamos el displayName de la autenticación
              displayName = currentUser.displayName;
            }

            setUser({
              email: currentUser.email,
              displayName: displayName,
            });
        }, (error) => {
            console.error("Error al escuchar el perfil:", error);
            // Si hay un error, al menos muestra el email
            setUser({
                email: currentUser.email,
                displayName: currentUser.displayName || "Usuario sin nombre",
            });
        });

        // Retornar la función para dejar de escuchar los cambios del perfil cuando el usuario se desloguea
        return () => unsubscribeProfile();

      } else {
        setUser(null)
      }
    })

    // Retornar la función para dejar de escuchar los cambios de autenticación
    return () => unsubscribeAuth()
  }, [])

  const handleLogout = async () => {
    try {
      await signOut(auth)
      router.push("/") // Redirige al login
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
    }
  }

  return (
    <header className="h-16 w-full flex items-center justify-between px-5 bg-gray-800 shadow-lg">
      {/* Logo y nombre */}
      <div className="flex items-center space-x-3 text-white">
        <Image src="/images/logo.png" width={50} height={50} alt="Logo" className="rounded-lg" />
        <h1 className="text-xl font-bold">Diagramainador</h1>
      </div>

      {/* Perfil del usuario y logout */}
      <div className="flex flex-shrink-0 items-center space-x-4 text-white">
        {user ? (
          <>
            <div className="flex flex-col items-end">
              <div className="text-md font-medium">{user.displayName}</div>
              <div className="text-sm font-regular text-gray-300">{user.email}</div>
            </div>
            <div className="h-10 w-10 rounded-full cursor-pointer bg-gray-200 border-2 border-blue-400 hover:border-blue-300 transition-colors duration-200"></div>

            {/* Botón de cerrar sesión */}
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:text-gray-300 hover:bg-gray-700 transition-colors duration-200"
              title="Cerrar sesión"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </>
        ) : (
          <div className="text-sm text-gray-300">No autenticado</div>
        )}
      </div>
    </header>
  )
}
