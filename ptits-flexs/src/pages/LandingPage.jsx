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
      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser();
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
      setUpcomingEvents(events.filter(e => isAfter(parseISO(e.dateDebut), now)));

      const { data: remboursements } = await supabase
        .from("remboursement")
        .select("*")
        .or(`from_user.eq.${user.id},to_user.eq.${user.id}`);

      const totalDu = remboursements
        .filter((r) => r.to_user === user.id && r.status !== "remboursé")
        .reduce((sum, r) => sum + parseFloat(r.montant), 0);
      const totalDoi = remboursements
        .filter((r) => r.from_user === user.id && r.status !== "remboursé")
        .reduce((sum, r) => sum + parseFloat(r.montant), 0);

      setTotalMeDoit(totalDu);
      setTotalJeDois(totalDoi);
    };

    fetchAll();
  }, []);

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        <header className="text-center py-8">
         <h1
  className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-pink-500 to-yellow-500 animate-text-glow-float animate-float"
  style={{ fontFamily: "'Cal Sans', 'Acme', 'Ancizar Serif', sans-serif" }}
>
  Flex App
</h1>
          <p className="text-lg text-gray-600 mt-2 animate-slide-in">
            Joris passe en L3
          </p>
        </header>

        {userName && (
          <div className="text-center">
            <h2 className="text-xl font-semibold">Bienvenue {userName} 👋</h2>
            <div className="mt-4 flex flex-col sm:flex-row gap-3 justify-center items-center">
            <div className="rounded-full bg-green-100 border border-green-400 px-4 py-2 shadow text-green-700 flex flex-col items-center min-w-[110px] animate-fade-in-up">                
              <span className="font-semibold text-xs">On te doit</span>
                <AnimatedNumber value={totalMeDoit} className="text-lg font-bold" />
            </div>

              <div className="rounded-full bg-red-100 border border-red-400 px-4 py-2 shadow text-red-700 flex flex-col items-center min-w-[110px] animate-fade-in-up">
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

        <section className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4 text-indigo-600">Prochains événements</h2>
          <ul className="space-y-3">
            {upcomingEvents.length === 0 ? (
              <li className="text-gray-500 italic">Aucun événement prévu pour l'instant...</li>
            ) : (
              upcomingEvents.map((event) => (
                <li
                  key={event.id}
                  className="p-4 bg-gray-50 rounded-lg shadow hover:shadow-md transition-all animate-fade-in-up"
                >
                  <h3 className="text-lg font-semibold text-gray-800">{event.nom}</h3>
                  <p className="text-sm text-gray-600">
                    {format(parseISO(event.dateDebut), "eeee d MMMM yyyy", { locale: fr })} à {event.heure}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">{event.lieu}</p>
                </li>
              ))
            )}
          </ul>
        </section>

        <style>{`
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in { animation: fade-in 0.5s ease-out; }

          @keyframes float {
            0%   { transform: translateY(0); }
            50%  { transform: translateY(-8px); }
            100% { transform: translateY(0); }
          }

          .animate-float {
            animation: float 3s ease-in-out infinite;
          }

          @keyframes fade-in-up {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in-up { animation: fade-in-up 0.4s ease-out; }

          @keyframes bounce-in {
            0% { transform: scale(0.8); opacity: 0; }
            60% { transform: scale(1.1); opacity: 1; }
            100% { transform: scale(1); }
          }
          .animate-bounce-in { animation: bounce-in 0.6s ease; }

          @keyframes slide-in {
            from { transform: translateY(-10px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          .animate-slide-in { animation: slide-in 0.6s ease-out; }

          @keyframes text-glow {
          0%, 100% {
            filter: brightness(1);
          }
          50% {
            filter: brightness(1.3);
          }
        }
        .animate-text-glow {
          animation: text-glow 3s ease-in-out infinite;
        }

        @keyframes fade-glow {
      0%, 100% {
        opacity: 1;
        text-shadow: 0 0 15px rgba(99, 102, 241, 0.4);
      }
      50% {
        opacity: 0.9;
        text-shadow: 0 0 25px rgba(99, 102, 241, 0.7);
      }
    }
    .animate-fade-glow {
      animation: fade-glow 3s ease-in-out infinite;
    }

    @keyframes flicker {
  0%, 100% { opacity: 1; }
  40% { opacity: 0.8; }
  50% { opacity: 0.3; }
  60% { opacity: 1; }
  70% { opacity: 0.7; }
}
.animate-flicker {
  animation: flicker 2.5s infinite;
}

@keyframes bounce-scale {
  0% { transform: scale(0.95) translateY(0); }
  50% { transform: scale(1.05) translateY(-5px); }
  100% { transform: scale(1) translateY(0); }
}
.animate-bounce-scale {
  animation: bounce-scale 2s ease-in-out infinite;
}
        `}</style>
      </div>
    </Layout>
  );
}
