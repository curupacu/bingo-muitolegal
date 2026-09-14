-- Banco de Dados passa de 25 para 40 itens (pool maior que a cartela 5x5,
-- dá mais emoção), e entra o tema de bingo tradicional com 75 números.

insert into itens_tema (tema_id, rotulo)
select t.id, item
from temas t
cross join unnest(array[
  'Anomalia de atualização', 'Chave composta', 'Entidade fraca',
  'Integridade referencial', 'View', 'Trigger', 'Stored procedure',
  'Commit', 'Rollback', 'Subconsulta', 'GROUP BY', 'Álgebra relacional',
  'Tupla', 'Desnormalização', 'NoSQL'
]) as item
where t.slug = 'banco-de-dados'
on conflict do nothing;

insert into temas (slug, nome, descricao) values
  ('bingo-tradicional', 'Bingo tradicional', 'Números de 1 a 75, como no bingo clássico')
on conflict (slug) do nothing;

insert into itens_tema (tema_id, rotulo)
select t.id, n::text
from temas t
cross join generate_series(1, 75) as n
where t.slug = 'bingo-tradicional'
on conflict do nothing;
