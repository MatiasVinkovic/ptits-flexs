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

  useEffect(() => {
    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from("event")
        .select("*")
        .order("dateDebut", { ascending: true });

      if (error) console.error("Erreur Supabase :", error);
      else setEvents(data);
    };

    const fetchParticipations = async () => {
      const { data, error } = await supabase
        .from("event_participation")
        .select("event_id, status, user_id");

      if (!error) {
        const grouped = data.reduce((acc, p) => {
          if (!acc[p.event_id]) acc[p.event_id] = [];
          acc[p.event_id].push(p);
          return acc;
        }, {});
        setParticipations(grouped);
      } else {
        toast.error("Erreur de la base de données : " + error.message);
      }
    };

    fetchEvents();
    fetchParticipations();
  }, []);

  const handleParticipation = async (eventId, status) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("event_participation")
      .upsert(
        {
          event_id: eventId,
          user_id: user.id,
          status: status,
        },
        { onConflict: ["event_id", "user_id"] }
      );

    if (error) {
      toast.error("Erreur lors de l'enregistrement : " + error.message);
    } else {
      toast.success("Participation enregistrée !");
      // Refresh participation list
      const { data, error } = await supabase
        .from("event_participation")
        .select("event_id, status, user_id, users_public(username)");

      if (!error) {
        const grouped = data.reduce((acc, p) => {
          if (!acc[p.event_id]) acc[p.event_id] = [];
          acc[p.event_id].push(p);
          return acc;
        }, {});
        setParticipations(grouped);
      }
    }
  };

  const eventsByMonth = events.reduce((acc, event) => {
    const month = format(parseISO(event.dateDebut), "MMMM yyyy", { locale: fr });
    if (!acc[month]) acc[month] = [];
    acc[month].push(event);
    return acc;
  }, {});

  return (
    <main className="min-h-screen bg-gray-50 p-6 animate-fade-in">
      <Layout>
        <Toaster position="top-right" />
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-center text-indigo-700 mb-8 animate-bounce-in">
            Événements à venir
          </h1>
          <h2 className="text-xl font-semibold text-gray-700 mb-2 text-center">
            Calendrier des Ptits Flexs
          </h2>

          <div className="mb-8 flex justify-center">
            <Calendar
              onChange={setSelectedDate}
              value={selectedDate}
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
              <h2 className="text-2xl font-semibold text-indigo-600 mb-4 border-b pb-1">
                {month}
              </h2>
              <div className="grid gap-4">
                {monthEvents.map((event) => {
                  const isOpen = selectedEvent?.id === event.id;

                  return (
                    <Card
                      id={`event-${event.id}`}
                      key={event.id}
                      className="transition-all duration-300 shadow hover:shadow-lg cursor-pointer"
                    >
                      <CardContent
                        className="p-4"
                        onClick={() => setSelectedEvent(isOpen ? null : event)}
                      >
                        <div className="flex items-center justify-center">
                          <p className="text-lg font-medium text-gray-800 text-center">
                            {event.nom}
                          </p>
                        </div>
                        {isOpen && (
                          <div className="mt-3 text-sm text-gray-600 space-y-1 animate-fade-in-up">
                            <p>
                              <strong>Date :</strong>{" "}
                              {format(parseISO(event.dateDebut), "PPP", { locale: fr })}{" "}
                              {event.dateFin && event.dateFin !== event.dateDebut && (
                                <>
                                  {"→ "}
                                  {format(parseISO(event.dateFin), "PPP", { locale: fr })}
                                </>
                              )}
                            </p>
                            <p>
                              <strong>Heure :</strong> {event.heure}
                            </p>
                            <p>
                              <strong>Lieu :</strong> {event.lieu}
                            </p>

                            <div className="mt-3 flex flex-wrap gap-2">
                              <Button onClick={() => handleParticipation(event.id, "going")} variant="default">
                                ✅ Je viens
                              </Button>
                              <Button onClick={() => handleParticipation(event.id, "maybe")} variant="outline">
                                🤔 Peut-être
                              </Button>
                              <Button onClick={() => handleParticipation(event.id, "not_going")} variant="destructive">
                                ❌ Pas dispo
                              </Button>
                            </div>

                            {participations[event.id]?.length > 0 && (
                              <div className="mt-3 text-sm text-gray-700 space-y-1">
                                <p className="font-medium">👥 Participants :</p>
                                {participations[event.id].map((p) => (
                                  <p key={p.user_id}>
                                    {p.status === "going" && "✅ "}
                                    {p.status === "maybe" && "🤔 "}
                                    {p.status === "not_going" && "❌ "}
                                    {p.users_public?.username || "Personne"}
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

        <style>{`
          @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes fade-in-up {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes bounce-in {
            0% { transform: scale(0.9); opacity: 0; }
            60% { transform: scale(1.05); opacity: 1; }
            100% { transform: scale(1); }
          }
          .animate-fade-in { animation: fade-in 0.4s ease-out; }
          .animate-fade-in-up { animation: fade-in-up 0.5s ease-out; }
          .animate-bounce-in { animation: bounce-in 0.6s ease; }

          .highlight-event-day {
            background-color: #eef2ff;
            border-radius: 10px;
            font-weight: bold;
            transition: background 0.2s ease;
          }

          .react-calendar__tile:hover .highlight-event-day {
            background-color: #dbeafe;
          }
        `}</style>
      </Layout>
    </main>
  );
}