import { redirect } from "next/navigation";

// Rota antiga — o histórico virou a tela de Apresentações (filtro Públicas).
export default function HistoricoPage() {
  redirect("/?filtro=publicas");
}
