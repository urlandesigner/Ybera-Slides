import { redirect } from "next/navigation";

// Rota antiga — o histórico virou Repositório (públicas) + Minhas.
export default function HistoricoPage() {
  redirect("/repositorio");
}
