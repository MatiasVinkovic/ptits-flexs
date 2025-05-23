import React from "react";
import Layout from "@/components/Layout";

export default function JeuPage() {
  return (
    <Layout>
      <main className="min-h-screen flex flex-col items-center justify-center ">
        <h1 className="text-5xl sm:text-6xl font-extrabold text-indigo-700 animate-bounce mb-6">
          🌟 Les jeux arrivent ! 🌟
        </h1>

        <p className="text-xl text-center text-gray-700 mb-10 animate-fade-in-up">
          Les jeux et outils de jeux arriveront prochainement. 🎮🌈
        </p>

        <div className="flex gap-4 text-4xl animate-float">
          <span className="animate-pulse"> 🌈 </span>
          <span className="animate-bounce"> 🎫 </span>
          <span className="animate-pulse"> 🌟 </span>
          <span className="animate-bounce"> 🎉 </span>
          <span className="animate-pulse"> 🎮 </span>
        </div>

        <style>{`
          @keyframes float {
            0%   { transform: translateY(0); }
            50%  { transform: translateY(-10px); }
            100% { transform: translateY(0); }
          }

          .animate-float {
            animation: float 3s ease-in-out infinite;
          }

          @keyframes fade-in-up {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }

          .animate-fade-in-up {
            animation: fade-in-up 0.6s ease-out forwards;
          }
        `}</style>
      </main>
    </Layout>
  );
}
