import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { toast, Toaster } from "sonner";

export default function EventPage() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [participations, setParticipations] = useState({});
  const [userMap, setUserMap] = useState({}); // id -> username

  useEffect(() => {
    const fetchAll = async () => {
      // événements
      const { data: evts, error: errE } = await supabase
        .from("event")
        .select("*")
        .order("dateDebut", { ascending: true });
      if (errE) console.error("Erreur Supabase (events):", errE);
      setEvents(evts || []);

      // users pour mapping username
      const { data: users } = await supabase
        .from("users_public")
        .select("id, username");
      const map = Object.fromEntries((users || []).map((u) => [u.id, u.username]));
      setUserMap(map);

      // participations (sans join)
      const { data: parts, error: errP } = await supabase
        .from("event_participation")
        .select("event_id, status, user_id");
      if (errP) {
        toast.error("Erreur de la base de données : " + errP.message);
      } else {
        const grouped = (parts || []).reduce((acc, p) => {
          if (!acc[p.event_id]) acc[p.event_id] = [];
          acc[p.event_id].push(p);
          return acc;
        }, {});
        setParticipations(grouped);
      }
    };

    fetchAll();
  }, []);

  const refreshParticipations = async () => {
    const { data, error } = await supabase
      .from("event_participation")
      .select("event_id, status, user_id");
    if (!error) {
      const grouped = (data || []).reduce((acc, p) => {
        if (!acc[p.event_id]) acc[p.event_id] = [];
        acc[p.event_id].push(p);
        return acc;
      }, {});
      setParticipations(grouped);
    }
  };

  const handleParticipation = async (eventId, status) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("event_participation")
      .upsert(
        { event_id: eventId, user_id: user.id, status },
        { onConflict: ["event_id", "user_id"] }
      );

    if (error) {
      toast.error("Erreur lors de l'enregistrement : " + error.message);
    } else {
      toast.success("Participation enregistrée !");
      refreshParticipations();
    }
  };

  const eventsByMonth = events.reduce((acc, event) => {
    const month = format(parseISO(event.dateDebut), "MMMM yyyy", { locale: fr });
    if (!acc[month]) acc[month] = [];
    acc[month].push(event);
    return acc;
  }, {});

  return (
    <main className="min-h-screen p-6 animate-fade-in">
      <Layout>
        <Toaster position="top-right" />
        <div className="relative min-h-screen flex flex-col">
          {/* Décor été derrière le contenu */}
          <div className="sun-emoji">☀️</div>
          <div className="floating-emoji" style={{ top: "20%", left: "8%" }}>
            ⛱️
          </div>
          <div className="floating-emoji" style={{ top: "48%", left: "82%" }}>
            🛟
          </div>
          <div className="floating-emoji" style={{ top: "66%", left: "26%" }}>
            ⛱️
          </div>
          <div className="floating-emoji" style={{ top: "38%", left: "60%" }}>
            🏖️
          </div>

          {/* Contenu centré */}
          <div className="max-w-3xl mx-auto w-full relative z-10 text-center">
            <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-[#ff7e3e] via-[#ff9e2c] to-[#fb8500] animate-summer-glow">
              ¡Planes al sol!
            </h1>
            <h2 className="text-base mb-8 opacity-80">
              Organizamos sin dramas — playas, tapas y amigos ☀️
            </h2>

            <div className="mb-8 flex justify-center">
              <Calendar
                onChange={setSelectedDate}
                value={selectedDate}
                className="rounded-lg shadow bg-white p-2"
                tileClassName={({ date, view }) => {
                  if (view !== "month") return null;
                  const isInEventRange = events.some((event) => {
                    const start = parseISO(event.dateDebut);
                    const end = event.dateFin ? parseISO(event.dateFin) : start;
                    return (
                      date >= new Date(start.setHours(0, 0, 0, 0)) &&
                      date <= new Date(end.setHours(23, 59, 59, 999))
                    );
                  });
                  return isInEventRange ? "highlight-event-day" : null;
                }}
                onClickDay={(date) => {
                  const matchedEvent = events.find((event) => {
                    const start = parseISO(event.dateDebut);
                    const end = event.dateFin ? parseISO(event.dateFin) : start;
                    return (
                      date >= new Date(start.setHours(0, 0, 0, 0)) &&
                      date <= new Date(end.setHours(23, 59, 59, 999))
                    );
                  });
                  if (matchedEvent) {
                    const el = document.getElementById(`event-${matchedEvent.id}`);
                    if (el) {
                      el.scrollIntoView({ behavior: "smooth", block: "start" });
                      setSelectedEvent(matchedEvent);
                    }
                  }
                }}
              />
            </div>

            {Object.entries(eventsByMonth).map(([month, monthEvents]) => (
              <div key={month} className="mb-10">
                <h2 className="text-2xl font-semibold text-[#a14d06] mb-4 border-b pb-1">
                  {month}
                </h2>
                <div className="grid gap-4 justify-center">
                  {monthEvents.map((event) => {
                    const isOpen = selectedEvent?.id === event.id;
                    return (
                      <Card
                        id={`event-${event.id}`}
                        key={event.id}
                        className="max-w-md w-full mx-auto transition-all duration-300 shadow hover:shadow-lg cursor-pointer summer-item"
                      >
                        <CardContent
                          className="p-4"
                          onClick={() => setSelectedEvent(isOpen ? null : event)}
                        >
                          <p className="text-lg font-medium text-gray-800">
                            {event.nom}
                          </p>

                          {isOpen && (
                            <div className="mt-3 text-sm text-gray-700 space-y-2 animate-fade-in-up text-left">
                              <p>
                                <strong>Date :</strong>{" "}
                                {format(parseISO(event.dateDebut), "PPP", {
                                  locale: fr,
                                })}{" "}
                                {event.dateFin &&
                                  event.dateFin !== event.dateDebut && (
                                    <>
                                      {"→ "}
                                      {format(parseISO(event.dateFin), "PPP", {
                                        locale: fr,
                                      })}
                                    </>
                                  )}
                              </p>
                              <p>
                                <strong>Heure :</strong> {event.heure}
                              </p>
                              <p>
                                <strong>Lieu :</strong> {event.lieu}
                              </p>

                              <div className="mt-3 flex flex-wrap gap-2 justify-center">
                                <Button
                                  onClick={() =>
                                    handleParticipation(event.id, "going")
                                  }
                                  className="bg-orange-500 hover:bg-orange-600 text-white"
                                >
                                  ✅ Je viens
                                </Button>
                                <Button
                                  onClick={() =>
                                    handleParticipation(event.id, "maybe")
                                  }
                                  variant="outline"
                                >
                                  🤔 Peut-être
                                </Button>
                                <Button
                                  onClick={() =>
                                    handleParticipation(event.id, "not_going")
                                  }
                                  variant="destructive"
                                >
                                  ❌ Pas dispo
                                </Button>
                              </div>

                              {participations[event.id]?.length > 0 && (
                                <div className="mt-3 text-sm text-gray-800 space-y-1">
                                  <p className="font-medium">👥 Participants :</p>
                                  {participations[event.id].map((p) => (
                                    <p key={`${p.event_id}-${p.user_id}`}>
                                      {p.status === "going" && "✅ "}
                                      {p.status === "maybe" && "🤔 "}
                                      {p.status === "not_going" && "❌ "}
                                      {userMap[p.user_id] || "Personne"}
                                    </p>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Vagues en bas, full-width */}
          <div className="full-bleed-waves" aria-hidden />

          {/* Styles */}
          <style>{`
            /* ===== Animations ===== */
            @keyframes fade-in {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            .animate-fade-in { animation: fade-in 0.35s ease-out; }

            @keyframes fade-in-up {
              from { opacity: 0; transform: translateY(20px); }
              to { opacity: 1; transform: translateY(0); }
            }
            .animate-fade-in-up { animation: fade-in-up 0.45s ease-out; }

            @keyframes bounce-in {
              0% { transform: scale(0.9); opacity: 0; }
              60% { transform: scale(1.05); opacity: 1; }
              100% { transform: scale(1); }
            }
            .animate-bounce-in { animation: bounce-in 0.6s ease; }

            @keyframes summer-glow {
              0%, 100% { text-shadow: 0 0 10px rgba(251, 133, 0, 0.35); }
              50% { text-shadow: 0 0 18px rgba(255, 183, 3, 0.45); }
            }
            .animate-summer-glow { animation: summer-glow 3.2s ease-in-out infinite; }

            @keyframes sun-spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }

            @keyframes floaty {
              0%, 100% { transform: translateY(0) translateX(0); }
              50% { transform: translateY(-14px) translateX(10px); }
            }

            /* ===== Calendar highlight ===== */
            .highlight-event-day {
              background: linear-gradient(180deg, #ffe3c1, #ffd2a1);
              border-radius: 10px;
              font-weight: 600;
            }
            .react-calendar__tile:has(.highlight-event-day):hover,
            .react-calendar__tile:hover .highlight-event-day {
              filter: brightness(0.98);
            }

            /* ===== Cards été ===== */
            .summer-item {
              background: linear-gradient(
                180deg,
                rgba(255, 126, 62, 0.10),
                rgba(251, 133, 0, 0.10)
              );
              border: 1px solid rgba(251, 133, 0, 0.25);
            }

            /* ===== Soleil + emojis flottants (derrière contenu) ===== */
            .sun-emoji {
              position: absolute;
              top: 10px;
              right: 10px;
              font-size: 3rem;
              animation: sun-spin 20s linear infinite;
              z-index: 0;
              opacity: 0.85;
              pointer-events: none;
              user-select: none;
            }
            .floating-emoji {
              position: absolute;
              font-size: 2rem;
              opacity: 0.7;
              animation: floaty 12s ease-in-out infinite;
              z-index: 0;
              pointer-events: none;
              user-select: none;
            }

            /* ===== Vagues full-bleed ===== */
            .full-bleed-waves {
              position: relative;
              left: 50%;
              margin-left: -50vw;
              width: 100vw;
              height: 140px;
              background:
                url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320'><path fill='%23a8dadc' fill-opacity='0.9' d='M0,288L48,261.3C96,235,192,181,288,181.3C384,181,480,235,576,224C672,213,768,139,864,133.3C960,128,1056,192,1152,213.3C1248,235,1344,213,1392,202.7L1440,192L1440,320L0,320Z'/></svg>")
                  bottom/100% 140px no-repeat,
                url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320'><path fill='%238ecae6' fill-opacity='0.8' d='M0,288L60,272C120,256,240,224,360,197.3C480,171,600,149,720,165.3C840,181,960,235,1080,229.3C1200,224,1320,160,1380,128L1440,96L1440,320L0,320Z'/></svg>")
                  bottom/100% 140px no-repeat;
            }
          `}</style>
        </div>
      </Layout>
    </main>
  );
}
