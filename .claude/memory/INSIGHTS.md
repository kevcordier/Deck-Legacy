# Registre des apprentissages (INSIGHTS)

Ce que le projet a découvert en avançant, pour ne jamais réapprendre deux fois la même leçon. Les choix conscients vont dans `EDR.md` ; ici, on note les patterns constatés en pratiquant.

## Règles du registre

1. **Actionnable ou rien** : chaque entrée a une `Action` concrète, applicable dans le travail quotidien. Une observation sans action n'a pas sa place ici.
2. **Une source vérifiable** : commit, métrique, test, retour d'utilisateur ou observation datée. On n'inscrit pas d'intuition.
3. **On ne supprime pas** : un apprentissage contredit plus tard reçoit `Statut : Invalidé par INS-XXX`, et l'apprentissage nouveau fait l'objet d'une nouvelle entrée.
4. Une action qui revient à changer une décision passe par une nouvelle entrée dans `EDR.md`.
5. À relire avant d'ajouter ou de corriger une carte, de toucher à l'interface ou à la CI, et avant toute proposition d'architecture.

## Index

| ID      | Date       | Titre                                             | Domaine      |
| ------- | ---------- | ------------------------------------------------- | ------------ |
| INS-001 | 2026-05-24 | Les bugs viennent surtout des données             | Cartes       |
| INS-002 | 2026-05-25 | Une carte corrigée en plusieurs fois              | Cartes       |
| INS-003 | 2026-05-17 | Les références textuelles échouent en silence     | Cartes       |
| INS-004 | 2026-05-28 | Les sélections oublient permanents et passifs     | Moteur       |
| INS-005 | 2026-04-11 | Le mobile casse à chaque évolution                | Interface    |
| INS-006 | 2026-04-12 | La CI réglée par essais coûte cher                | Outillage    |
| INS-007 | 2026-04-18 | La dette qualité corrigée trop tard               | Qualité      |
| INS-008 | 2026-05-24 | Les commits multi-sujets gênent le retour arrière | Process      |
| INS-009 | 2026-10-10 | La documentation dérive du code                   | Process      |
| INS-010 | 2026-10-10 | Dependabot quotidien crée un arriéré              | Outillage    |
| INS-011 | 2026-10-10 | Le hors-ligne est une exigence non négociable     | Architecture |
| INS-012 | 2026-10-10 | React Native n'est pas le web                     | Interface    |
| INS-013 | 2026-10-10 | Comparer les événements par contenu               | Serveur      |
| INS-014 | 2026-10-10 | Le moteur pur se réutilise tel quel               | Architecture |
| INS-015 | 2026-10-10 | Les règles sont difficiles à comprendre           | Joueurs      |
| INS-016 | 2026-10-10 | La forme du tutoriel ne convainc pas              | Joueurs      |
| INS-017 | 2026-10-10 | Les joueurs critiquent l'ergonomie mobile         | Joueurs      |
| INS-018 | 2026-10-10 | Les bugs se découvrent en jouant                  | Process      |
| INS-019 | 2026-10-10 | Le ressenti de jeu améliore la lisibilité         | Interface    |
| INS-020 | 2026-10-10 | Parties courtes : marge pour les animations       | Game design  |
| INS-021 | 2026-10-11 | Mesurer sans padding dans un parent ajusté        | Interface    |
| INS-023 | 2026-10-17 | Le moteur faisait confiance à l'interface         | Serveur      |

---

ID : INS-001
Date : 2026-05-24
Titre : Les bugs viennent surtout des données
Statut : Valide

Découverte
La majorité des bugs de règles ne sont pas des bugs du moteur, mais des erreurs de transcription d'une carte dans son `CardDef` : mauvaise ressource dans un coût, tag erroné, mauvais moment de déclenchement, signe de la gloire inversé, « reste en jeu » ajouté à tort, nom mal orthographié.

Source
Historique git : 70 commits de correction sur 227, dont au moins 12 ne modifient qu'un ou deux champs d'une seule carte. Exemples : East Cliffs (`GOLD` → `IRON`, 26f181b), carte 60 (`EVENT` → `PERSON`, 2af93e6), carte 119 (`END_OF_TURN` → `END_OF_ROUND`, bc7cc21), Handsome Rival (gloire `20/-5` → `-20/+5`, 8cc3c1f), Wood Shipment (`STAY_IN_PLAY` en trop, 9184410).

Impact
Face à un bug de carte, on regarde d'abord la donnée, avant de soupçonner le moteur. Les erreurs se concentrent sur quelques champs.

Action

- À chaque ajout ou correction de carte, relire le texte de la carte champ par champ : ressource et quantité de chaque coût, tags, déclencheur (tour ou manche), signe et base de la gloire, permanent ou « reste en jeu », cible d'amélioration.
- Ajouter cette liste de contrôle à la skill `add-card` (étape « vérification »).
- `rules-engineer` commence toujours son diagnostic par le `CardDef`.

---

ID : INS-002
Date : 2026-05-25
Titre : Une carte corrigée en plusieurs fois
Statut : Valide

Découverte
Une carte complexe (plusieurs états, déclencheurs, effets « reste en jeu ») corrigée sans test de scénario demande plusieurs passes : chaque correctif révèle le suivant.

Source
Carte 119 : quatre commits en deux jours (0c95d1d « fix 119 », 951a11f « stay in play effect », 229f7ef « trigger ID and actions », bc7cc21 « END_OF_TURN → END_OF_ROUND »).

Impact
Un correctif de carte n'est pas fini tant que son comportement complet n'a pas été vérifié sur une vraie séquence de jeu.

Action

- Pour toute carte à déclencheur ou à plusieurs états, écrire un test de scénario `GameSession` (fixtures minimales) qui joue la séquence complète : découverte, jeu, déclenchement, fin de tour ou de manche.
- Avant de clore le correctif, vérifier aussi la traduction et l'affichage de la carte.

---

ID : INS-003
Date : 2026-05-17
Titre : Les références textuelles échouent en silence
Statut : Valide

Découverte
Les cartes se référencent entre elles par des chaînes (nom d'état dans un sélecteur, clés de traduction) et par des ids (`upgradeTo`, `states.ids`, `cards.ids`). Une faute de frappe ne provoque aucune erreur : le sélecteur ne trouve simplement aucune carte.

Source
Commit d154657 « fix: engeneer » : le coût de la carte 25 visait `name: 'Fishing Boats'` au lieu de `'Fishing Boat'`, ce qui rendait l'action inutilisable sans aucun message. La suite `packages/game-data/tests` ne contient que 4 tests (index, decks, unicité des ids), aucun sur ces références.

Impact
TypeScript ne protège pas ces références ; seul un test de cohérence des données peut les attraper.

Action
Ajouter des tests de cohérence dans `packages/game-data/tests` :

- chaque `name` utilisé dans un sélecteur correspond à un état existant ;
- chaque `upgradeTo`, `states.ids` et `cards.ids` désigne une carte ou un état existant ;
- chaque nom d'état et chaque id d'action a sa clé dans `cards.en.json` et `cards.fr.json`, avec les mêmes clés dans les deux fichiers.

---

ID : INS-004
Date : 2026-05-28
Titre : Les sélections oublient permanents et passifs
Statut : Valide

Découverte
Le code de sélection de cartes (coûts, défausse, destruction) a tendance à ne regarder que `board` et que les effets de plateau (`boardEffects`). Il oublie les cartes permanentes et les passifs propres à une carte, comme `COUNT_AS_2`.

Source
Commits ff10859 (« fix destroy permanent card »), ee6611a (« count as 2 passive ») et 341cb6b (« fix: passive »). Ces deux pièges sont désormais notés dans les « Common Pitfalls » du `CLAUDE.md` racine.

Impact
Tout nouveau sélecteur ou coût est suspect tant qu'il n'a pas été testé avec une carte permanente et avec un passif propre à une carte.

Action
Chaque test d'un sélecteur, d'un coût ou d'une stratégie de défausse ou de destruction couvre au minimum : une carte dans `permanents`, et une carte dont le passif `COUNT_AS_2` est intrinsèque (pas dans `boardEffects`).

---

ID : INS-005
Date : 2026-04-11
Titre : Le mobile casse à chaque évolution
Statut : Valide

Découverte
L'interface est développée sur grand écran, et l'affichage mobile casse régulièrement après coup.

Source
Au moins 7 commits de correction mobile ou responsive, du 2026-04-11 au 2026-09-20 : 2cb3d54, da35f0a, 1f4c6d4, 24e3d8d, 3a7a414, 75d75dc, ee6611a. La refonte e52f39b a finalement créé une mini-carte dédiée au mobile.

Impact
Le mobile n'est pas un cas particulier à traiter à la fin : avec Expo, c'est une cible principale (EDR-020).

Action
Avant de committer une modification d'interface, la vérifier sur un petit écran (simulateur iOS ou Android, ou web à 375 px de large) **et** sur grand écran (≥ 1024 px, `useIsDesktop`). Pour les composants concernés, ajouter une story Storybook en largeur mobile.

---

ID : INS-006
Date : 2026-04-12
Titre : La CI réglée par essais coûte cher
Statut : Valide

Découverte
Régler la CI et SonarCloud en poussant puis en corrigeant, essai après essai, pollue l'historique et prend une journée entière.

Source
12 commits consacrés à la configuration Sonar le 2026-04-12 (chemins des sources, des tests, de la couverture, exclusions), puis 6 commits de remaniement des workflows le 2026-04-18 (de ee7c73d à 79877e4).

Impact
Une modification de CI se prépare : lire la documentation de l'outil, puis itérer à l'écart de la branche principale.

Action

- Itérer sur une branche dédiée, avec `workflow_dispatch` pour relancer sans nouveau commit, puis fusionner en un seul commit (squash).
- Pour Sonar, vérifier les chemins localement (rapports `coverage/lcov.info` présents) avant de pousser.
- Confier ces chantiers à `dependency-steward`.

---

ID : INS-007
Date : 2026-04-18
Titre : La dette qualité corrigée trop tard
Statut : Valide

Découverte
Les problèmes de lint, de Sonar et de couverture sont découverts en CI ou sur SonarCloud, puis corrigés dans des commits séparés, alors que les outils locaux existent.

Source
25 commits sur 227 sont des correctifs lint, Sonar ou couverture (« fix sonar issues », « fix lint + test coverage », « bump version + fix lint »). Le 2026-04-16, trois remaniements ont dû réduire la complexité cognitive (`GameAggregate.useCardEffect`, `CardAction`, `PendingChoiceModal`). Une configuration SonarLint en mode connecté existe pourtant (`.sonarlint/connectedMode.json`).

Impact
La complexité et les alertes s'accumulent dans les gros composants et l'agrégat de jeu ; les corriger après coup coûte des remaniements.

Action

- Lancer `pnpm verify` avant chaque commit (le hook pre-commit ne mesure pas la couverture).
- Garder SonarLint actif dans l'éditeur : une alerte de complexité se traite au moment d'écrire la fonction, en découpant (helpers purs, stratégies).
- `quality-gate` passe avant chaque commit proposé par un agent.

---

ID : INS-008
Date : 2026-05-24
Titre : Les commits multi-sujets gênent le retour arrière
Statut : Valide

Découverte
Beaucoup de commits mélangent plusieurs correctifs sans rapport (cartes, affichage, règles). Il devient impossible d'annuler un seul changement ou de retrouver quand une carte a été modifiée.

Source
Exemples : ee6611a (« fix: adjust card preview and pending choice modal layouts fix: card 57 fix: count as 2 passive »), 594a415 (quatre sujets), f60234b (trois sujets). Un retour arrière manuel a été nécessaire : 9c35391 « rollback triggerpile selection display ».

Impact
Avec la règle des anciennes versions pour les parties commencées (EDR-036), il faut pouvoir retrouver précisément quand une carte a changé.

Action

- Un correctif = un commit.
- Messages au format conventionnel, avec la carte en portée : `fix(card-119): trigger at end of round`, `feat(engine): …`, `fix(client): …`.
- `git log -- packages/game-data/src/cards/<id>.ts` doit suffire à retracer l'historique d'une carte.

---

ID : INS-009
Date : 2026-10-10
Titre : La documentation dérive du code
Statut : Valide

Découverte
La documentation destinée à l'assistant prend du retard sur le code. L'assistant suit alors une convention périmée et produit du code incorrect.

Source
Le `CLAUDE.md` racine décrivait les ids d'action au format `cardID_stateId_id`, alors que les 287 ids d'action des cartes utilisent `<cardId>-<stateId>-<n>` (constaté le 2026-10-10, corrigé le même jour). La skill `add-card` le précisait déjà : « follow these, not older docs ».

Impact
Une doc fausse est pire qu'une doc absente pour un assistant IA.

Action

- Toute modification d'une convention, d'un format ou d'une structure met à jour le `CLAUDE.md` concerné **dans le même commit**.
- En cas de doute, le code fait foi : vérifier sur des fichiers réels (`grep`) avant d'appliquer une règle de la doc.
- Lancer de temps en temps `/doctor prompt-audit` pour repérer les instructions contradictoires.

---

ID : INS-010
Date : 2026-10-10
Titre : Dependabot quotidien crée un arriéré
Statut : Valide

Découverte
Dependabot en mode quotidien, sans regroupement, ouvre une branche par version de chaque paquet. Les versions s'empilent plus vite qu'elles ne sont traitées.

Source
44 branches `dependabot/*` sur `origin` au 2026-10-10, dont 11 pour le seul `@eslint-react/eslint-plugin` (5.6.6 → 5.8.18) et 5 pour `@types/node`. Certaines visent des paquets qui ne s'appliquent plus après la migration (`vite`, `tailwindcss` 4.x, `@vitejs/plugin-react`, `@dnd-kit/react`).

Impact
L'arriéré masque les mises à jour importantes (sécurité, versions majeures) et les branches périmées encombrent le dépôt.

Action

- Proposer une nouvelle EDR remplaçant EDR-016 : passage en hebdomadaire et regroupement des mises à jour mineures et correctives (`groups`), une configuration par espace de travail si nécessaire.
- Fermer les PR Dependabot qui concernent des paquets supprimés par la migration Expo.

---

ID : INS-011
Date : 2026-10-10
Titre : Le hors-ligne est une exigence non négociable
Statut : Valide

Découverte
Le jeu hors ligne est une exigence implicite mais prioritaire : elle passe avant l'autorité du serveur et la protection contre la triche.

Source
Le 2026-10-10, une architecture avec le moteur uniquement côté serveur a été retenue, puis abandonnée le jour même (« garde le moteur de jeu côté client pour permettre de jouer hors ligne ») : EDR-023, puis EDR-024.

Impact
Une proposition qui fait dépendre une partie du réseau sera rejetée, même si elle est plus robuste.

Action
Toute proposition d'architecture ou de fonctionnalité répond d'abord à la question « est-ce que ça marche sans réseau ? ». Si la réponse est non, l'arbitrage est présenté explicitement à l'utilisateur avant d'aller plus loin.

---

ID : INS-012
Date : 2026-10-10
Titre : React Native n'est pas le web
Statut : Valide

Découverte
Des habitudes web cassent silencieusement en React Native : les styles de texte ne se transmettent pas aux éléments enfants, NativeWind résout les conflits de classes selon l'ordre de la feuille de style et non l'ordre dans `className`, Hermes ne fournit pas `crypto.randomUUID`, et les fichiers Markdown importés exigent un redémarrage de Metro avec `--clear`.

Source
Migration Expo (EDR-020) : pièges consignés dans `apps/client/CLAUDE.md` et polyfill `apps/client/src/polyfills.ts` (le moteur a besoin de `crypto.randomUUID` pour les ids d'événements).

Impact
Le moteur, partagé, tourne sur trois environnements (Hermes, navigateur, Node) ; l'interface n'a pas les filets de sécurité du CSS.

Action

- Toujours afficher le texte avec le composant `Text` ; surcharger un style par une prop, jamais par l'ordre des classes.
- Avant d'utiliser une API globale dans `packages/engine` (crypto, `structuredClone`, `Intl`…), vérifier qu'elle existe sur Hermes, sinon ajouter un polyfill côté client.
- Après une modification des règles en Markdown : `expo start --clear`.

---

ID : INS-013
Date : 2026-10-10
Titre : Comparer les événements par contenu
Statut : Valide

Découverte
PostgreSQL `jsonb` réordonne les clés des objets : un événement relu depuis la base n'a pas la même sérialisation que l'événement envoyé par le client.

Source
Implémentation de la synchronisation serveur (`firstDifference` dans le dépôt des parties) ; le piège est noté dans `apps/server/CLAUDE.md`.

Impact
Une comparaison par `JSON.stringify` détecterait des différences inexistantes et réécrirait tout le journal à chaque synchronisation.

Action
Toujours comparer des événements ou des états avec une égalité profonde sur le contenu, jamais par chaîne sérialisée ; tout nouveau champ `jsonb` suit la même règle.

---

ID : INS-014
Date : 2026-10-10
Titre : Le moteur pur se réutilise tel quel
Statut : Valide

Découverte
Garder le moteur sans dépendance (couches imposées par dependency-cruiser, pas d'API navigateur, état reconstruit par événements) a permis de le faire tourner sur le serveur sans rien réécrire : la validation des parties par rejeu n'a demandé aucune duplication des règles.

Source
Création de `apps/server` (2026-10-10) : `GamesService.validate` appelle directement `GameSession.restore()` de `@deck-legacy/engine` avec le catalogue de `@deck-legacy/game-data`.

Impact
La pureté du moteur est un atout concret, qui conditionne à la fois le hors-ligne (EDR-024) et la validation serveur.

Action

- Toute nouvelle règle de jeu est d'abord écrite dans le moteur, avec ses tests, puis exposée au client ; jamais dans un composant ou un service NestJS.
- Refuser toute dépendance du moteur à React, NestJS, au stockage ou au réseau.

---

ID : INS-015
Date : 2026-10-10
Titre : Les règles sont difficiles à comprendre
Statut : Valide

Découverte
Les joueurs qui découvrent le jeu peinent à comprendre les règles : c'est l'un des retours négatifs récurrents.

Source
Retours des personnes qui testent le jeu (rapportés par l'auteur le 2026-10-10).

Impact
Le jeu reprend des mécaniques denses d'un jeu de société (états, pistes, autocollants, déclencheurs), sans le livret ni la personne qui explique à la table. Le jeu doit expliquer lui-même ses règles, au moment où elles servent.

Action

- Toute nouvelle mécanique ou icône arrive avec son explication dans le jeu (info-bulle ou aide contextuelle) **et** dans `rules.en.md` / `rules.fr.md`, dans le même changement.
- Les erreurs de règle (`CommandError`) disent pourquoi l'action est refusée et ce qui manque, pas seulement qu'elle est impossible.
- Après une modification des règles ou de l'aide, faire jouer un nouveau joueur et noter les questions qu'il pose : chaque question récurrente est une explication manquante.

---

ID : INS-016
Date : 2026-10-10
Titre : La forme du tutoriel ne convainc pas
Statut : Valide

Découverte
La forme actuelle du tutoriel (étapes guidées sur des zones de l'écran, dans une partie scénarisée hors journal d'événements, EDR-017) fait partie des retours négatifs des joueurs.

Source
Retours des personnes qui testent le jeu (rapportés par l'auteur le 2026-10-10). Les points précis qui posent problème ne sont pas encore identifiés.

Impact
Retoucher le tutoriel au jugé risque de déplacer le problème au lieu de le résoudre.

Action

- Avant de refondre le tutoriel, observer deux ou trois nouveaux joueurs pendant le tutoriel, sans les aider, et noter les étapes où ils bloquent, décrochent ou passent sans lire.
- Ajouter ici une entrée qui précise ce qui ne marche pas, puis décider de la nouvelle forme dans une EDR.

---

ID : INS-017
Date : 2026-10-10
Titre : Les joueurs critiquent l'ergonomie mobile
Statut : Valide

Découverte
L'ergonomie mobile fait partie des points négatifs cités par les joueurs. Le problème ne se limite pas à des affichages cassés (INS-005) : le jeu reste peu confortable sur téléphone même quand l'affichage est correct.

Source
Retours des personnes qui testent le jeu (rapportés par l'auteur le 2026-10-10) ; historique des correctifs mobiles (INS-005).

Impact
Sur mobile, les zones à toucher sont petites, l'écran est étroit et il n'y a pas de survol : une interface pensée pour la souris puis réduite ne suffit pas.

Action

- Concevoir chaque nouvel écran ou interaction d'abord pour le téléphone, puis l'adapter au grand écran.
- Zones tactiles d'au moins 44 × 44 pt ; aucune information accessible uniquement par survol.
- Tester sur un vrai téléphone, en le confiant à un joueur, avant de considérer une interface comme terminée.

---

ID : INS-018
Date : 2026-10-10
Titre : Les bugs se découvrent en jouant
Statut : Valide

Découverte
La quasi-totalité des bugs de cartes et de règles est découverte par l'auteur en jouant lui-même. Les cartes et extensions qui n'apparaissent qu'en fin de partie ou de campagne sont donc testées plus tard et moins souvent.

Source
Réponse de l'auteur (2026-10-10) ; nature des correctifs de l'historique (INS-001).

Impact
Une session de jeu est le principal outil de test du projet. Un bug repéré en jouant mais non reproduit est vite perdu, et le même bug peut revenir.

Action

- Bug repéré en jouant : exporter la sauvegarde (Options → export) tout de suite et la joindre au diagnostic.
- Transformer chaque bug corrigé en test automatisé (scénario `GameSession` ou test de cohérence des données) écrit avant le correctif, pour qu'il ne revienne pas.
- Pour les cartes de fin de partie et des extensions, utiliser le panneau de triche de développement afin d'atteindre directement la situation à tester.

---

ID : INS-019
Date : 2026-10-10
Titre : Le ressenti de jeu améliore la lisibilité
Statut : Valide

Découverte
La refonte du ressenti de jeu (inclinaison des cartes avec effet de profondeur, visionneuse avec zoom, mini-carte mobile) a corrigé le défaut ciblé, un jeu jugé trop « plat ». Elle a aussi amélioré la lisibilité sur mobile, ce qui n'était pas son but premier.

Source
Retours des joueurs avant et après la refonte e52f39b (2026-09-20), rapportés par l'auteur le 2026-10-10.

Impact
Les effets visuels et le retour d'interaction ne sont pas de la décoration : bien choisis, ils rendent aussi l'état du jeu plus lisible. Cela répond en partie aux critiques sur le mobile (INS-017).

Action

- Pour chaque nouvelle interaction (jouer, améliorer, découvrir, payer un coût), prévoir un retour visuel qui montre ce qui a changé sur le plateau.
- Réutiliser les composants qui ont fait leurs preuves (`CardTilt`, `CardViewerModal`, `MiniGameCard`) plutôt que d'en créer d'autres.
- Évaluer un effet visuel selon deux critères : il rend le jeu plus vivant **et** plus lisible sur téléphone.

---

ID : INS-020
Date : 2026-10-10
Titre : Parties courtes : marge pour les animations
Statut : Valide

Découverte
Une partie numérique est bien plus courte que la même partie du jeu de société, car le moteur automatise la mise en place, les comptes et la gestion des paquets. Ce temps gagné laisse de la marge pour ajouter des animations avant que le jeu ne devienne trop long.

Source
Observation de l'auteur en comparant ses parties numériques à celles du jeu de société (2026-10-10).

Impact
Les animations ont un budget en temps : la marge n'est pas infinie et chaque animation se répète des centaines de fois par partie.

Action

- Mesurer la durée de jeu active à partir des `timestamp` des événements, en ignorant les pauses (par exemple les écarts de plus de 5 minutes entre deux événements). Relever cette durée avant et après chaque ajout d'animations.
- Réserver les animations longues aux moments rares (découverte, amélioration, fin de manche, fin de partie) ; les actions répétitives gardent des animations brèves.
- Rendre les animations longues interruptibles par un toucher.

---

ID : INS-021
Date : 2026-10-11
Titre : Mesurer sans padding dans un parent ajusté
Statut : Valide

Découverte
La modale de choix de carte clignotait sur desktop : environ 60 rendus par seconde, la grille alternant entre 1 et 2 colonnes et la carte entre ses mises en page large et compacte. `Grid` mesurait (`onLayout`) une vue qui portait aussi son padding, puis donnait cette largeur à ses cellules : elles débordaient de la place réelle. La modale desktop prend la largeur de son contenu (`lg:w-auto`), donc ce débordement l'élargissait, ce qui changeait la mesure, et ainsi de suite.

Source
Reproduit dans Chrome headless avec une route temporaire (compteur de rendus `Profiler`, largeurs relevées par CDP) : 600 rendus en 10 s avant correction, 6 après, à 375, 1024 et 1310 px.

Impact
Toute vue qui se dimensionne d'après sa propre mesure peut boucler dans un parent qui s'ajuste à son contenu (modale desktop, `items-center`, `self-start`).

Action

- Mesurer la vue qui n'a pas de padding (le padding va sur une vue extérieure), comme `Grid` le fait maintenant.
- Pour un clignotement d'interface, compter les rendus avant de chercher dans les styles.

---

ID : INS-022
Date : 2026-10-11
Titre : Un coût d'action ne se paie qu'une fois
Statut : Valide

Découverte
Une action avec un coût en ressources et un `TRACK_ADVANCE` faisait payer son coût deux fois : `CardActionAggregate.resolvePayCost` additionnait le coût de l'action, déjà payé, au coût de l'étape et repayait le tout. `spendResources` plafonne à 0, donc le bug passait inaperçu quand le joueur avait juste assez. Cartes touchées : 27-1-1, 80-1-1, 89-1-1, 108-4-2, 111-4-1.

Source
Scénario de test du Robbin' Leader (carte 123) : 3 épées dépensées deux fois.

Impact
Le rejeu ne change pas (les événements `CARD_ACTION` stockent l'état obtenu), mais les nouvelles actions de ces cartes coûtent désormais le prix imprimé.

Action

- `resolvePayCost(cost)` paie seulement le coût passé ; sans argument, il paie le coût de l'action et défausse la carte jouée.
- Tester le solde de ressources après une action à coût, pas seulement l'effet.

---

ID : INS-023
Date : 2026-10-17
Titre : Le moteur faisait confiance à l'interface
Statut : Valide

Découverte
En ajoutant la vérification par réexécution (EDR-051), une simulation de parties aléatoires sur les vraies cartes a montré que `GameSession` acceptait des commandes que l'interface n'envoie jamais : `startRound` à n'importe quel moment (nouveau mélange à chaque fois), choix et paiements repris tels quels (ressources inventées, `newActionEffects` injectés, coût payé avec rien), production et amélioration d'une carte hors jeu, passage d'un déclencheur obligatoire.

Source
Première version de `apps/server/tests/verification.fuzz.test.ts` : 36 000 `ROUND_STARTED` sur 42 000 événements avant les gardes de phase.

Impact
Réexécuter les commandes ne prouve rien si le moteur accepte une commande illégale. Les gardes vivent maintenant dans `session/playerInput.ts`.

Action

- Toute nouvelle commande ou tout nouveau type de choix reçoit sa garde dans `playerInput.ts`, avec un test.
- Un test du moteur qui joue un coup que l'interface ne propose pas (améliorer une carte déjà défaussée) décrit un coup illégal : le corriger plutôt que d'assouplir la garde.

---

ID : INS-024
Date : 2026-10-18
Titre : Un champ de saisie dans une poignée de glissement ne prend plus le focus
Statut : Valide

Découverte
Depuis le glissement des cartes du plateau par leur en-tête (PR #94), le nom d'une carte nommable ne pouvait plus être modifié.

Source
`GameCard` : le `TextInput` du nom était dans `CardDragHandle`, dont le `GestureDetector` (pan) prend l'appui avant le champ.

Impact
Le moteur et la sauvegarde fonctionnaient ; seul le focus du champ était perdu, sans erreur.

Action

- Garder hors de `CardDragHandle` tout élément interactif (champ, bouton) : le nom éditable est maintenant à côté de la poignée.

---

ID : INS-025
Date : 2026-10-19
Titre : Payer un coût sans carte effaçait les cartes « venant d'être défaussées »
Statut : Valide

Découverte
En écrivant la Peste noire (Foundations), le trigger « quand une personne infectée est défaussée » ne trouvait plus la personne au moment de sa résolution.

Source
`CardActionAggregate.payCost` appelait toujours `discardCards`, même avec une liste vide ; or `discardCards` remplace `lastDiscardedCards`. Chaque action, trigger compris, vidait donc la portée `DISCARDED` avant ses effets. L'Alchimiste (Healing Potion, « rejouez la personne défaussée ») n'a jamais rien rejoué.

Impact
Tout effet ciblant `TargetScope.DISCARDED` dans un trigger `ON_DISCARD` était inopérant. Corrigé avec l'accord de l'utilisateur : les parties synchronisées où le trigger de l'Alchimiste a été résolu peuvent être refusées à la vérification serveur.

Action

- Un helper d'état qui écrit un champ « dernier… » (`lastDiscardedCards`, `lastDrawnCards`) ne doit pas être appelé avec une liste vide « pour rien ».
- Une carte dont le trigger lit `DISCARDED` ou `DRAWN` reçoit un scénario de test qui résout le trigger.
