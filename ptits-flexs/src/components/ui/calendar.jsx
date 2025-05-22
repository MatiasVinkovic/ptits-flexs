import * as React from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input"; // si tu as un composant personnalisé, sinon remplace par <input>

function Calendar({ className, value, onChange, label = "Choisir une date" }) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Label className="text-sm font-medium">{label}</Label>
      <Input
        type="date"
        value={value}
        onChange={onChange}
        className="w-fit"
      />
    </div>
  );
}

export { Calendar };