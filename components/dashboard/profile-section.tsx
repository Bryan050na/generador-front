"use client"

import React, { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Save, Loader2, AlertCircle } from "lucide-react"

// Importamos la configuración de Firebase que ya tienes en tu proyecto
import { auth, db } from "@/lib/firebase" 
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth"
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore"

export function ProfileSection() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState({
    name: "",
    username: "",
  });
  const [initials, setInitials] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carga los datos del perfil desde Firestore
  const fetchProfile = useCallback(async (firebaseUser: FirebaseUser) => {
    try {
      const docRef = doc(db, "users", firebaseUser.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setProfile({
          name: data.name || firebaseUser.displayName || "",
          username: data.username || "",
        });
      } else {
        // Si no hay perfil, usamos datos de la autenticación si existen
        setProfile({
          name: firebaseUser.displayName || "Nuevo Usuario",
          username: "",
        });
      }
    } catch (err) {
      console.error("Error al cargar el perfil:", err);
      setError("No se pudo cargar el perfil. Inténtalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Escucha cambios en la autenticación para saber qué usuario está logueado
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Escucha cambios en el perfil en tiempo real para mantener el estado actualizado
        const unsubProfile = onSnapshot(doc(db, "users", currentUser.uid), (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setProfile({
                    name: data.name || currentUser.displayName || "",
                    username: data.username || "",
                });
            } else {
                 setProfile({ name: currentUser.displayName || "Nuevo Usuario", username: "" });
            }
            setIsLoading(false);
        });
        return () => unsubProfile();
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);
  
  // Actualiza las iniciales para el avatar cuando cambia el nombre
  useEffect(() => {
      const nameToProcess = profile.name || user?.displayName || user?.email || "";
      if (nameToProcess) {
          const nameParts = nameToProcess.split(" ").filter(Boolean);
          const initialsCalc = nameParts.length > 1
              ? `${nameParts[0][0]}${nameParts[1][0]}`
              : nameParts[0]?.substring(0, 2) || "U";
          setInitials(initialsCalc.toUpperCase());
      }
  }, [profile.name, user]);


  // Guarda los datos del perfil en Firestore
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError("Debes iniciar sesión para guardar.");
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      const userRef = doc(db, "users", user.uid);
      // Creamos el objeto de datos a guardar, incluyendo el email
      const dataToSave = {
        name: profile.name,
        username: profile.username,
        email: user.email // Añadimos el email del usuario autenticado
      };
      await setDoc(userRef, dataToSave, { merge: true });
      alert("¡Perfil guardado con éxito!");
    } catch (err) {
      console.error("Error al guardar el perfil:", err);
      setError("No se pudo guardar el perfil. Inténtalo de nuevo.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full p-6">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (!user) {
    return (
        <div className="text-center p-10">
            <h2 className="text-2xl font-semibold">Inicia sesión</h2>
            <p className="text-gray-500">Debes iniciar sesión para ver y editar tu perfil.</p>
        </div>
    );
  }

  return (
    <div className="h-full overflow-auto p-6 bg-gray-50">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
        </div>
        
        <Card>
            <form onSubmit={handleSaveProfile}>
                <CardHeader>
                    <div className="flex items-center gap-6">
                        <Avatar className="h-24 w-24">
                            <AvatarImage src={user.photoURL || ""} alt={profile.name} />
                            <AvatarFallback className="text-3xl bg-blue-100 text-blue-600">
                               {initials}
                            </AvatarFallback>
                        </Avatar>
                        <div className="w-full">
                            <CardTitle className="text-2xl">{profile.name || 'Sin Nombre'}</CardTitle>
                            <CardDescription>{user.email}</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nombre completo</Label>
                        <Input
                            id="name"
                            value={profile.name}
                            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                            placeholder="Tu nombre completo"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="username">Nombre de usuario</Label>
                        <Input
                            id="username"
                            value={profile.username}
                            onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                            placeholder="Ej: peter_panda"
                        />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="email">Correo electrónico</Label>
                        <Input
                            id="email"
                            type="email"
                            value={user.email || ''}
                            disabled
                            className="bg-gray-100"
                        />
                    </div>
                    
                    {error && (
                        <div className="flex items-center text-red-600">
                           <AlertCircle className="h-4 w-4 mr-2" /> {error}
                        </div>
                    )}
                    
                    <div className="flex justify-end">
                        <Button type="submit" disabled={isSaving}>
                            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                        </Button>
                    </div>
                </CardContent>
            </form>
        </Card>
      </div>
    </div>
  )
}
