import React, { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("login"); // ou "signup"
  const [message, setMessage] = useState("");

  const handleAuth = async () => {
    let result;
    if (mode === "login") {
      result = await supabase.auth.signInWithPassword({ email, password });
    } else {
      result = await supabase.auth.signUp({ email, password });
    }

    if (result.error) {
      setMessage("❌ " + result.error.message);
    } else {
      setMessage("✅ Connecté avec succès !");
      // Rediriger ou faire autre chose après la connexion
      window.location.href = "/";
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded-lg shadow">
      <h1 className="text-xl font-bold mb-4 text-center">
        {mode === "login" ? "Connexion" : "Créer un compte"}
      </h1>
      <Input
        type="email"
        placeholder="Email"
        className="mb-2"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Input
        type="password"
        placeholder="Mot de passe"
        className="mb-4"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button onClick={handleAuth} className="w-full">
        {mode === "login" ? "Se connecter" : "S'inscrire"}
      </Button>
      <p className="mt-4 text-sm text-gray-600 text-center">
        {mode === "login" ? "Pas encore de compte ?" : "Déjà inscrit ?"}{" "}
        <button
          className="text-blue-600 hover:underline"
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
        >
          {mode === "login" ? "Créer un compte" : "Se connecter"}
        </button>
      </p>
      {message && <p className="text-center mt-4">{message}</p>}
    </div>
  );
}