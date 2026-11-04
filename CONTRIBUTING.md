# Contribuer

Ce dépôt est travaillé par un pipeline multi-agents, et chacun peut y contribuer à la
main : les règles sont les mêmes pour tous, et des contrôles automatiques les
vérifient sur chaque pull request.

## Le chemin d'une modification

1. Une issue porte l'exigence : ouvre-la avec le formulaire, qui en donne les sections.
2. Une branche part de `dev` et porte le type et le numéro de l'issue :
   `<type>/<N>-<objet-court>`, par exemple `docs/87-bot-dev-role`.
3. Chaque commit fait une seule chose et le dit : `type(portée): résumé`, une ligne
   vide, le pourquoi s'il n'est pas évident, puis `Refs #N`.
4. La pull request vise `dev` et reprend les sept sections du modèle. Elle cite
   l'issue par `Refs #N`, jamais `Closes` : vers `dev`, rien ne se ferme.
5. Un autre acteur que son auteur l'approuve, puis elle est fusionnée par écrasement.
   `dev` rejoint ensuite `main` par une pull request d'intégration, qui ferme les
   issues livrées.

Types : `feat`, `fix`, `docs`, `refactor`, `test`, `ci`, `chore`. Le résumé est en
français, à l'infinitif, sans majuscule ni point final, et le titre tient en
72 caractères.

## Ce qui est vérifié

- `ci` : le socle (aucun marqueur de conflit ni de blocage) et les commandes du projet ;
- `conventions` : titre, branche, sections, `Refs #N` et chaque commit ; en cas
  d'écart, un commentaire de la pull request dit quoi corriger.

Les règles de protection de `main` et `dev` exigent ces deux contrôles, une
approbation par un autre acteur que le dernier à avoir poussé, et des commits
signés. Les labels se posent seuls.
