import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "@/pages/LandingPage";
import CreateEvent from "./pages/CreateEvent";
import EventPage from "./pages/EventPage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import AccountPage from "./pages/AccountPage";
import RemboursementPage from "./pages/RemboursementPage";
import AnnuairePage from "./pages/AnnuairePage";
import JeuPage from "./pages/JeuPage";
import TimerPage from "./pages/TimerPage";
import { Timer } from "lucide-react";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/createevent" element={<CreateEvent />} />
        <Route path="/event" element={<EventPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/account" element={<AccountPage />} />

        <Route path="/remboursement" element={<RemboursementPage />} />

        <Route path="/annuaire" element={<AnnuairePage />} />

        <Route path="/jeu" element={<JeuPage />} />

        <Route path="/timer" element={<TimerPage />} />





        {/* Tu pourras ajouter d’autres routes ici plus tard */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;