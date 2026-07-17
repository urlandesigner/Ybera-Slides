import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const route = readFileSync(new URL("../app/api/decks/route.ts", import.meta.url), "utf8");
const editor = readFileSync(
  new URL("../app/deck/[id]/editar/editor-client.tsx", import.meta.url),
  "utf8"
);

test("salvar edição atualiza a apresentação sem inserir nova versão", () => {
  const postHandler = route.slice(route.indexOf("export async function POST"));

  assert.match(postHandler, /\.update\(\{/);
  assert.doesNotMatch(postHandler, /\.insert\(\{/);
  assert.match(postHandler, /\.eq\("id", body\.sourceId\)/);
  assert.match(postHandler, /\.eq\("user_id", user\.id\)/);
});

test("editor comunica salvamento da apresentação atual", () => {
  assert.match(editor, /"SALVAR ALTERAÇÕES"/);
  assert.doesNotMatch(editor, /SALVAR NOVA VERSÃO/);
  assert.doesNotMatch(editor, /original permanece intacta/);
});
