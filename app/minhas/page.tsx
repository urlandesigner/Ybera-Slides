import { redirect } from "next/navigation";

// Rota antiga — Minhas apresentações virou o filtro "Minhas" da tela de Apresentações.
export default function MinhasPage() {
  redirect("/?filtro=minhas");
}
