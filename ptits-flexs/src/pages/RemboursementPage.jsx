import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Layout from "@/components/Layout";

export default function RemboursementPage() {
  const [montant, setMontant] = useState("");
  const [fromUser, setFromUser] = useState("");
  const [description, setDescription] = useState("");
  const [users, setUsers] = useState([]);
  const [userMap, setUserMap] = useState({});
  const [remboursements, setRemboursements] = useState([]);
  const [me, setMe] = useState(null);
  const [totalMeDoit, setTotalMeDoit] = useState(0);
  const [totalJeDois, setTotalJeDois] = useState(0);
  

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser();
      if (userError || !user) return;
      setMe(user);

      const { data: allUsers } = await supabase
        .from("users_public")
        .select("id, username");

      setUsers(allUsers.filter((u) => u.id !== user.id));
      setUserMap(Object.fromEntries(allUsers.map((u) => [u.id, u.username])));

      const { data: myRembs } = await supabase
        .from("remboursement")
        .select("*")
        .or(`from_user.eq.${user.id},to_user.eq.${user.id}`)
        .order("created_at", { ascending: false });

      setRemboursements(myRembs);

      const totalDu = myRembs
        .filter((r) => r.to_user === user.id && r.status !== "remboursé")
        .reduce((sum, r) => sum + parseFloat(r.montant), 0);

      const totalDoi = myRembs
        .filter((r) => r.from_user === user.id && r.status !== "remboursé")
        .reduce((sum, r) => sum + parseFloat(r.montant), 0);

      setTotalMeDoit(totalDu);
      setTotalJeDois(totalDoi);
    };

    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from("remboursement").insert([
      {
        from_user: fromUser,
        to_user: me.id,
        montant: parseFloat(montant),
        description,
        status: "à payer"
      },
    ]);
    if (error) {
      toast.error("Erreur lors de l'ajout du remboursement");
      console.error(error);
    } else {
      toast.success("Remboursement ajouté avec succès");
      
      setMontant("");
      setFromUser("");
      setDescription("");
      window.location.reload();
    }
  };

  const markAsPaid = async (id) => {
    const { error } = await supabase
      .from("remboursement")
      .update({ status: "remboursé" })
      .eq("id", id);

    if (error) {
    
      toast.error("Erreur lors de la mise à jour du remboursement");
    } else {
      
      toast.success("Remboursement marqué comme remboursé");
      window.location.reload();
    }
  };

  return (
    
    <div className="max-w-2xl mx-auto p-6 space-y-6 animate-fade-in">
    <Layout>
      <h1 className="text-4xl font-bold text-center text-indigo-700 mb-8 animate-bounce-in">Quoi me doit de la thune ?</h1>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-4 rounded-xl shadow">
        <div>
          <label className="block mb-1 text-sm font-medium">Qui te doit ?</label>
          <select
            value={fromUser}
            onChange={(e) => setFromUser(e.target.value)}
            className="border rounded px-3 py-2 w-full"
            required
          >
            <option value="">-- Choisir une personne --</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.username}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium">Montant (€)</label>
          <Input
            type="number"
            value={montant}
            onChange={(e) => setMontant(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium">Description</label>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ex: Courses, resto..."
          />
        </div>
        <div className="flex justify-center">
          <Button type="submit" className="bg-black text-white px-6 py-2 rounded-lg shadow">
            Donne l'argent !
          </Button>
        </div>
      </form>

      <div className="text-center bg-gray-50 py-6 rounded-lg shadow-md">
        <p className="text-green-600 text-xl font-semibold">On te doit : {totalMeDoit.toFixed(2)} €</p>
        <p className="text-red-600 text-xl font-semibold">Tu dois : {totalJeDois.toFixed(2)} €</p>
        <p className="text-2xl font-bold mt-2">
          Solde net : {(totalMeDoit - totalJeDois).toFixed(2)} €
        </p>
      </div>

      <h2 className="text-xl font-semibold mb-2">Mes remboursements</h2>
      <ul className="space-y-2">
        {remboursements.map((r) => (
          <li key={r.id} className="bg-white rounded-xl shadow p-4">
            <p>
              <strong>
                {r.to_user === me.id
                  ? `${userMap[r.from_user] || "Quelqu'un"} te doit`
                  : `Tu dois à ${userMap[r.to_user] || "quelqu'un"}`} :
              </strong>{" "}
              {r.montant} €
            </p>
            <p className="text-sm text-gray-500">{r.description}</p>
            <p className="text-xs text-gray-400">
              {new Date(r.created_at).toLocaleDateString()} - {r.status || "à payer"}
            </p>
            {r.to_user === me.id && r.status !== "remboursé" && (
              <Button
                size="sm"
                className="mt-2"
                onClick={() => markAsPaid(r.id)}
              >
                Marquer comme remboursé
              </Button>
            )}
          </li>
        ))}
      </ul>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
      </Layout>
    </div>
  );
}