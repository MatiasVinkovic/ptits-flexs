import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { supabase } from "@/lib/supabaseClient";

const CreateEventPage = () => {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(null);
  const [time, setTime] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { data, error } = await supabase.from("event").insert([
      {
        nom: title,
        dateDebut: date?.toISOString().split("T")[0],
        heure: time,
        lieu: description || "Non spécifié"
      }
    ]);

    if (error) {
      console.error("Erreur création événement :", error.message);
      alert("Erreur lors de la création de l'événement.");
    } else {
      alert("Événement créé !");
      setTitle("");
      setDate(null);
      setTime("");
      setDescription("");
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center py-10 px-4 animate-fade-in">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Créer un événement</h1>
          <p className="text-sm text-gray-500">
            Renseigne les informations de l'événement à venir
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Titre</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Nom de l'événement"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Date</label>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
              locale={fr}
            />
            {date && (
              <p className="text-sm text-gray-600 mt-1">
                Date choisie : {format(date, "PPP", { locale: fr })}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Heure</label>
            <Input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Lieu</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Lieu de l'événement"
            />
          </div>
          <Button type="submit" className="w-full">
            Créer l'événement
          </Button>
        </form>
      </div>
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease;
        }
      `}</style>
    </main>
  );
};

export default CreateEventPage;
