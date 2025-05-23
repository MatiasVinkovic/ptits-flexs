import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import Layout from "@/components/Layout";

const CreateEventPage = () => {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(""); // dateDebut
  const [endDate, setEndDate] = useState(""); // dateFin
  const [time, setTime] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { data, error } = await supabase.from("event").insert([
      {
        nom: title,
        dateDebut: date,
        dateFin: endDate,
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
      setDate("");
      setEndDate("");
      setTime("");
      setDescription("");
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center py-10 px-4 animate-fade-in">
      <Layout>
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 space-y-6 animate-pop-in">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-indigo-700 mb-2">Créer un événement</h1>
          <p className="text-sm text-gray-500 font-light">
            Renseigne les informations de l'événement à venir
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">Titre</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Nom de l'événement"
            />
          </div>
          <div>
            <Calendar
              value={date}
              onChange={(e) => setDate(e.target.value)}
              label="Date de début"
            />
          </div>
          <div>
            <Calendar
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              label="Date de fin"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">Heure</label>
            <Input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">Lieu</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Lieu de l'événement"
            />
          </div>
          <div className="flex justify-center">
            <Button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg shadow transition"
            >
              Créer l'événement
            </Button>
          </div>
        </form>
      </div>
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pop-in {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in { animation: fade-in 0.6s ease-out; }
        .animate-pop-in { animation: pop-in 0.5s ease-out; }
      `}</style>
      </Layout>
    </main>
  );
};

export default CreateEventPage;
