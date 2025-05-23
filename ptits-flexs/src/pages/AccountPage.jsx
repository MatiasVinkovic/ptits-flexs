import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";

export default function AccountPage() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setMessage("Impossible de récupérer l'utilisateur.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("users_public")
        .select("username")
        .eq("id", user.id)
        .single();

      if (error) {
        setMessage("Erreur lors du chargement du profil.");
      } else {
        setEmail(user.email);
        setUsername(data?.username || "");
      }
      setLoading(false);
    };

    fetchProfile();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setMessage("Utilisateur non connecté.");
      setLoading(false);
      return;
    }

    // Mise à jour du nom d'utilisateur
    const { error: usernameError } = await supabase
      .from("users_public")
      .update({ username })
      .eq("id", user.id);

    // Mise à jour du mot de passe si rempli
    let passwordError = null;
    if (newPassword) {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      passwordError = error;
    }

    setLoading(false);

    if (usernameError || passwordError) {
      setMessage(
        `${usernameError?.message || ""} ${passwordError?.message || ""}`.trim()
      );
    } else {
      setMessage("Profil mis à jour ✔️");
      setNewPassword(""); // vider le champ
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gray-50 animate-fade-in">
      <Layout>
      <form
        onSubmit={handleUpdate}
        className="w-full max-w-md bg-white rounded-xl shadow-md p-6 space-y-4 animate-pop-in"
      >
        <h1 className="text-2xl font-bold text-center animate-slide-down">Mon compte</h1>

        <div className="animate-fade-in-up" style={{ animationDelay: "0.1s", animationFillMode: "both" }}>
          <label className="block text-sm mb-1">Adresse e-mail</label>
          <Input type="email" value={email} disabled className="bg-gray-100" />
        </div>

        <div className="animate-fade-in-up" style={{ animationDelay: "0.2s", animationFillMode: "both" }}>
          <label className="block text-sm mb-1">Nom affiché</label>
          <Input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div className="animate-fade-in-up" style={{ animationDelay: "0.3s", animationFillMode: "both" }}>
          <label className="block text-sm mb-1">Nouveau mot de passe</label>
          <Input
            type="password"
            placeholder="Laisser vide pour ne pas changer"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>

        <div className="animate-fade-in-up" style={{ animationDelay: "0.4s", animationFillMode: "both" }}>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Chargement..." : "Enregistrer"}
          </Button>
        </div>

        {message && (
          <p className="text-center text-sm text-gray-600 animate-fade-in-up" style={{ animationDelay: "0.5s", animationFillMode: "both" }}>
            {message}
          </p>
        )}
      </form>
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease;
        }
        @keyframes pop-in {
          from { opacity: 0; transform: scale(0.96);}
          to { opacity: 1; transform: scale(1);}
        }
        .animate-pop-in {
          animation: pop-in 0.5s cubic-bezier(.22,1,.36,1);
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(24px);}
          to { opacity: 1; transform: translateY(0);}
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.5s cubic-bezier(.22,1,.36,1);
        }
        @keyframes slide-down {
          from { opacity: 0; transform: translateY(-24px);}
          to { opacity: 1; transform: translateY(0);}
        }
        .animate-slide-down {
          animation: slide-down 0.5s cubic-bezier(.22,1,.36,1);
        }
      `}</style>
      </Layout>
    </main>
  );
}