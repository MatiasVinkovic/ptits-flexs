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
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
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
    ...(isLoggedIn
      ? [{ href: "/remboursement", label: "Les remboursements" }]
      : []),
    ...(!isLoggedIn ? [{ href: "/login", label: "Connexion" }] : []),
    ...(isLoggedIn ? [{ href: "/annuaire", label: "Annuaire" }] : []),
    ...(isLoggedIn ? [{ href: "/jeu", label: "Jeux" }] : []),
    ...(isLoggedIn ? [{ href: "/account", label: "Compte" }] : []),
  ];

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-x-hidden">
      {/* --- Décor été global (derrière tout) --- */}
      <div className="pointer-events-none select-none absolute inset-0 z-0">
        {/* Soleil en orbite douce */}
        

        {/* Emojis flottants */}
        <div className="summer-float" style={{ top: "22%", left: "8%" }}>
          ⛱️
        </div>
        <div className="summer-float" style={{ top: "60%", left: "18%" }}>
          🛟
        </div>
        <div className="summer-float" style={{ top: "40%", left: "82%" }}>
          ⛱️
        </div>
        <div className="summer-float" style={{ top: "72%", left: "68%" }}>
          🏖️
        </div>
      </div>

      {/* --- Nav desktop --- */}
      <nav className="hidden md:flex fixed top-6 left-1/2 transform -translate-x-1/2 z-40 bg-white/70 backdrop-blur-xl px-10 py-4 rounded-full shadow-xl border border-orange-200/70 animate-fade-slide-in overflow-x-auto max-w-[95vw] min-w-[1000px] summer-nav-glow">
        <div className="flex items-center gap-10 px-4 whitespace-nowrap w-full justify-center">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="relative text-gray-800 font-medium transition hover:text-orange-600 after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 hover:after:w-full after:bg-gradient-to-r after:from-orange-500 after:to-amber-400 after:transition-all after:duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/70 rounded"
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

      {/* --- Bouton mobile (emoji qui change) --- */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="absolute top-4 right-4 z-30 grid place-items-center w-10 h-10 bg-white/80 rounded-full shadow-md md:hidden transition-transform border border-orange-200/70"
        aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
      >
        <span
          className={`emoji-toggle ${menuOpen ? "animate-emoji-open" : "animate-emoji-close"}`}
          aria-hidden="true"
        >
          {menuOpen ? "🌴" : "🍹"}
        </span>
      </button>

      {/* --- Menu mobile --- */}
      {menuVisible && (
        <div
          className={`fixed inset-0 z-20 bg-gradient-to-b from-orange-50/95 via-amber-50/95 to-orange-100/95 backdrop-blur-md flex flex-col items-center justify-center text-2xl font-semibold text-gray-800 space-y-4 border-t border-orange-200/70
            ${menuOpen ? "animate-menu-open" : "animate-menu-close"}`}
        >
          {links.map((link, index) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="opacity-0 animate-fade-in-link hover:text-orange-600 transition"
              style={{ animationDelay: `${index * 0.08}s` }}
            >
              {link.label}
            </a>
          ))}
          {isLoggedIn && (
            <button
              className="text-red-500 underline opacity-0 animate-fade-in-link"
              style={{ animationDelay: `${links.length * 0.08}s` }}
              onClick={handleLogout}
            >
              Se déconnecter
            </button>
          )}

          {/* Raccourci timer */}
          <a
            href="/timer"
            className="fixed bottom-4 left-4 z-50 bg-white/90 shadow-lg rounded-full p-3 hover:bg-orange-50 transition-all border border-orange-200/70"
            title="Timer de brossage de dents"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-orange-600"
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

      {/* --- Contenu de page --- */}
      <main className="pt-24 px-4 md:px-8 lg:px-16 max-w-5xl mx-auto transition-opacity duration-500 relative z-10">
        {children}
      </main>

      {/* --- Styles Summer + Emoji Toggle --- */}
      <style>{`
        /* Glow discret autour de la nav pour l'effet soleil */
        .summer-nav-glow {
          box-shadow:
            0 2px 10px rgba(255, 159, 67, 0.15),
            0 8px 28px rgba(255, 107, 53, 0.10);
        }

        /* Soleil en orbite douce (reste en haut droite mais bouge un peu) */
        .summer-sun {
          position: absolute;
          top: 10px;
          right: 10px;
          font-size: 3rem;
          opacity: 0.9;
          animation: sun-orbit 18s ease-in-out infinite, sun-tilt 12s linear infinite;
          filter: drop-shadow(0 0 12px rgba(255, 183, 3, 0.45));
          pointer-events: none;
          user-select: none;
        }
        @keyframes sun-orbit {
          0%   { transform: translate(0, 0); }
          25%  { transform: translate(-8px, 6px); }
          50%  { transform: translate(-2px, 10px); }
          75%  { transform: translate(-10px, 2px); }
          100% { transform: translate(0, 0); }
        }
        @keyframes sun-tilt {
          0%   { rotate: 0deg; }
          100% { rotate: 360deg; }
        }

        /* Emojis flottants en arrière-plan */
        .summer-float {
          position: absolute;
          font-size: 1.8rem;
          opacity: 0.72;
          animation: floaty 12s ease-in-out infinite;
          pointer-events: none;
          user-select: none;
        }
        @keyframes floaty {
          0%, 100% { transform: translateY(0) translateX(0); }
          50%      { transform: translateY(-12px) translateX(8px); }
        }

        /* --- Anim bouton emoji --- */
        .emoji-toggle {
          display: inline-block;
          font-size: 1.35rem;
          line-height: 1;
          transition: transform 180ms ease, filter 180ms ease;
          will-change: transform;
        }
        .emoji-toggle:hover { transform: translateY(-1px) scale(1.05); }
        @keyframes emoji-open {
          0%   { transform: rotateY(0deg) scale(0.9); opacity: 0.9; }
          50%  { transform: rotateY(90deg) scale(1.05); opacity: 0.8; }
          100% { transform: rotateY(0deg) scale(1.0); opacity: 1; }
        }
        @keyframes emoji-close {
          0%   { transform: rotateY(0deg) scale(1.0); opacity: 1; }
          50%  { transform: rotateY(-90deg) scale(0.95); opacity: 0.85; }
          100% { transform: rotateY(0deg) scale(1.0); opacity: 1; }
        }
        .animate-emoji-open { animation: emoji-open 220ms ease-out; }
        .animate-emoji-close { animation: emoji-close 220ms ease-out; }

        /* --- Animations existantes --- */
        @keyframes fade-in-fast {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in-fast { animation: fade-in-fast 0.3s ease-in-out; }
        @keyframes menu-open {
          0% { opacity: 0; transform: scale(0.97); }
          100% { opacity: 1; transform: scale(1); }
        }
        .animate-menu-open { animation: menu-open 0.28s ease-out forwards; }
        @keyframes menu-close {
          0% { opacity: 1; transform: scale(1);}
          100% { opacity: 0; transform: scale(0.97);}
        }
        .animate-menu-close { animation: menu-close 0.25s ease-in forwards; }
        @keyframes fade-in-link {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-link { animation: fade-in-link 0.28s ease-out forwards; }
      `}</style>
    </div>
  );
}
