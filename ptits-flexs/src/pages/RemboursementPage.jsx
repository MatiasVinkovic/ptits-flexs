import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Layout from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";

export default function RemboursementPage() {
  // Mode 1 (ajout simple)
  const [montant, setMontant] = useState("");
  const [fromUser, setFromUser] = useState([]); // IDs débiteurs (mode 1)
  const [description, setDescription] = useState(""); // texte description

  // Mode 2 (split)
  const [payerId, setPayerId] = useState(""); // ID payeur
  const [participants, setParticipants] = useState([]); // IDs participants

  // Données & résumé
  const [users, setUsers] = useState([]);
  const [userMap, setUserMap] = useState({});
  const [remboursements, setRemboursements] = useState([]);
  const [me, setMe] = useState(null);
  const [totalMeDoit, setTotalMeDoit] = useState(0);
  const [totalJeDois, setTotalJeDois] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) return;
      setMe(user);

      const { data: allUsers = [] } = await supabase
        .from("users_public")
        .select("id, username");

      const map = Object.fromEntries((allUsers || []).map(u => [u.id, u.username]));
      setUserMap(map);
      setUsers((allUsers || []).filter(u => u.id !== user.id));

      const { data: myRembs = [] } = await supabase
        .from("remboursement")
        .select("*")
        .or(`from_user.eq.${user.id},to_user.eq.${user.id}`)
        .order("created_at", { ascending: false });

      setRemboursements(myRembs);

      const totalDu = myRembs
        .filter(r => r.to_user === user.id && r.status !== "remboursé")
        .reduce((sum, r) => sum + parseFloat(r.montant), 0);
      const totalDoi = myRembs
        .filter(r => r.from_user === user.id && r.status !== "remboursé")
        .reduce((sum, r) => sum + parseFloat(r.montant), 0);

      setTotalMeDoit(totalDu);
      setTotalJeDois(totalDoi);
    };

    fetchData();
  }, []);

  // --- Actions ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!Array.isArray(fromUser) || fromUser.length === 0) {
      toast.error("Sélectionne au moins une personne.");
      return;
    }
    if (!me?.id) return;

    const inserts = fromUser.map((id) => ({
      from_user: id,
      to_user: me.id,
      montant: parseFloat(montant),
      description,
      status: "à payer",
    }));

    const { error } = await supabase.from("remboursement").insert(inserts);
    if (error) {
      toast.error("Erreur lors de l'ajout des remboursements");
      console.error(error);
    } else {
      toast.success("Remboursements ajoutés avec succès");
      setMontant("");
      setFromUser([]);
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

  const handleSplit = async () => {
    if (!montant || !payerId || participants.length === 0) {
      toast.error("Remplis tous les champs !");
      return;
    }
    const total = parseFloat(montant);
    const involved = participants.filter(id => id !== payerId); // pas de dette pour le payeur
    if (involved.length === 0) {
      toast.error("Il faut au moins un participant différent du payeur.");
      return;
    }

    // Split simple à 2 décimales
    const split = +(total / participants.length).toFixed(2);

    const insertions = involved.map((id) => ({
      from_user: id,
      to_user: payerId,
      montant: split,
      description: "Split automatique",
      status: "à payer",
    }));

    const { error } = await supabase.from("remboursement").insert(insertions);
    if (error) {
      toast.error("Erreur lors du split");
      console.error(error);
    } else {
      toast.success("Split ajouté !");
      setMontant("");
      setPayerId("");
      setParticipants([]);
      window.location.reload();
    }
  };

  return (
    <div>
      <Layout>
        <div className="relative min-h-screen flex flex-col overflow-hidden">
          {/* Décor été (toujours actif) */}
          <div className="sun-emoji">☀️</div>
          <div className="floating-emoji" style={{ top: "22%", left: "8%" }}>⛱️</div>
          <div className="floating-emoji" style={{ top: "50%", left: "82%" }}>🛟</div>
          <div className="floating-emoji" style={{ top: "68%", left: "28%" }}>⛱️</div>
          <div className="floating-emoji" style={{ top: "40%", left: "60%" }}>🏖️</div>

          <div className="w-full flex justify-center relative z-10">
            <Tabs defaultValue="mode1" className="w-fit mx-auto">
              <div className="flex justify-center">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="mode1">Une personne</TabsTrigger>
                  <TabsTrigger value="mode2">Split</TabsTrigger>
                </TabsList>
              </div>

              {/* MODE 1 : Ajout simple */}
              <TabsContent value="mode1">
                <div className="max-w-2xl mx-auto p-6 space-y-6 animate-fade-in">
                  <h1 className="text-4xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-[#ff7e3e] via-[#ff9e2c] to-[#fb8500] animate-summer-glow">
                    ¡Quién me debe dinerito?
                  </h1>

                  <form onSubmit={handleSubmit} className="space-y-4 p-4 rounded-xl shadow summer-card">
                    <div>
                      <label className="block mb-1 text-sm font-medium">Qui te doit ?</label>
                      <select
                        multiple
                        value={fromUser}
                        onChange={(e) =>
                          setFromUser(Array.from(e.target.selectedOptions, (opt) => opt.value))
                        }
                        className="border rounded px-3 py-2 w-full h-32 bg-white/80"
                        required
                      >
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

                  <div className="text-center py-6 rounded-lg shadow-md summer-item">
                    <p className="text-green-700 text-xl font-semibold">On te doit : {totalMeDoit.toFixed(2)} €</p>
                    <p className="text-red-700 text-xl font-semibold">Tu dois : {totalJeDois.toFixed(2)} €</p>
                    <p className="text-2xl font-bold mt-2">
                      Solde net : {(totalMeDoit - totalJeDois).toFixed(2)} €
                    </p>
                  </div>

                  <h2 className="text-xl font-semibold mb-2">Mes remboursements</h2>
                  <ul className="space-y-2">
                    {remboursements.map((r) => (
                      <li key={r.id} className="rounded-xl shadow p-4 summer-item">
                        <p>
                          <strong>
                            {me && r.to_user === me.id
                              ? `${userMap[r.from_user] || "Quelqu'un"} te doit`
                              : `Tu dois à ${userMap[r.to_user] || "quelqu'un"}`} :
                          </strong>{" "}
                          {parseFloat(r.montant).toFixed(2)} €
                        </p>
                        <p className="text-sm opacity-80">{r.description}</p>
                        <p className="text-xs opacity-60">
                          {new Date(r.created_at).toLocaleDateString()} — {r.status || "à payer"}
                        </p>
                        {me && r.to_user === me.id && r.status !== "remboursé" && (
                          <Button size="sm" className="mt-2" onClick={() => markAsPaid(r.id)}>
                            Marquer comme remboursé
                          </Button>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </TabsContent>

              {/* MODE 2 : Split automatique */}
              <TabsContent value="mode2">
                <div className="max-w-2xl mx-auto p-6 space-y-6 animate-fade-in">
                  <h1 className="text-3xl font-bold text-center mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#ff7e3e] via-[#ff9e2c] to-[#fb8500] animate-summer-glow">
                    Split automático — ¡sin dramas!
                  </h1>

                  <div className="space-y-4 p-4 rounded-xl shadow summer-card">
                    <div>
                      <label className="block text-sm font-medium mb-1">Montant total (€)</label>
                      <Input
                        type="number"
                        value={montant}
                        onChange={(e) => setMontant(e.target.value)}
                        placeholder="Ex: 45.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Qui a payé ?</label>
                      <select
                        className="w-full border rounded px-3 py-2 bg-white/80"
                        value={payerId}
                        onChange={(e) => setPayerId(e.target.value)}
                      >
                        <option value="">-- Sélectionner un payeur --</option>
                        {/* Inclure "moi" dans le choix du payeur */}
                        {me && (
                          <option value={me.id}>
                            {userMap[me.id] || "Moi"}
                          </option>
                        )}
                        {users.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.username}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Participants</label>
                      <div className="grid grid-cols-2 gap-2">
                        {/* Inclure moi + les autres pour un vrai split */}
                        {me && (
                          <label className="flex items-center space-x-2">
                            <Checkbox
                              checked={participants.includes(me.id)}
                              onCheckedChange={(checked) => {
                                setParticipants((prev) =>
                                  checked ? Array.from(new Set([...prev, me.id])) : prev.filter(id => id !== me.id)
                                );
                              }}
                            />
                            <span>{userMap[me.id] || "Moi"}</span>
                          </label>
                        )}

                        {users.map((u) => (
                          <label key={u.id} className="flex items-center space-x-2">
                            <Checkbox
                              checked={participants.includes(u.id)}
                              onCheckedChange={(checked) => {
                                setParticipants((prev) =>
                                  checked ? Array.from(new Set([...prev, u.id])) : prev.filter(id => id !== u.id)
                                );
                              }}
                            />
                            <span>{u.username}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-center">
                      <Button className="bg-black text-white px-6 py-2 rounded-lg shadow" onClick={handleSplit}>
                        Split !
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Vagues en bas, full-width */}
          <div className="full-bleed-waves" aria-hidden />

          {/* Styles */}
          <style>{`
            /* Animations génériques */
            @keyframes fade-in { from { opacity: 0; transform: translateY(20px);} to { opacity:1; transform: translateY(0);} }
            .animate-fade-in { animation: fade-in 0.5s ease-out; }
            @keyframes summer-glow { 0%,100% { text-shadow: 0 0 10px rgba(251,133,0,0.35); } 50% { text-shadow: 0 0 18px rgba(255,183,3,0.45); } }
            .animate-summer-glow { animation: summer-glow 3.2s ease-in-out infinite; }

            /* Dégradés appliqués aux cards (pas de background global) */
            .summer-card {
              background: linear-gradient(180deg, rgba(255,126,62,0.10), rgba(251,133,0,0.16));
              border: 1px solid rgba(251,133,0,0.3);
              backdrop-filter: blur(4px);
            }
            .summer-item {
              background: linear-gradient(180deg, rgba(255,126,62,0.10), rgba(251,133,0,0.10));
              border: 1px solid rgba(251,133,0,0.25);
            }

            /* Soleil + emojis flottants derrière le contenu */
            .sun-emoji {
              position: absolute;
              top: 10px;
              right: 10px;
              font-size: 3rem;
              animation: sun-spin 20s linear infinite;
              z-index: 0;
              opacity: 0.85;
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
              50% { transform: translateY(-14px) translateX(10px); }
            }

            /* Vagues full-bleed */
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
    </div>
  );
}
