# Kingdom Legacy — Règles

## Objectif

Développez votre royaume en améliorant vos cartes, manche après manche. Vous ne pouvez pas perdre : votre score est la **Gloire** ({{glory}}) totale de votre royaume à la fin de la partie.

---

## Règles d'or

1. **Une carte ne change de face que par une règle.** L'application tourne les cartes pour vous quand une amélioration ou un effet le demande.
2. **Vous pouvez regarder toutes les faces des cartes en jeu et de votre défausse**, mais pas les cartes que vous n'avez pas encore découvertes.
3. **Une carte qui change de face est immédiatement défaussée**, qu'elle ait été améliorée ou tournée par un effet.
4. **Améliorer une carte termine votre tour.**
5. **On ne peut pas ajouter d'autocollant de ressource sur une carte qui produit déjà 9 ressources ou plus.**

---

## Un nouveau royaume

Chaque partie est un **royaume**. Sur la page d'accueil, touchez **Nouveau royaume**, donnez-lui un nom et choisissez de commencer ou non par le tutoriel. Vous pouvez aussi saisir une **graine** : deux royaumes avec la même graine ont les mêmes mélanges, pour rejouer une partie ou défier un ami. La graine de votre partie est affichée dans les options. Votre royaume commence avec les cartes **1 à 10**, mélangées pour former votre deck ; les autres cartes attendent d'être découvertes.

Le tutoriel vous guide pendant une première manche ; à la fin, vous pouvez garder cette partie ou en commencer une nouvelle. Vos royaumes sont listés sur la page d'accueil avec leur score total, le score du jeu de base et le score après chaque extension. Vous pouvez garder **un royaume** sans compte et jusqu'à **10** avec un compte.

---

## Manches

Une **manche** est une suite de tours qui se termine quand votre deck est vide.

- Les cartes forment deux paquets. Le **paquet de campagne** (cartes **1 à 70** dans le jeu de base) raconte l'histoire ; le **paquet de cartes découvrables** (au-delà du n° 70) contient les cartes que seuls des effets de cartes découvrent.
- Au début de chaque manche (à partir de la 2e), **l'histoire avance** : les **2 cartes** suivantes du paquet de campagne, dans l'ordre des numéros, sont **découvertes** et rejoignent votre deck. Si la première est une **carte parchemin**, ses instructions s'appliquent immédiatement, puis elle est détruite.
- L'aperçu de manche montre les cartes que vous venez de découvrir ; touchez **▶︎ Commencer la manche** pour mélanger toutes vos cartes en un nouveau deck et jouer le premier tour.
- La partie se termine après la manche où vous découvrez la carte **n° 70**. Si, à la fin d'une manche, le paquet de campagne contient moins de cartes que la manche suivante doit en découvrir, cette manche est la dernière et la campagne se termine ; les cartes qu'il contient encore à la fin de la partie ne seront jamais découvertes.

---

## Tour

Chaque tour commence en jouant les **4 premières cartes** de votre deck sur le plateau (toutes s'il en reste moins). La carte du dessus de votre deck est toujours visible.

Faites ensuite vos actions dans l'ordre que vous voulez, jusqu'à la fin de votre tour :

| **Action**            | **Comment**                                                                                                                               |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **Produire**          | Touchez la production d'une carte : vous gagnez ses ressources et la carte est défaussée. Une carte sans production ne peut pas produire. |
| **Utiliser un effet** | Touchez un effet d'une carte et payez son coût s'il y en a un (voir _Effets_).                                                            |
| **Améliorer**         | Touchez une amélioration d'une carte et payez son coût : la carte change de face et **votre tour se termine**.                            |
| **Progresser**        | Jouez **2 cartes de plus** depuis votre deck. Vous pouvez progresser plusieurs fois.                                                      |
| **Fin de tour**       | Terminez votre tour sans améliorer.                                                                                                       |

Une carte défaussée par un autre effet ne donne pas sa production.

### Ressources

Les ressources se gagnent en produisant et grâce à certains effets, et se dépensent pour payer des coûts. **Toutes vos ressources sont perdues dès qu'une nouvelle carte entre en jeu et à la fin du tour** : ne les gagnez que lorsque vous pouvez les dépenser. L'application vous prévient avant de progresser avec des ressources non dépensées.

|           | **Ressource** |            | **Ressource**   |
| --------- | ------------- | ---------- | --------------- |
| {{gold}}  | **Or**        | {{weapon}} | **Épée**        |
| {{wood}}  | **Bois**      | {{goods}}  | **Marchandise** |
| {{stone}} | **Pierre**    | {{iron}}   | **Fer**         |

Une barre oblique (/) entre des ressources signifie « ou » : vous en choisissez une.

**Nouvelles ressources :** certaines extensions ajoutent de nouvelles ressources. Un effet qui donne « 1 ressource au choix » les inclut, et quand vous ajoutez « 1 autocollant de ressource au choix », ce peut être l'une d'elles, même si l'effet cite les autocollants 1 à 6 (les ressources du jeu de base).

### Fin de tour et fin de manche

- **Fin de tour :** les effets _Fin de tour_ s'appliquent, puis toutes les cartes en jeu sont défaussées, sauf celles qui **restent en jeu**. Un nouveau tour commence s'il reste des cartes dans votre deck ; sinon, la manche se termine.
- **Fin de manche :** toutes les cartes sont défaussées, même celles qui restent en jeu, et les effets _Fin de manche_ s'appliquent. Une nouvelle manche commence ensuite.

---

## Effets

Chaque effet commence par une icône qui indique comment l'utiliser :

| **Icône**           | **Effet**                  | **Utilisation**                                                                                     |
| ------------------- | -------------------------- | --------------------------------------------------------------------------------------------------- |
| {{passif}}          | **Passif**                 | S'applique toujours.                                                                                |
| {{unlimited}}       | **Illimité**               | S'utilise plusieurs fois sans défausser la carte.                                                   |
| {{action}}          | **Activé**                 | Défaussez la carte pour appliquer l'effet.                                                          |
| {{time}}            | **Temps**                  | Défaussez la carte (sauf si elle est permanente) et **terminez votre tour** pour appliquer l'effet. |
| {{destroy}}         | **Destruction**            | Détruisez la carte pour appliquer l'effet.                                                          |
| {{optionalTrigger}} | **Déclenché, optionnel**   | Peut s'utiliser quand son événement survient (par ex. _Fin de tour_). Ne défausse pas la carte.     |
| {{trigger}}         | **Déclenché, obligatoire** | Pareil, mais il doit être appliqué.                                                                 |

Certains effets ne s'utilisent **qu'une seule fois** : une fois utilisés, ils ne sont plus proposés.

### Effets en attente

Quand plusieurs effets surviennent en même temps, ils attendent dans le panneau des **effets en attente** : vous choisissez l'ordre dans lequel les résoudre, et vous devez tous les résoudre, sauf les effets optionnels, que vous pouvez **passer**. Les cartes jouées ensemble (4 au début d'un tour, 2 en progressant) sont toutes en jeu quand leurs effets _Carte jouée_ sont résolus.

### Portée des effets

Sauf indication contraire, un effet ne cible que les **cartes en jeu**, pas les cartes permanentes. Votre **royaume** désigne toutes les cartes de votre deck, en jeu, de votre défausse et vos cartes permanentes, mais pas les cartes bloquées.

---

## Mécaniques des cartes

### Améliorations et faces

La plupart des cartes ont plusieurs **étapes**. Le coût de chaque amélioration est indiqué sur la carte ; l'application tourne la carte vers sa nouvelle étape. Certains effets tournent une carte ({{upgrade}}) sans que ce soit une amélioration : cela ne termine **pas** votre tour, mais la carte est quand même défaussée (règle d'or 3).

- **Choisir une face :** quand vous découvrez certaines cartes, vous choisissez la face de départ.
- **Réinitialiser** une carte la ramène à son étape de départ.

### Pistes

Certaines cartes ont une rangée de **cases** à marquer. Marquer une case peut coûter des ressources et donne ce qui est indiqué dedans ; la carte précise ce que donne une piste complète. Les cases se marquent dans n'importe quel ordre, sauf si la carte indique de gauche à droite.

### Rester en jeu et cartes permanentes

- Une carte qui **reste en jeu** n'est pas défaussée à la fin du tour. Elle est quand même défaussée quand elle produit, quand elle utilise un effet qui la défausse, ou à la fin de la manche.
- Les cartes **permanentes** ne sont jamais mélangées dans votre deck et ne peuvent pas être défaussées. Leurs effets s'appliquent toujours, mais elles ne sont **pas en jeu**.

### Bloquer et détruire

- Une carte **bloquée** est placée sous la carte qui la bloque et compte comme absente. Si la carte qui bloque est défaussée pendant votre tour, la carte bloquée revient en jeu (elle n'est pas _jouée_) ; à la fin du tour ou de la manche, les deux sont défaussées.
- Une carte **détruite** ({{destroy}}) quitte définitivement votre royaume.

### Découvrir et votre deck

- Certains effets **font avancer l'histoire** : ils découvrent les cartes suivantes du paquet de campagne, comme au début d'une manche.
- Une carte découverte par un effet va dans votre **défausse**. Si un effet vous laisse découvrir une carte parmi plusieurs, vous les voyez toutes avant de choisir.
- Certains effets placent des cartes sur ou sous votre deck ; ils ne peuvent pas s'utiliser quand votre deck est vide. Un deck vide termine toujours la manche après le tour.

### Autocollants

Certains effets ajoutent des **autocollants** sur une carte : production, Gloire ou rester en jeu. Les autocollants viennent de votre **réserve d'autocollants** : s'il n'en reste plus, l'effet est ignoré. **Renforcer** une carte signifie lui ajouter un autocollant d'une ressource qu'elle produit déjà, pour qu'elle en produise 1 de plus.

### Équipements

Certaines cartes ont un troisième bandeau, rouge, qui commence par **« Équiper »** suivi d'un mot-clé : ce sont des **équipements**, destinés à être attachés à une carte qui a ce mot-clé.

- **Non équipé**, un équipement n'a ni production ni effet, mais il compte quand même comme une carte en jeu avec ses mots-clés et sa Gloire, et il peut être amélioré comme n'importe quelle carte.
- **Équiper** est une action : attachez l'équipement à une carte en jeu qui a le mot-clé demandé. Cela ne peut pas se faire en réaction à un autre effet, comme un effet _Carte jouée_.
- **Une fois équipé**, l'équipement ne compte plus comme une carte à part entière : sa production, sa Gloire, ses mots-clés et ses effets comptent comme faisant partie de la carte qui le porte. Par exemple, une personne qui vaut 3 {{glory}} et porte un équipement qui vaut 5 {{glory}} vaut 8 {{glory}} ; un bâtiment qui produit 1 {{gold}} et porte un équipement qui produit 1 {{wood}} produit les deux.
- Si la carte qui le porte est bloquée ou détruite, l'équipement l'est aussi. Si elle change de face, est défaussée ou quitte le jeu d'une autre façon, l'équipement est défaussé. Un effet qui raye la production de la carte raye aussi celle de son équipement.
- Une carte équipée ne peut pas être améliorée, déséquipée ni équipée sur une autre carte.

### Cartes à onglet

Certains effets ajoutent un **onglet** à une carte avec un autocollant : une carte à onglet reste repérée et se voit où qu'elle soit dans votre deck.

---

## Ennemis

Les cartes rouges sont **négatives**, en général des cartes _Ennemi_ ou _Événement_ ; toutes les autres cartes sont **alliées**. Les cartes négatives ne peuvent pas être purgées normalement.

- **Vaincre :** la plupart des ennemis indiquent comment les vaincre : ils sont détruits, tournés, ou une case est marquée. Un ennemi sans instruction de défaite ne peut pas être vaincu. Une carte qui vainc un ennemi pour vous (comme le Trébuchet) applique gratuitement la défaite de cet ennemi : vous n'en payez pas le coût, mais un ennemi détruit quand il est vaincu est quand même détruit. Certaines cartes réagissent **quand vous vainquez un ennemi** (par exemple en vous laissant les améliorer) : vous devez déjà avoir les ressources demandées.
- Certains ennemis **limitent vos ressources** tant qu'ils sont en jeu : vous ne pouvez gagner que des {{weapon}}, ou vous ne pouvez utiliser les {{weapon}} que pour améliorer des cartes (pas pour les effets, les pistes ni les effets {{time}}).
- Les **Prisonniers** sont des ennemis vaincus. Ils sont aussi négatifs, mais après avoir choisi les cartes d'une purge, vous pouvez y ajouter jusqu'à 2 Prisonniers.

---

## Mots-clés des cartes

| **Mot-clé**            | **Description**                    |
| ---------------------- | ---------------------------------- |
| **Terre**              | Cartes de territoire de base       |
| **Bâtiment**           | Cartes d'infrastructure            |
| **Personne**           | Cartes de personnage               |
| **Bétail**             | Cartes d'animaux                   |
| **Maritime**           | Cartes navales                     |
| **Ennemi / Événement** | Cartes rouges — toujours négatives |

---

## Extensions

Une fois le jeu de base terminé, vous pouvez poursuivre votre royaume avec des **extensions**, une à la fois : chacune ajoute des manches, et souvent de nouvelles cartes et de nouveaux concepts. Chaque royaume ne peut jouer chaque extension qu'une seule fois. Les mini-extensions ajoutent 4 manches sans découvrir de nouvelles cartes à chaque manche ; les grandes extensions ajoutent des manches et beaucoup de nouvelles cartes, avec leur propre paquet de campagne et leur paquet de cartes découvrables (Ridding the Woods : cartes 1 à 25 et 26 à 29).

### Purge

Avant chaque extension, vous **purgez** votre royaume : les cartes purgées sont détruites, mais leur Gloire est conservée dans votre score.

- **Purge N :** votre deck est mélangé et découpé en lots de N cartes ; dans chaque lot, choisissez **1 carte alliée** à purger. Quand il reste moins de N cartes, la sélection est terminée.
- **Purger une carte permanente :** choisissez librement une carte permanente alliée.
- Les cartes qui ne peuvent être ni détruites ni purgées ne sont jamais proposées.
- **Focus :** certaines extensions demandent une purge avec un focus, par exemple « focus 2 {{wood}} » : dans chaque lot, vous devez choisir une carte qui produit du {{wood}} si le lot en contient, jusqu'à avoir purgé 2 cartes de ce type. La purge continue ensuite normalement.
- Les effets qui s'appliquent quand des cartes sont purgées sont résolus, puis la Gloire des cartes purgées est ajoutée à votre **Gloire purgée**.

---

## Annuler

Le **bouton ↩︎** annule votre dernière action, autant de fois que vous voulez, sauf les actions qui ont révélé de nouvelles cartes (début de tour, progression, pioche).

---

## Score et sauvegarde

Votre partie est **sauvegardée automatiquement** sur votre appareil après chaque action, et synchronisée avec votre compte quand vous êtes connecté. À la fin de la partie, votre score est la **Gloire** ({{glory}}) totale de toutes les cartes de votre royaume (deck, défausse, cartes en jeu et permanentes) plus votre Gloire purgée. Avec un compte, vos scores apparaissent dans le classement.
