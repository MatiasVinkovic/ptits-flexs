import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"


export default function LandingPage() {
  const [data, setData] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userName, setUserName] = useState(null);

  useEffect(() => {
  const fetchData = async () => {
    // Récupérer l'utilisateur connecté
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) {
      console.error("Erreur récupération utilisateur :", userError.message);
    } else {
      const displayName = userData.user?.user_metadata?.display_name;
      setUserName(displayName || userData.user?.email); // fallback sur email si pas de nom
    }

    // Récupérer les données de la table 'test'
    const { data, error } = await supabase.from("test").select("*");
    if (error) {
      console.error("Erreur Supabase :", error.message);
    } else {
      setData(data);
    }
  };

  fetchData();
}, []);

const handleLogout = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("Erreur de déconnexion :", error.message);
  } else {
    window.location.reload(); // ou redirige vers /login
  }
};

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 relative overflow-x-hidden">
      
      {/* Tabs bar - déplacer ici pour qu'elle soit tout en haut */}
      <nav className="w-full max-w-md mx-auto mb-6 animate-fade-in rounded-3xl shadow-lg bg-white/90 backdrop-blur-md p-2 sticky top-0 z-10">
        {userName && (
            <h1 className="text-2xl font-bold text-center mt-4">
              Bienvenue {userName}
            </h1>
          )}
          <Tabs defaultValue="account" className="w-full">
          <TabsList className="w-full flex justify-between">
            <TabsTrigger value="account" className="flex-1">Account</TabsTrigger>
            <TabsTrigger value="password" className="flex-1">Password</TabsTrigger>
          </TabsList>

          <TabsContent value="account">
            {/* Hero */}
            <header className="w-full max-w-md text-center mb-8 animate-fade-in rounded-3xl shadow-lg bg-white p-6">
              <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-2 drop-shadow-sm animate-bounce-in">
                Ptits Flexs
              </h1>
              <p className="text-lg md:text-xl text-gray-600 mb-4 font-light animate-slide-in">
                Organise tes événements entre potes, facilement et avec style.
              </p>
              <button className="mt-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-base rounded-full shadow hover:shadow-md transition-all duration-300 animate-pop-in">
                Créer ou rejoindre un événement
              </button>
            </header>
          </TabsContent>
        </Tabs>
      </nav>

      {/* Menu burger animé */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="absolute top-4 right-4 z-30 flex flex-col items-center justify-center w-10 h-10 bg-white/80 rounded-full shadow-md md:hidden transition-transform"
        aria-label="Menu"
      >
        <div
          className={`w-6 h-0.5 bg-black transition-transform duration-300 ${menuOpen ? "rotate-45 translate-y-1.5" : "mb-1"}`}
        />
        <div
          className={`w-6 h-0.5 bg-black transition-transform duration-300 ${menuOpen ? "-rotate-45 -translate-y-1.5" : "mt-1"}`}
        />
      </button>

      {/* Menu plein écran */}
      {menuOpen && (
        <div className="fixed inset-0 z-20 bg-white/95 backdrop-blur-md flex flex-col items-center justify-center space-y-8 text-2xl font-semibold text-gray-800 animate-fade-in-fast">
          <a href="#" onClick={() => setMenuOpen(false)}>Accueil</a>
          <a href="createevent" onClick={() => setMenuOpen(false)}>Créer un événement</a>
          <a href="event" onClick={() => setMenuOpen(false)}>Les évènements</a>
          <a href="login" onClick={() => setMenuOpen(false)}>Connexion</a>

          <a href="account" onClick={() => setMenuOpen(false)}>Compte</a>
          <button
            onClick={() => {
              setMenuOpen(false);
              handleLogout();
            }}
            className="text-red-500 underline"
          >
            Se déconnecter
          </button>
          <a href="register" onClick={() => setMenuOpen(false)}>Créer un compte</a>

        </div>
      )}

      <section className="w-full max-w-md bg-white rounded-3xl shadow-md p-4 mb-4 animate-fade-in-up">
        <h2 className="text-2xl font-semibold text-indigo-600 mb-3">Aperçu des événements</h2>
        <ul className="space-y-3">
          {data.length === 0 ? (
            <li className="text-gray-400 italic">Aucun événement pour l'instant...</li>
          ) : (
            data.map((item) => (
              <li key={item.id} className="p-3 bg-gray-100 rounded-2xl shadow-sm flex items-center gap-3 hover:bg-gray-200 transition-colors">
                <span className="w-3 h-3 bg-indigo-500 rounded-full animate-pulse"></span>
                <span className="font-medium text-gray-700">{item.nom}</span>
              </li>
            ))
          )}
        </ul>
      </section>

      {/* Animations */}
      <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes bounce-in { 0% { transform: scale(0.8); opacity: 0; } 60% { transform: scale(1.1); opacity: 1; } 100% { transform: scale(1); } }
        @keyframes pop-in { 0% { transform: scale(0.5); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes slide-in { from { transform: translateY(-16px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-fade-in { animation: fade-in 1s ease; }
        .animate-fade-in-fast { animation: fade-in 0.3s ease; }
        .animate-fade-in-up { animation: fade-in-up 1s 0.2s both; }
        .animate-bounce-in { animation: bounce-in 0.8s 0.1s both; }
        .animate-pop-in { animation: pop-in 0.7s 0.4s both; }
        .animate-slide-in { animation: slide-in 1s 0.3s both; }
      `}</style>
    </main>
  );
}