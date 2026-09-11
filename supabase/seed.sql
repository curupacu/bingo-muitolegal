-- Dados de exemplo para desenvolvimento local.
-- Os temas e itens "de verdade" serão passados pelo dono do produto
-- (ver docs/SPRINTS.md) e cadastrados aqui ou por uma tela de admin futura.

insert into temas (slug, nome, descricao) values
  ('banco-de-dados', 'Banco de Dados', 'Conceitos gerais da disciplina de Banco de Dados'),
  ('normalizacao', 'Banca de Normalização', 'Formas normais e modelagem relacional')
on conflict (slug) do nothing;

insert into itens_tema (tema_id, rotulo)
select t.id, item
from temas t
cross join unnest(array[
  'Chave primária', 'Chave estrangeira', 'Chave candidata',
  '1FN', '2FN', '3FN', 'Forma normal de Boyce-Codd',
  'Redundância', 'Anomalia de inserção', 'Anomalia de exclusão',
  'Dependência funcional', 'Dependência transitiva',
  'Entidade', 'Relacionamento', 'Cardinalidade',
  'Atributo multivalorado', 'Atributo composto', 'Atributo derivado',
  'Modelo ER', 'Modelo relacional', 'Junção (JOIN)',
  'Índice', 'Transação', 'ACID', 'Consulta SQL'
]) as item
where t.slug = 'banco-de-dados'
on conflict do nothing;
