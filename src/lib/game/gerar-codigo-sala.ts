// Sem caracteres ambíguos (0/O, 1/I/L) pra facilitar digitar/ler em voz alta.
const ALFABETO = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

export function gerarCodigoSala(tamanho = 6): string {
  let codigo = "";
  for (let i = 0; i < tamanho; i++) {
    codigo += ALFABETO[Math.floor(Math.random() * ALFABETO.length)];
  }
  return codigo;
}
