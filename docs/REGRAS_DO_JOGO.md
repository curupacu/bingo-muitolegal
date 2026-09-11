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
4. **Sorteio**: quem escolhe qual item sai, aleatoriamente, é **o sistema**
   (não o host) — mas é o host quem controla o ritmo, clicando em "Sortear
   próximo" quando quiser revelar o próximo item (pra dar tempo de ler em
   voz alta e a turma marcar). Cada item sorteado é transmitido em tempo
   real pra todo mundo na sala.
5. **Marcação**: cada jogador marca — clicando na própria casa — os itens
   sorteados que aparecem na cartela dele. Só dá pra marcar item que já
   saiu no sorteio.
6. **Bingo de linha**: quem completar uma linha primeiro vence essa etapa.
   Mais de um jogador pode bater linha (não é sudden-death pra sala toda) —
   o jogo continua até a cartela cheia.
7. **Cartela cheia**: quem completar a cartela toda primeiro vence a
   partida.

## Pontos em aberto (decidir/testar depois)

- Temas com poucos itens cadastrados deixam "cartela cheia" difícil ou
  repetitiva — considerar um tamanho de cartela menor conforme o tamanho do
  banco de itens do tema, ou banco de itens maior por tema.
- ~~Ritmo do sorteio~~ — decidido no Sprint 3: host controla o ritmo com um
  botão, o sistema escolhe o item aleatoriamente.
- Empate entre dois jogadores completando linha/cartela no mesmo instante.
- Cadastro dos temas e itens: por enquanto entra via `supabase/seed.sql`;
  decidir se vale a pena uma tela de admin pra isso mais pra frente.
