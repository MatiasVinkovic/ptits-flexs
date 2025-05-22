import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { format, parseISO } from "date-fns";    
import { fr } from "date-fns/locale";

const EventPage = () => {
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

  // Grouper les événements par mois
  const eventsByMonth = events.reduce((acc, event) => {
    const month = format(parseISO(event.dateDebut), "MMMM yyyy", { locale: fr });
    if (!acc[month]) acc[month] = [];
    acc[month].push(event);
    return acc;
  }, {});

  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        
        <h1
            className="text-3xl font-bold text-gray-800 mb-6 text-center animate-slide-down"
            >
            Événements à venir
        </h1>

        {Object.entries(eventsByMonth).map(([month, monthEvents]) => (
          <div key={month} className="mb-8">
            <h2 className="text-xl font-semibold text-indigo-600 mb-3">{month}</h2>
            <div className="space-y-4">
              {monthEvents.map((event) => {
            const isOpen = selectedEvent?.id === event.id;

            return (
                <div
                key={event.id}
                className="bg-white rounded-xl shadow transition-all overflow-hidden"
                >
                <button
                    onClick={() => setSelectedEvent(isOpen ? null : event)}
                    className="w-full text-left p-4 cursor-pointer hover:bg-gray-100"
                >
                    <p className="text-lg font-medium text-gray-800">{event.nom}</p>
                    <p className="text-sm text-gray-500">
                    {format(parseISO(event.dateDebut), "eeee d MMMM", { locale: fr })} à {event.heure}
                    </p>
                </button>

                <div
                    className={`px-4 overflow-hidden transition-all duration-500 ease-in-out ${
                        isOpen ? "max-h-48 opacity-100 py-4" : "max-h-0 opacity-0 py-0"
                    }`}
                    >
                    <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Date :</strong> {format(parseISO(event.dateDebut), "PPP", { locale: fr })}</p>
                    <p><strong>Heure :</strong> {event.heure}</p>
                    <p><strong>Lieu :</strong> {event.lieu}</p>
                    </div>
                </div>
                </div>
            );
            })}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
};

export default EventPage;