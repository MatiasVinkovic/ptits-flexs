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

      <nav className="hidden md:flex fixed top-6 left-1/2 transform -translate-x-1/2 z-40 bg-white/80 backdrop-blur-xl px-10 py-4 rounded-full shadow-xl border border-gray-200 animate-fade-slide-in overflow-x-auto max-w-[95vw] min-w-[1000px]">
        <div className="flex items-center gap-10 px-4 whitespace-nowrap w-full justify-center">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="relative text-gray-700 font-medium transition hover:text-indigo-600 after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 hover:after:w-full after:bg-indigo-500 after:transition-all after:duration-300"
            >
              {link.label}
            </a>
          ))}
          {isLoggedIn && (
            <button
              onClick={handleLogout}
              className="text-red-500 underline hover:text-red-600 transition font-medium"
            >
              Déconnexion
            </button>
          )}
        </div>

        <style>{`
          @keyframes fade-slide-in {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-slide-in {
            animation: fade-slide-in 0.6s ease-out both;
          }
        `}</style>
      </nav>


      {/* Menu burger mobile */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="absolute top-4 right-4 z-30 flex flex-col items-center justify-center w-10 h-10 bg-white/80 rounded-full shadow-md md:hidden transition-transform"
        aria-label="Menu"
      >
        <div className={`w-6 h-0.5 bg-black transition-all ${menuOpen ? "rotate-45 translate-y-1.5" : "mb-1"}`} />
        <div className={`w-6 h-0.5 bg-black transition-all ${menuOpen ? "-rotate-45 -translate-y-1.5" : "mt-1"}`} />
      </button>

      {/* Menu déroulant mobile */}
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

          <a
  href="/timer"
  className="fixed bottom-4 left-4 z-50 bg-white shadow-lg rounded-full p-3 hover:bg-indigo-100 transition-all"
  title="Timer de brossage de dents"
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6 text-indigo-600"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
</a>
        </div>
      )}

      {/* Contenu de page */}
      <main className="pt-24 px-4 md:px-8 lg:px-16 max-w-5xl mx-auto transition-opacity duration-500">
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