# Regras do jogo

Registrado aqui pra não perder o combinado — qualquer mudança nas regras
começa editando este arquivo.

## Fluxo

1. **Criar sala**: o host escolhe um **tema** (ex: "Banco de Dados", "Banca
   de Normalização") e o tamanho da cartela (3x3, 4x4 ou 5x5). A sala recebe
   um código curto para compartilhar.
2. **Entrar na sala**: jogadores entram digitando o código da sala e um
   apelido — **sem login obrigatório** (MVP é 100% anônimo; conta/login pode
   vir depois como opcional).
3. **Cartela**: ao entrar, cada jogador recebe uma cartela com itens do tema
   sorteados e distribuídos em posições aleatórias — cada jogador tem uma
   cartela diferente.
4. **Sorteio**: quem sorteia os itens, um a um, é **o sistema** (não o
   host). Cada item sorteado é transmitido em tempo real pra todo mundo na
   sala.
5. **Marcação**: cada jogador marca em sua própria cartela os itens
   sorteados que aparecem nela.
6. **Bingo de linha**: quem completar uma linha primeiro vence essa etapa.
   Mais de um jogador pode bater linha (não é sudden-death pra sala toda) —
   o jogo continua até a cartela cheia.
7. **Cartela cheia**: quem completar a cartela toda primeiro vence a
   partida.

## Pontos em aberto (decidir/testar depois)

- Temas com poucos itens cadastrados deixam "cartela cheia" difícil ou
  repetitiva — considerar um tamanho de cartela menor conforme o tamanho do
  banco de itens do tema, ou banco de itens maior por tema.
- Ritmo do sorteio: por padrão, cada item revelado fica disponível pra
  todo mundo assim que sorteado (sem "próximo" manual do host) — revisar se
  isso é rápido demais pra sala de aula.
- Empate entre dois jogadores completando linha/cartela no mesmo instante.
- Cadastro dos temas e itens: por enquanto entra via `supabase/seed.sql`;
  decidir se vale a pena uma tela de admin pra isso mais pra frente.
