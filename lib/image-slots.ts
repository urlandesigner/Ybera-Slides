/** Dimensões do slot de imagem no slide 1920×1080 (medidas no layout renderizado). */
export const IMAGE_SLOT_SIZE = {
  conteudo: { width: 804, height: 667 },
  imagem: { width: 1792, height: 898 },
} as const;

export type LayoutComImagem = keyof typeof IMAGE_SLOT_SIZE;

export function rotuloDimensaoImagem(layout: LayoutComImagem): string {
  const { width, height } = IMAGE_SLOT_SIZE[layout];
  return `${width} × ${height} px`;
}
