import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";

export default function EventPage() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from("event")
        .select("*")
        .order("dateDebut", { ascending: true });

      if (error) console.error("Erreur Supabase :", error);
      else setEvents(data);
    };

    fetchEvents();
  }, []);

  const eventsByMonth = events.reduce((acc, event) => {
    const month = format(parseISO(event.dateDebut), "MMMM yyyy", { locale: fr });
    if (!acc[month]) acc[month] = [];
    acc[month].push(event);
    return acc;
  }, {});

  return (
    <main className="min-h-screen bg-gray-50 p-6 animate-fade-in">
      <Layout>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-indigo-700 mb-8 animate-bounce-in">
          Événements à venir
        </h1>

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
      `}</style>
      </Layout>
    </main>
  );
}