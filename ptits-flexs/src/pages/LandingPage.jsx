import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Layout from "@/components/Layout";
import { format, parseISO, isAfter } from "date-fns";
import { fr } from "date-fns/locale";
import { AnimatedNumber } from "@/components/personal-ui/AnimatedNumber";

export default function LandingPage() {
  const [userName, setUserName] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [totalMeDoit, setTotalMeDoit] = useState(0);
  const [totalJeDois, setTotalJeDois] = useState(0);

  useEffect(() => {
    const fetchAll = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (!user || userError) return;

      setIsLoggedIn(true);

      const { data: publicUser } = await supabase
        .from("users_public")
        .select("username")
        .eq("id", user.id)
        .single();
      setUserName(publicUser?.username || user.email);

      const { data: events } = await supabase
        .from("event")
        .select("*")
        .order("dateDebut", { ascending: true });

      const now = new Date();
      setUpcomingEvents((events || []).filter((e) => {
        try { return isAfter(parseISO(e.dateDebut), now); }
        catch { return false; }
      }));

      const { data: remboursements } = await supabase
        .from("remboursement")
        .select("*")
        .or(`from_user.eq.${user.id},to_user.eq.${user.id}`);

      const list = remboursements || [];
      const totalDu = list
        .filter((r) => r.to_user === user.id && r.status !== "remboursé")
        .reduce((sum, r) => sum + parseFloat(r.montant), 0);
      const totalDoi = list
        .filter((r) => r.from_user === user.id && r.status !== "remboursé")
        .reduce((sum, r) => sum + parseFloat(r.montant), 0);

      setTotalMeDoit(totalDu);
      setTotalJeDois(totalDoi);
    };

    fetchAll();
  }, []);

  return (
    <Layout>
      <div className="relative min-h-screen flex flex-col overflow-hidden">
        {/* Soleil fixe */}
        <div className="sun-emoji">☀️</div>

        {/* Parasols & bouées flottants */}
        <div className="floating-emoji" style={{ top: "20%", left: "10%" }}>⛱️</div>
        <div className="floating-emoji" style={{ top: "50%", left: "80%" }}>🏖️</div>
        <div className="floating-emoji" style={{ top: "70%", left: "30%" }}>🛟</div>
        <div className="floating-emoji" style={{ top: "40%", left: "60%" }}>⛱️</div>

        <main className="flex-1 space-y-8 animate-fade-in px-4 sm:px-6 lg:px-8 pb-28 relative z-10">
          <header className="text-center py-10">
            <h1
              className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-[#ff7e3e] via-[#ff9e2c] to-[#fb8500] animate-summer-glow"
              style={{ fontFamily: "'Cal Sans', 'Acme', 'Ancizar Serif', sans-serif" }}
            >
              Flex App ¡verano!
            </h1>
            <p className="mt-2 text-lg text-gray-700 animate-slide-in">
              Tapas, playa, y organización sin dramas (por favor)☀️
            </p>
          </header>

          {userName && (
            <div className="text-center">
              <h2 className="text-xl font-semibold">Bienvenido {userName} 👋</h2>

              <div className="mt-4 flex flex-col sm:flex-row gap-3 justify-center items-center">
                <div className="rounded-full bg-green-100 border border-green-400 px-4 py-2 shadow text-green-700 flex flex-col items-center min-w-[120px] animate-fade-in-up">
                  <span className="font-semibold text-xs">On te doit</span>
                  <AnimatedNumber value={totalMeDoit} className="text-lg font-bold" />
                </div>

                <div className="rounded-full bg-red-100 border border-red-400 px-4 py-2 shadow text-red-700 flex flex-col items-center min-w-[120px] animate-fade-in-up">
                  <span className="font-semibold text-xs">Tu dois</span>
                  <span className="text-lg font-bold">
                    <AnimatedNumber value={totalJeDois} />
                  </span>
                </div>
              </div>

              <div className="mt-2 animate-fade-in-up">
                <p className="text-lg font-bold">
                  Solde net : <AnimatedNumber value={totalMeDoit - totalJeDois} />
                </p>
              </div>
            </div>
          )}

          <section className="rounded-xl shadow-lg p-6 summer-card">
            <h2 className="text-2xl font-bold mb-4 text-[#5a1e02]">Próximos eventos</h2>
            <ul className="space-y-3">
              {upcomingEvents.length === 0 ? (
                <li className="text-gray-500 italic">Aucun événement prévu pour l'instant...</li>
              ) : (
                upcomingEvents.map((event) => (
                  <li
                    key={event.id}
                    className="p-4 rounded-lg shadow hover:shadow-md transition-all animate-fade-in-up summer-item"
                  >
                    <h3 className="text-lg font-semibold">{event.nom}</h3>
                    <p className="text-sm text-gray-600">
                      {format(parseISO(event.dateDebut), "eeee d MMMM yyyy", { locale: fr })} à {event.heure}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">{event.lieu}</p>
                  </li>
                ))
              )}
            </ul>
          </section>
        </main>

        <div className="full-bleed-waves" aria-hidden />

        <style>{`
          .animate-fade-in { animation: fade-in 0.5s ease-out; }
          @keyframes fade-in { from { opacity: 0; transform: translateY(20px);} to { opacity:1; transform: translateY(0);} }
          @keyframes slide-in { from { transform: translateY(-10px); opacity:0;} to { transform: translateY(0); opacity:1;} }
          .animate-slide-in { animation: slide-in 0.6s ease-out; }
          @keyframes summer-glow {
            0%,100% { text-shadow: 0 0 10px rgba(251, 133, 0, 0.35); }
            50% { text-shadow: 0 0 18px rgba(255, 183, 3, 0.45); }
          }
          .animate-summer-glow { animation: summer-glow 3.2s ease-in-out infinite; }

          .summer-card {
            background: linear-gradient(180deg, rgba(255,126,62,0.10), rgba(251,133,0,0.16));
            border: 1px solid rgba(251,133,0,0.3);
            backdrop-filter: blur(4px);
          }
          .summer-item {
            background: linear-gradient(180deg, rgba(255,126,62,0.10), rgba(251,133,0,0.10));
            border: 1px solid rgba(251,133,0,0.25);
          }

          .sun-emoji {
            position: absolute;
            top: 10px;
            right: 10px;
            font-size: 3rem;
            animation: sun-spin 20s linear infinite;
            z-index: 0;
            opacity: 0.8;
          }
          @keyframes sun-spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          .floating-emoji {
            position: absolute;
            font-size: 2rem;
            opacity: 0.7;
            animation: floaty 12s ease-in-out infinite;
            z-index: 0;
          }
          @keyframes floaty {
            0%, 100% { transform: translateY(0) translateX(0); }
            50% { transform: translateY(-15px) translateX(10px); }
          }

          .full-bleed-waves {
            position: relative;
            left: 50%;
            margin-left: -50vw;
            width: 100vw;
            height: 140px;
            background:
              url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320'><path fill='%23a8dadc' fill-opacity='0.9' d='M0,288L48,261.3C96,235,192,181,288,181.3C384,181,480,235,576,224C672,213,768,139,864,133.3C960,128,1056,192,1152,213.3C1248,235,1344,213,1392,202.7L1440,192L1440,320L0,320Z'/></svg>")
                bottom/100% 140px no-repeat;
          }
        `}</style>
      </div>
    </Layout>
  );
}
