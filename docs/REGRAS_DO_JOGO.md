# Regras do jogo

Registrado aqui pra não perder o combinado — qualquer mudança nas regras
começa editando este arquivo.

## Fluxo

1. **Criar sala**: o host escolhe um **tema** (ex: "Banco de Dados", "Banca
   de Normalização"), o tamanho da cartela (3x3, 4x4 ou 5x5) e o **modo do
   jogo** (ver abaixo). Opcionalmente define uma janela de **data/hora de
   abertura e fechamento**, útil pra evento que dura mais de um dia. A sala
   recebe um código curto para compartilhar.
2. **Entrar na sala**: jogadores entram digitando o código da sala e um
   apelido — **sem login obrigatório** (MVP é 100% anônimo; conta/login pode
   vir depois como opcional). Qualquer um pode entrar a qualquer momento
   enquanto a sala estiver dentro da janela (se houver uma definida).
3. **Cartela**: ao entrar, cada jogador recebe uma cartela com itens do tema
   sorteados e distribuídos em posições aleatórias — cada jogador tem uma
   cartela diferente. O banco de itens de um tema pode (e idealmente deve)
   ter **muito mais itens do que cabe na cartela** — como no bingo de
   números de verdade, isso dá incerteza pro jogo. O sistema já suporta
   isso; só depende do tema ter itens suficientes cadastrados.
4. **Modo do jogo** — dois jeitos de preencher a cartela:
   - **Sorteio** (padrão, ex: tema "Banco de Dados"): quem escolhe qual
     item sai, aleatoriamente, é o sistema — o host controla o ritmo,
     clicando em "Sortear próximo" quando quiser revelar o próximo item.
     Só dá pra marcar item que já saiu no sorteio.
   - **Observação ao vivo** (ex: tema "Banca de TCC"): não tem sorteio
     nenhum. Os itens da cartela são coisas que podem acontecer ao vivo
     (ex: "professor interrompe", "aluno esquece de agradecer a banca") —
     cada jogador marca por conta própria, na hora, o que for presenciando.
     Ninguém sorteia nada, não tem verificação — é na confiança.
5. **Marcação**: cada jogador marca clicando na própria cartela.
6. **Bingo de linha**: quem completar uma linha primeiro vence essa etapa.
   Mais de um jogador pode bater linha (não é sudden-death pra sala toda) —
   o jogo continua até a cartela cheia.
7. **Cartela cheia**: quem completar a cartela toda primeiro vence a
   partida.

## Pontos em aberto (decidir/testar depois)

- ~~Temas com poucos itens~~ — resolvido no Sprint 6: o sistema já suporta
  um banco de itens maior que a cartela (o pool não precisa ser igual ao
  tamanho da cartela, só precisa ter pelo menos `tamanho²` itens). Cabe a
  quem cadastra o tema colocar itens de sobra pra dar mais emoção.
- ~~Ritmo do sorteio~~ — decidido no Sprint 3: host controla o ritmo com um
  botão, o sistema escolhe o item aleatoriamente.
- Empate entre dois jogadores completando linha/cartela no mesmo instante.
- Cadastro dos temas e itens: por enquanto entra via `supabase/seed.sql`;
  decidir se vale a pena uma tela de admin pra isso mais pra frente.
- **Persistência entre dias é anônima, não por login** (decidido no
  Sprint 6): a cartela do jogador fica salva sozinha se ele voltar no
  mesmo aparelho/navegador nos dois dias do evento (usa um id anônimo em
  `localStorage`). Trocar de aparelho no meio do evento faz perder a
  cartela original. Login de verdade resolveria isso mas foi adiado por
  ser bem mais trabalho — revisar se isso virar um problema recorrente.
