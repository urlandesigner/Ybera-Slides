import { redirect } from "next/navigation";

// Rota antiga — Biblioteca virou o filtro "Públicas" da tela de Apresentações.
export default function RepositorioPage() {
  redirect("/?filtro=publicas");
}
