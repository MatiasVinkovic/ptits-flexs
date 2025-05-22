import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Phone } from "lucide-react";
import { motion } from "framer-motion";

export default function AnnuairePage() {
  const [annuaire, setAnnuaire] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchAnnuaire = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("users_public")
        .select("username, phone_number");

      if (error) {
        setMessage("Erreur lors du chargement de l'annuaire.");
        setLoading(false);
        return;
      }

      setAnnuaire(data);
      setLoading(false);
    };

    fetchAnnuaire();
  }, []);

  const formatPhoneNumber = (num) => {
  if (!num) return "—";
  const str = 0 + String(num).replace(/\s/g, "");
   // au cas où il y a déjà des espaces
  return str.match(/.{1,2}/g)?.join(" ") || str;
};

  return (
    <main className="min-h-screen p-6 bg-gray-100">
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-lg p-6">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          📒 Annuaire
        </h1>

        {loading ? (
          <p className="text-center text-gray-500 animate-pulse">Chargement...</p>
        ) : annuaire.length === 0 ? (
          <p className="text-center text-gray-600">Aucun utilisateur trouvé.</p>
        ) : (
          <ul className="space-y-4">
            {annuaire.map((user, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, translateY: 10 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between bg-gray-50 p-4 rounded-lg shadow-sm hover:shadow-md transition"
              >
                <span className="font-medium text-gray-800">{user.username}</span>
                <span className="flex items-center gap-2 text-gray-600 text-sm">
                  <Phone size={16} className="text-blue-500" />
                  {formatPhoneNumber(user.phone_number)}
                </span>
              </motion.li>
            ))}
          </ul>
        )}

        {message && (
          <p className="text-center text-sm text-red-500 mt-4">{message}</p>
        )}
      </div>
    </main>
  );
}