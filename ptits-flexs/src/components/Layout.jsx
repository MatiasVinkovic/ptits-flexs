import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function Layout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [userName, setUserName] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (menuOpen) {
      setMenuVisible(true);
    } else if (menuVisible) {
      // Laisser le temps à l'animation de fade-out avant de cacher le menu
      const timeout = setTimeout(() => setMenuVisible(false), 300);
      return () => clearTimeout(timeout);
    }
  }, [menuOpen, menuVisible]);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (!user || error) return;

      setIsLoggedIn(true);
      const { data: publicUser } = await supabase
        .from("users_public")
        .select("username")
        .eq("id", user.id)
        .single();
      setUserName(publicUser?.username || user.email);
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const links = [
    { href: "/", label: "Accueil" },
    ...(isLoggedIn ? [{ href: "/createevent", label: "Créer un événement" }] : []),
    { href: "/event", label: "Les évènements" },
    ...(isLoggedIn ? [{ href: "/remboursement", label: "Les remboursements" }] : []),
    ...(!isLoggedIn ? [{ href: "/login", label: "Connexion" }] : []),
    ...(isLoggedIn ? [{ href: "/annuaire", label: "Annuaire" }] : []),
    ...(isLoggedIn ? [{ href: "/jeu", label: "Jeux" }] : []),
    ...(isLoggedIn ? [{ href: "/account", label: "Compte" }] : [])
  ];

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-x-hidden">
      {/* Menu Burger */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="absolute top-4 right-4 z-30 flex flex-col items-center justify-center w-10 h-10 bg-white/80 rounded-full shadow-md md:hidden transition-transform"
        aria-label="Menu"
      >
        <div className={`w-6 h-0.5 bg-black transition-all ${menuOpen ? "rotate-45 translate-y-1.5" : "mb-1"}`} />
        <div className={`w-6 h-0.5 bg-black transition-all ${menuOpen ? "-rotate-45 -translate-y-1.5" : "mt-1"}`} />
      </button>

      {menuVisible && (
        <div
          className={`fixed inset-0 z-20 bg-white/95 backdrop-blur-md flex flex-col items-center justify-center text-2xl font-semibold text-gray-800 space-y-4
            ${menuOpen ? "animate-menu-open" : "animate-menu-close"}`}
        >
          {links.map((link, index) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="opacity-0 animate-fade-in-link"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {link.label}
            </a>
          ))}
          {isLoggedIn && (
            <button
              className="text-red-500 underline opacity-0 animate-fade-in-link"
              style={{ animationDelay: `${links.length * 0.1}s` }}
              onClick={handleLogout}
            >
              Se déconnecter
            </button>
          )}
        </div>
      )}

      {/* Contenu de la page */}
      <main className="pt-20 px-4 max-w-3xl mx-auto transition-opacity duration-500">
        {children}
      </main>

      <style>{`
        @keyframes fade-in-fast {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in-fast {
          animation: fade-in-fast 0.3s ease-in-out;
        }

        @keyframes menu-open {
          0% { opacity: 0; transform: scale(0.95); }
          100% { opacity: 1; transform: scale(1); }
        }
        .animate-menu-open {
          animation: menu-open 0.3s ease-out forwards;
        }

        @keyframes menu-close {
          0% { opacity: 1; transform: scale(1);}
          100% { opacity: 0; transform: scale(0.95);}
        }
        .animate-menu-close {
          animation: menu-close 0.3s ease-in forwards;
        }

        @keyframes fade-in-link {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-link {
          animation: fade-in-link 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}