import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function AccountPage() {
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
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

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", user.id)
        .single();

      if (profileError) {
        setMessage("Erreur lors du chargement du profil.");
      } else {
        setEmail(user.email);
        setDisplayName(profile?.display_name || "");
      }
      setLoading(false);
    };

    fetchProfile();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    const {
      data: { user }
    } = await supabase.auth.getUser();

    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      display_name: displayName
    });

    setLoading(false);
    setMessage(error ? error.message : "Profil mis à jour ✔️");
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <form
        onSubmit={handleUpdate}
        className="w-full max-w-md bg-white rounded-xl shadow-md p-6 space-y-4"
      >
        <h1 className="text-2xl font-bold text-center">Mon compte</h1>

        <div>
          <label className="block text-sm mb-1">Adresse e-mail</label>
          <Input type="email" value={email} disabled className="bg-gray-100" />
        </div>

        <div>
          <label className="block text-sm mb-1">Nom affiché</label>
          <Input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Chargement..." : "Enregistrer"}
        </Button>

        {message && <p className="text-center text-sm text-gray-600">{message}</p>}
      </form>
    </main>
  );
}