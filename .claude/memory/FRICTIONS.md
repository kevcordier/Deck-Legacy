# Registre des pièges (FRICTIONS)

Frictions, blocages, bugs et fausses routes déjà rencontrés, pour ne jamais retomber deux fois dans le même piège. Les découvertes à reproduire vont dans `INSIGHTS.md`, les choix dans `EDR.md`.

## Règles du registre

1. **On n'efface jamais un piège**, même résolu : sa mémoire protège de la récidive. Seule la ligne `Statut` évolue (`Ouvert`, `Résolu`, `Récurrent`).
2. Un piège qui revient ne fait pas l'objet d'une nouvelle entrée : on passe l'entrée existante en `Récurrent` et on y ajoute la date de la récidive.
3. `Temps perdu` est une estimation honnête. Elle est calculée à partir des horodatages git quand c'est possible ; sinon, on écrit « non mesuré ».
4. Un symptôme marqué « reconstitué » a été déduit de la cause documentée, faute de trace de l'incident lui-même.
5. À relire avant de toucher à la CI, au modèle de cartes, aux extensions, à la synchronisation ou à l'architecture.

## Index

| ID      | Date       | Titre                                        | Domaine      | Statut    |
| ------- | ---------- | -------------------------------------------- | ------------ | --------- |
| FRC-001 | 2026-04-10 | Ref modifiée pendant le rendu React          | Client       | Résolu    |
| FRC-002 | 2026-04-12 | Configuration Sonar réglée par essais        | Outillage    | Résolu    |
| FRC-003 | 2026-04-13 | Modèle d'action remanié quatre fois          | Moteur       | Résolu    |
| FRC-004 | 2026-04-18 | Workflows CI corrigés en cascade             | Outillage    | Résolu    |
| FRC-005 | 2026-04-11 | Affichage mobile cassé à répétition          | Interface    | Récurrent |
| FRC-006 | 2026-05-17 | Nom de carte mal orthographié, sans erreur   | Cartes       | Ouvert    |
| FRC-007 | 2026-05-23 | Fin de partie remaniée deux fois             | Moteur       | Résolu    |
| FRC-008 | 2026-05-24 | Carte 119 corrigée en quatre fois            | Cartes       | Résolu    |
| FRC-009 | 2026-05-24 | Retour arrière dans un commit multi-sujets   | Process      | Récurrent |
| FRC-010 | 2026-05-28 | Coûts ignorant cartes permanentes et passifs | Moteur       | Résolu    |
| FRC-011 | 2026-10-10 | Moteur côté serveur : fausse route           | Architecture | Résolu    |
| FRC-012 | 2026-10-10 | Branche `master` prise pour la principale    | Process      | Ouvert    |
| FRC-013 | 2026-10-10 | Documentation contredisant le code           | Process      | Résolu    |
| FRC-014 | 2026-10-10 | Supabase supposé héberger l'API NestJS       | Architecture | Résolu    |
| FRC-015 | 2026-10-10 | Arriéré de branches Dependabot               | Outillage    | Ouvert    |
| FRC-016 | 2026-10-10 | Serveur exécutant des paquets périmés        | Serveur      | Résolu    |
| FRC-017 | 2026-10-10 | `jsonb` réordonne les clés des événements    | Serveur      | Résolu    |
| FRC-018 | 2026-10-10 | `crypto.randomUUID` absent sur Hermes        | Client       | Résolu    |
| FRC-019 | 2026-10-10 | Styles web inopérants en React Native        | Interface    | Résolu    |
| FRC-020 | 2026-10-10 | Règles Markdown figées par le cache Metro    | Client       | Résolu    |

---

ID : FRC-001
Date : 2026-04-10
Titre : Ref modifiée pendant le rendu React
Statut : Résolu

Contexte
`GameProvider` gardait une référence (`syncRef`) à jour pour la synchronisation de l'état du jeu.

Symptôme
La règle `react-hooks` signale une mutation de ref pendant la phase de rendu (PR #8).

Cause racine
La ref était mise à jour directement dans le corps du composant. React peut rejouer ou abandonner un rendu, ce qui rend cette mutation imprévisible.

Résolution
Déplacer la mise à jour dans un `useLayoutEffect` (commit 4e11319).

Comment l'éviter
Ne jamais écrire dans `ref.current` pendant le rendu : uniquement dans un effet ou un gestionnaire d'événement. Ne jamais désactiver la règle `react-hooks` pour faire taire l'alerte.

Temps perdu
Moins d'une heure (correctif de 6 lignes).

---

ID : FRC-002
Date : 2026-04-12
Titre : Configuration Sonar réglée par essais
Statut : Résolu

Contexte
Mise en place de SonarCloud, des rapports de couverture et des badges dans la CI.

Symptôme
L'analyse SonarCloud ne trouvait pas les bons chemins (sources, tests, rapport de couverture, exclusions) : 17 commits de configuration en 3 h 30, dont 7 qui ne touchent que les chemins et exclusions de `sonar-project.properties`.

Cause racine
La configuration a été mise au point en poussant sur la CI à chaque essai, sans connaître le format attendu (chemins relatifs à la racine, LCOV ou Clover) ni vérifier les rapports en local.

Résolution
Ajustements successifs jusqu'à une analyse correcte.

Comment l'éviter

- Lire la documentation de l'outil avant de configurer, et vérifier en local que les rapports existent aux chemins déclarés (`packages/engine/coverage/lcov.info`…).
- Itérer sur une branche dédiée, relancer avec `workflow_dispatch`, puis fusionner en un seul commit.
- Toute réorganisation de dossiers (monorepo, nouveau workspace) met à jour `sonar-project.properties` dans le même commit.

Temps perdu
Environ 3 h 30 (12:07 → 15:35 le 2026-04-12, d'après les horodatages git).

---

ID : FRC-003
Date : 2026-04-13
Titre : Modèle d'action remanié quatre fois
Statut : Résolu

Contexte
Conception du modèle des actions et effets de carte (`CardAction`, `ActionEffect`) pendant que les cartes étaient encore ajoutées au fil de l'eau. Toutes les cartes n'ont été saisies que le 2026-05-05 (23982d0).

Symptôme
Quatre remaniements lourds du même modèle en deux semaines : « card effect rework » (cd2f1bd, 60 fichiers), renommage `actions` → `actionEffects` (999d608, 36 fichiers), « Card action rework » (217bcca, 144 fichiers, environ 12 300 lignes modifiées), puis `CHOOSE_EFFECT` (7d6ed10, 29 fichiers).

Cause racine
Le modèle a été conçu à partir des premières cartes, sans inventaire préalable de toutes les mécaniques du jeu. Chaque nouvelle carte révélait un cas que le modèle ne couvrait pas.

Résolution
Remaniements successifs jusqu'au modèle actuel (`actionEffects`, une stratégie par type d'effet, effets imbriqués avec `CHOOSE_EFFECT`).

Comment l'éviter

- Avant d'implémenter un ensemble de cartes, en particulier les extensions manquantes, **inventorier toutes leurs mécaniques** : coûts, déclencheurs, cibles, choix, effets inédits. Faire évoluer le moteur une fois pour l'ensemble, et non carte par carte.
- Avec EDR-036 (les parties commencées gardent leurs règles), chaque remaniement du modèle coûte désormais aussi une compatibilité ascendante : l'inventaire préalable devient indispensable.

Temps perdu
Plusieurs jours, répartis du 2026-04-13 au 2026-04-26 (non mesuré précisément ; environ 16 000 lignes modifiées sur les quatre commits).

---

ID : FRC-004
Date : 2026-04-18
Titre : Workflows CI corrigés en cascade
Statut : Résolu

Contexte
Factorisation des workflows GitHub Actions : `ci.yml` devient réutilisable (`workflow_call`), appelé par `pr.yml` et `deploy.yml`.

Symptôme
Six commits de correction en 27 minutes (de ee7c73d à 79877e4), le dernier étant « fix ci workflow call and deploy workflow trigger ».

Cause racine
Les workflows réutilisables ont leurs propres règles (déclencheurs, `needs`, noms de jobs, concurrence) qui ont été découvertes en poussant.

Résolution
Corrections successives jusqu'à la chaîne actuelle (`pr.yml` / `deploy.yml` → `ci.yml`, déploiement après la CI).

Comment l'éviter
Même règle que FRC-002 : branche dédiée, `workflow_dispatch`, un seul commit à la fusion. Toute modification de workflow passe par `dependency-steward` et une PR relue (EDR-037).

Temps perdu
Environ 30 minutes, plus environ 30 minutes de corrections Sonar le même jour.

---

ID : FRC-005
Date : 2026-04-11
Titre : Affichage mobile cassé à répétition
Statut : Récurrent

Contexte
Interface développée et vérifiée surtout sur grand écran.

Symptôme
Au moins 7 commits de correction mobile entre le 2026-04-11 et le 2026-09-20 (2cb3d54, da35f0a, 1f4c6d4, 24e3d8d, 3a7a414, 75d75dc, ee6611a). Les joueurs citent aussi l'ergonomie mobile parmi les points négatifs (INS-017).

Cause racine
Le mobile était vérifié après coup, au lieu d'être la cible de conception.

Résolution
Correctifs au cas par cas, puis refonte e52f39b (mini-carte mobile, visionneuse avec zoom), qui a aussi amélioré la lisibilité (INS-019).

Comment l'éviter
Concevoir pour le téléphone d'abord ; vérifier chaque changement d'interface à ≤ 375 px et ≥ 1024 px avant de committer ; tester sur un vrai téléphone (INS-005, INS-017).

Temps perdu
Non mesuré : sept correctifs étalés sur cinq mois, en plus des retours négatifs des joueurs.

---

ID : FRC-006
Date : 2026-05-17
Titre : Nom de carte mal orthographié, sans erreur
Statut : Ouvert

Contexte
Le coût de la carte 25 (Engineer) cible une carte par le nom de son état.

Symptôme
L'action de la carte était inutilisable : aucune carte ne correspondait au coût, sans aucun message d'erreur.

Cause racine
Le sélecteur visait `'Fishing Boats'` alors que l'état s'appelle `'Fishing Boat'`. Les références par chaîne et par id ne sont vérifiées ni par TypeScript ni par les tests (4 tests seulement dans `packages/game-data/tests`).

Résolution
Correction du nom (d154657).

Comment l'éviter
Ajouter les tests de cohérence décrits dans INS-003 : noms, `upgradeTo`, `states.ids` et `cards.ids` existants ; clés de traduction présentes et identiques en EN et FR. Le statut reste `Ouvert` tant que ces tests n'existent pas.

Temps perdu
Non mesuré (diagnostic d'une action « muette »).

---

ID : FRC-007
Date : 2026-05-23
Titre : Fin de partie remaniée deux fois
Statut : Résolu

Contexte
Ajout du mode campagne : scores par segment, choix d'extension, purge, limite de manches par extension.

Symptôme
« end game and expansion rework » (aebad98, 71 fichiers) le 2026-05-23, suivi dès le lendemain d'un « expansion end game condition rework » (3b40677).

Cause racine
Les conditions de fin de partie propres aux extensions n'avaient pas été spécifiées entièrement avant l'implémentation.

Résolution
Introduction de `expansionMaxRound` et remise à zéro de `round` et `turn` avant la purge lors du choix d'une extension.

Comment l'éviter
Avant d'implémenter une extension, écrire sa fiche de règles complète : mise en place, conditions de fin, score, transitions entre segments de campagne. Écrire les tests de scénario de fin de partie **avant** le code. C'est d'autant plus important que la `1.0.0` dépend des extensions manquantes (EDR-018).

Temps perdu
Environ une journée (deux remaniements sur deux jours consécutifs ; non mesuré précisément).

---

ID : FRC-008
Date : 2026-05-24
Titre : Carte 119 corrigée en quatre fois
Statut : Résolu

Contexte
Carte à déclencheur avec un effet « reste en jeu ».

Symptôme
Quatre commits de correction successifs : 0c95d1d, 951a11f (effet « reste en jeu » et affichage), 229f7ef (id de déclencheur, actions, traduction FR), bc7cc21 (`END_OF_TURN` → `END_OF_ROUND`).

Cause racine
Chaque correctif était validé en jouant, sans test de scénario couvrant la séquence complète, si bien que le défaut suivant n'apparaissait qu'à la partie suivante.

Résolution
Corrections successives jusqu'au comportement attendu.

Comment l'éviter
Pour une carte à déclencheur ou à plusieurs états : relire la carte champ par champ, écrire un test de scénario `GameSession` complet, vérifier traduction et affichage, puis un seul commit (INS-001, INS-002).

Temps perdu
Environ une demi-journée : quatre commits entre le 2026-05-24 14:22 et le 2026-05-25 02:42.

---

ID : FRC-009
Date : 2026-05-24
Titre : Retour arrière dans un commit multi-sujets
Statut : Récurrent

Contexte
Commits regroupant plusieurs correctifs sans rapport (ee6611a, 594a415, f60234b…).

Symptôme
Une modification de l'affichage de la pile de déclencheurs a dû être annulée à la main (9c35391 « rollback triggerpile selection display »), faute de pouvoir faire un `git revert` ciblé.

Cause racine
Un commit regroupait plusieurs sujets : impossible d'en annuler un seul sans défaire les autres.

Résolution
Annulation manuelle du changement d'affichage.

Comment l'éviter
Un correctif par commit et un sujet par PR, avec des messages conventionnels et une portée (`fix(card-119): …`). Annuler avec `git revert <sha>`, jamais à la main (INS-008).

Temps perdu
Faible pour cet incident ; le coût réel est la traçabilité perdue sur l'historique des cartes.

---

ID : FRC-010
Date : 2026-05-28
Titre : Coûts ignorant cartes permanentes et passifs
Statut : Résolu

Contexte
Paiement des coûts (défausse, destruction) et sélection des cartes éligibles.

Symptôme
Une carte permanente ne pouvait pas être détruite pour payer un coût (ff10859), et le passif `COUNT_AS_2` n'était pas pris en compte dans les sélections fondées sur la défausse (ee6611a, 341cb6b).

Cause racine
Le code de sélection ne regardait que `board` et `boardEffects`, en oubliant `permanents` et les passifs propres à une carte.

Résolution
Inclure `board + permanents` et aligner passifs propres et effets de plateau ; les deux pièges sont consignés dans `.claude/rules/engine-reference.md`.

Comment l'éviter
Tout test de sélecteur, de coût ou de stratégie de défausse ou de destruction couvre une carte permanente et une carte avec un `COUNT_AS_2` propre (INS-004).

Temps perdu
Non mesuré.

---

ID : FRC-011
Date : 2026-10-10
Titre : Moteur côté serveur : fausse route
Statut : Résolu

Contexte
Conception du découpage client/serveur lors de l'ajout de l'API.

Symptôme
L'architecture « moteur uniquement sur le serveur » a été retenue, puis rejetée le jour même par l'auteur : « garde le moteur de jeu côté client pour permettre de jouer hors ligne ».

Cause racine
Le jeu hors ligne était une exigence implicite, jamais écrite, et l'architecture a été proposée sans la vérifier.

Résolution
Passage au modèle local-first, avec validation par rejeu côté serveur (EDR-023 → EDR-024).

Comment l'éviter
Avant toute proposition d'architecture, lister explicitement les exigences non fonctionnelles (hors ligne, coût, hébergement, triche) et les faire valider. Le hors-ligne est désormais une règle non négociable du `CLAUDE.md` (INS-011).

Temps perdu
⚠ À confirmer : quelques heures de conception, peut-être de code, le 2026-10-10.

---

ID : FRC-012
Date : 2026-10-10
Titre : Branche `master` prise pour la principale
Statut : Ouvert

Contexte
Le dépôt contient deux branches : `main`, active, et `master`, figée depuis avril, 217 commits en retard. Le pointeur local `origin/HEAD` désigne encore `master`.

Symptôme
L'assistant a déclaré `pr.yml` erroné (il cible `main`) et proposé de le passer à `master`, ce qui aurait désactivé la CI des PR. L'erreur a été repérée en comparant les deux branches, avant toute modification.

Cause racine
Un `origin/HEAD` local périmé et une ancienne branche `master` jamais supprimée, que les outils prennent pour la branche par défaut.

Résolution
Vérification de l'état réel (`git rev-list --count origin/master..origin/main`) ; aucune modification de `pr.yml`.

Comment l'éviter

- Mettre à jour le pointeur local : `git remote set-head origin -a`.
- Supprimer ou archiver la branche `master` sur GitHub et vérifier que la branche par défaut du dépôt est `main`.
- La branche de référence est `main` (CLAUDE.md) : ne jamais se fier à `origin/HEAD` sans vérifier.

Temps perdu
Environ 15 minutes ; le dommage évité (CI des PR désactivée) aurait été bien plus coûteux.

---

ID : FRC-013
Date : 2026-10-10
Titre : Documentation contredisant le code
Statut : Résolu

Contexte
Le `CLAUDE.md` racine, lu par l'assistant à chaque session, décrit les conventions des cartes.

Symptôme
Il indiquait des ids d'action au format `cardID_stateId_id`, alors que les 287 ids des cartes utilisent `<cardId>-<stateId>-<n>`. La skill `add-card` contournait déjà le problème en conseillant de suivre les cartes existantes plutôt que la doc.

Cause racine
La convention a changé dans le code sans mise à jour de la documentation dans le même commit.

Résolution
Correction du `CLAUDE.md`, puis réécriture complète du fichier le 2026-10-10.

Comment l'éviter
Toute modification de convention, de format ou de structure met à jour la documentation dans le même commit ; en cas de doute, le code fait foi (INS-009).

Temps perdu
Non mesuré ; risque de cartes générées avec des ids au mauvais format.

---

ID : FRC-014
Date : 2026-10-10
Titre : Supabase supposé héberger l'API NestJS
Statut : Résolu

Contexte
Choix de l'hébergement de production du serveur.

Symptôme
La décision initiale « serveur à héberger sur Supabase » s'est révélée impossible à appliquer : Supabase héberge PostgreSQL, l'authentification et des Edge Functions (Deno), mais n'exécute pas de serveur Node en continu.

Cause racine
Les services réellement fournis par la plateforme n'ont pas été vérifiés avant la décision.

Résolution
Base et authentification sur Supabase, API sur Google Cloud Run (EDR-034 → EDR-035).

Comment l'éviter
Avant de décider d'un hébergeur ou d'un service, vérifier dans sa documentation officielle qu'il exécute bien la pile prévue (runtime, processus long ou fonctions, limites de taille de requête, nombre d'instances).

Temps perdu
Environ 30 minutes ; la mauvaise piste a été corrigée avant tout déploiement.

---

ID : FRC-015
Date : 2026-10-10
Titre : Arriéré de branches Dependabot
Statut : Ouvert

Contexte
Dependabot en mode quotidien, sans regroupement, depuis le 2026-05-01.

Symptôme
44 branches `dependabot/*` ouvertes, dont 11 pour le seul `@eslint-react/eslint-plugin`. Certaines visent des paquets supprimés par la migration (`vite`, `tailwindcss` 4.x, `@vitejs/plugin-react`, `@dnd-kit/react`).

Cause racine
Une fréquence quotidienne sans `groups` produit une PR par version et par paquet, plus vite qu'elles ne sont traitées.

Résolution
Pas encore résolu.

Comment l'éviter
Nouvelle EDR remplaçant EDR-016 : fréquence hebdomadaire et regroupement des mises à jour mineures et correctives. Fermer les PR périmées après chaque migration de pile (INS-010).

Temps perdu
Non mesuré : tri, rebasages et risque de manquer une mise à jour de sécurité.

---

ID : FRC-016
Date : 2026-10-10
Titre : Serveur exécutant des paquets périmés
Statut : Résolu

Contexte
Le serveur exécute le `dist/` compilé des paquets partagés, alors que les autres outils lisent leurs sources TypeScript (condition `source`).

Symptôme
(reconstitué) Une modification du moteur ou des données de jeu n'a pas d'effet côté serveur, ou bien le serveur refuse des parties que le client juge valides.

Cause racine
Le `dist/` des paquets n'est pas reconstruit automatiquement après une modification, sauf par `dev:server` et `build:server`.

Résolution
`pnpm build:packages` est intégré à `dev:server` et `build:server` ; le piège est documenté dans `apps/server/CLAUDE.md`.

Comment l'éviter
Après toute modification de `packages/*`, relancer `pnpm build:packages` ou redémarrer `pnpm dev:server`. Déployer le serveur avec la même version du moteur et des données que les clients.

Temps perdu
Non mesuré.

---

ID : FRC-017
Date : 2026-10-10
Titre : `jsonb` réordonne les clés des événements
Statut : Résolu

Contexte
Stockage des journaux d'événements dans PostgreSQL et réécriture partielle à partir du premier événement différent (`firstDifference`).

Symptôme
(reconstitué) Des événements identiques sont vus comme différents une fois relus depuis la base.

Cause racine
Le type `jsonb` de PostgreSQL normalise les objets et ne conserve pas l'ordre des clés : une comparaison par `JSON.stringify` échoue.

Résolution
Comparaison des événements par contenu (égalité profonde), documentée dans `apps/server/CLAUDE.md`.

Comment l'éviter
Ne jamais comparer des événements, des états ou toute donnée `jsonb` par chaîne sérialisée (INS-013).

Temps perdu
Non mesuré.

---

ID : FRC-018
Date : 2026-10-10
Titre : `crypto.randomUUID` absent sur Hermes
Statut : Résolu

Contexte
Le moteur génère les ids d'événements et de déclencheurs avec `crypto.randomUUID()`, disponible dans les navigateurs et dans Node. Il tourne désormais aussi sur Hermes (React Native).

Symptôme
(reconstitué) Échec de création d'événements sur iOS et Android, alors que le web et le serveur fonctionnent.

Cause racine
Hermes ne fournit pas `crypto.randomUUID`.

Résolution
Polyfill basé sur `expo-crypto` dans `apps/client/src/polyfills.ts`.

Comment l'éviter
Avant d'utiliser une API globale dans `packages/` (crypto, `structuredClone`, `Intl`…), vérifier qu'elle existe sur Hermes ; sinon, ajouter un polyfill côté client et tester sur simulateur iOS ou Android, pas seulement sur le web (INS-012).

Temps perdu
Non mesuré.

---

ID : FRC-019
Date : 2026-10-10
Titre : Styles web inopérants en React Native
Statut : Résolu

Contexte
Migration de l'interface Tailwind (web) vers NativeWind (React Native).

Symptôme
(reconstitué) Textes qui n'héritent pas du style de leur parent, et surcharges de classes sans effet selon leur ordre dans `className`.

Cause racine
React Native ne fait pas hériter les styles de texte aux éléments enfants, et NativeWind résout les conflits de classes selon l'ordre de la feuille de style, pas l'ordre dans `className`. Grille CSS, `hover:`, dégradés et `backdrop-blur` n'existent pas.

Résolution
Composant `Text` avec styles par défaut et `TextStyle` pour l'héritage ; surcharges par des props dédiées (`textClassName`, `unconstrained`) ; règles consignées dans `apps/client/CLAUDE.md`.

Comment l'éviter
Tout texte passe par le composant `Text` ; on surcharge un style par une prop, jamais par l'ordre des classes ; noms de classes toujours littéraux.

Temps perdu
Non mesuré.

---

ID : FRC-020
Date : 2026-10-10
Titre : Règles Markdown figées par le cache Metro
Statut : Résolu

Contexte
Les règles du jeu (`rules.{en,fr}.md`) sont intégrées au code au moment de la compilation par `babel-plugin-inline-import`.

Symptôme
(reconstitué) Une modification des règles n'apparaît pas dans l'application, même après rechargement.

Cause racine
Metro met en cache le résultat de la transformation Babel ; un fichier importé en ligne ne déclenche pas d'invalidation.

Résolution
Redémarrer Metro en vidant son cache ; consigné dans `apps/client/CLAUDE.md`.

Comment l'éviter
Après toute modification de `rules.*.md` : `pnpm --filter @deck-legacy/client exec expo start --clear`.

Temps perdu
Non mesuré.
