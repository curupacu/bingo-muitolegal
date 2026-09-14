-- Itens do tema da banca de TCC (jogar no modo "observação ao vivo").
update temas
set descricao = 'Coisas que podem acontecer durante a banca de TCC'
where slug = 'normalizacao';

insert into itens_tema (tema_id, rotulo)
select t.id, item
from temas t
cross join unnest(array[
  'Autilio falando “passa, passa”',
  '3 grupos ou mais reprovados',
  'Autilio falando mal do Moura ou ignorando ele',
  'Autilio usando o celular',
  'Por que tem essa ligação',
  'Vocês complicam demais',
  'Simples demais',
  'Volta lá',
  'Luciano na banca',
  'Neide sendo a última a chegar',
  'Problema de internet',
  'Banca interrompida',
  'Mandando calar a boca',
  'PWA ou jayscript',
  'Mudança de ordem',
  'História de vida do Autilio',
  'Cerejinha',
  'Neide e Autilio cochichando',
  'NoSQL ou não relacional',
  'Alguma coisa sobre dinheiro, os “gastos”',
  'Cadê a pasta',
  'Farpa para o Luciano',
  'Algum grupo fazendo algo durante as outras apresentações',
  'Autilio agoniado',
  'Autilio fora da banca',
  'Banca adiada para semana que vem',
  'Jesus opinando sobre algo que ele não entende',
  'Roseane reclamando da cor do fundo'
]) as item
where t.slug = 'normalizacao'
on conflict do nothing;
