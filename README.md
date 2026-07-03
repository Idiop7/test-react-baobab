# Pokédex Temps Réel sous Stress

Test technique — Développeur Senior React Native (Baobab). Pokédex propulsé par la
[PokéAPI](https://pokeapi.co/docs/v2), pensé pour rester fluide pendant qu'un flux
simulé met à jour les statistiques de chaque Pokémon visible toutes les 500ms.

## Sommaire

- [Stack](#stack)
- [Démarrage](#démarrage)
- [Architecture](#architecture)
- [Choix techniques](#choix-techniques)
- [Stratégie de performance (60 FPS sous stress)](#stratégie-de-performance-60-fps-sous-stress)
- [Offline & cache](#offline--cache)
- [Cycle de vie de l'app (AppState)](#cycle-de-vie-de-lapp-appstate)
- [Tests](#tests)
- [Build & déploiement](#build--déploiement)
- [Limitations connues](#limitations-connues)

## Stack

TypeScript strict · Expo (managed + dev-client) · `@tanstack/react-query` ·
`zustand` · `react-native-mmkv` · `@react-navigation` · `zod` · `nativewind` ·
`@shopify/flash-list` · `@react-native-community/netinfo`.

Trois libs ont été ajoutées au-delà de la liste imposée par le sujet, et justifiées
ci-dessous : **FlashList** (perf de liste), **NetInfo** (détection réseau réelle côté
mobile) et **@testing-library/react-native** (tests de composants).

## Démarrage

```bash
npm install
npm run start        # Expo Go (aperçu JS uniquement, sans les modules natifs — voir plus bas)
npm run typecheck
npm run lint
npm run test:coverage
```

> ⚠️ `react-native-mmkv`, `react-native-reanimated`, etc. sont des modules natifs :
> ils ne fonctionnent pas dans Expo Go. Pour un run complet avec ces modules, il faut
> un **dev client** buildé via EAS (voir [Build & déploiement](#build--déploiement)).

## Architecture

```
src/
  api/                 # fetch + validation Zod + hooks react-query
    schemas/            # schémas Zod = source de vérité des types (z.infer)
    client.ts            # fetch wrapper, ne connaît pas la forme des données
    pokeapi.service.ts   # fetch -> schema.parse() -> data validée (jamais d'`any`)
    queries.ts            # hooks react-query (useInfiniteQuery / useQuery)
  domain/
    async-state.ts        # union discriminante AsyncState<T> partagée par les 2 écrans
  state/
    statsStore.ts          # zustand : simulation de stats "temps réel" (voir plus bas)
  storage/
    mmkv.ts, queryPersister.ts   # persistance offline du cache react-query
  lib/
    queryClient.ts          # QueryClient + branchement NetInfo/AppState
    appLifecycle.ts          # hook générique de réaction à l'AppState
    toAsyncState.ts           # adaptateur react-query -> AsyncState<T>
  navigation/               # stack typée (2 écrans)
  features/
    pokedex-list/             # Écran 1 : grille infinie sous stress
    pokemon-details/           # Écran 2 : détails, évolutions, mouvements, offline
  ui/                          # composants de présentation partagés (Nativewind)
```

## Choix techniques

- **Aucun `any`** : `strict: true` + `noUncheckedIndexedAccess` + règle ESLint
  dédiée. Chaque accès à un tableau/objet indexé est vérifié.
- **Zod à l'entrée de l'app** : [`pokeapi.service.ts`](src/api/pokeapi.service.ts)
  fait passer *chaque* réponse de la PokéAPI dans `schema.safeParse()` avant qu'elle
  n'entre dans le cache react-query. Les types (`PokemonDetail`, `EvolutionChain`, …)
  sont `z.infer<...>` des schémas : une seule source de vérité, jamais de duplication
  manuelle des interfaces.
- **Unions discriminantes** : [`AsyncState<T>`](src/domain/async-state.ts)
  (`idle | loading | success | offline-cached | error`) remplace les booléens
  `isLoading`/`isError` épars. [`toAsyncState`](src/lib/toAsyncState.ts) adapte le
  résultat react-query vers cette union ; les écrans font un `switch` exhaustif
  (`assertUnreachable` garantit qu'un nouveau statut oublié casse la compilation).

## Stratégie de performance (60 FPS sous stress)

Le sujet demande de faire fluctuer les stats des Pokémon **visibles** toutes les
500ms sans faire chuter le framerate pendant un scroll rapide. Implémentation dans
[`statsStore.ts`](src/state/statsStore.ts) + [`PokemonGrid.tsx`](src/features/pokedex-list/components/PokemonGrid.tsx) :

1. **Un seul ticker global** (`setInterval` 500ms), pas un timer par cellule.
2. À chaque tick, seuls les ids **actuellement visibles** sont mutés — la visibilité
   est suivie via `onViewableItemsChanged` de FlashList.
3. **Mise à jour immuable partielle** : le tick ne remplace que les sous-objets des
   ids visibles dans le `Record<id, LiveStats>` ; les ids hors-écran gardent
   exactement la même référence d'objet.
4. Chaque cellule s'abonne à Zustand avec un **sélecteur scopé à son propre id**
   (`useStatsStore(s => s.liveStats[id])`). Comme Zustand bail-out sur égalité
   référentielle du résultat du sélecteur, seules les ~15 cellules réellement à
   l'écran re-render à chaque tick — pas les centaines d'items chargés.
5. `React.memo` sur `PokemonGridItem` (comparateur sur `name`/`url` uniquement) +
   `FlashList` pour la virtualisation.
6. Les barres de stats ([`StatBar.tsx`](src/ui/StatBar.tsx)) animent leur largeur via
   **Reanimated** (`useSharedValue`/`withTiming`), donc l'interpolation tourne sur le
   thread UI et ne bloque jamais le thread JS pendant un tick.
7. Le ticker est **coupé** dès que l'écran perd le focus ou que l'app passe en
   arrière-plan (voir section suivante) — jamais de timer qui tourne dans le vide.

## Offline & cache

- `persistQueryClient` (react-query) est branché sur un **persister MMKV maison**
  ([`queryPersister.ts`](src/storage/queryPersister.ts)). MMKV étant synchrone, c'est
  plus rapide que le persister AsyncStorage par défaut (pas d'aller-retour de pont
  asynchrone).
- `onlineManager` de react-query est branché sur **NetInfo** au lieu du
  `navigator.onLine` web par défaut ([`queryClient.ts`](src/lib/queryClient.ts)).
- Les données d'un Pokémon (stats, types, évolutions) sont considérées quasi
  immuables côté API → `staleTime: Infinity` sur ces requêtes : une fois vues, elles
  restent disponibles offline indéfiniment depuis le cache persistant.
- Quand une requête réussie est **paused** (pas de réseau, données servies depuis le
  cache), l'état `AsyncState` bascule sur `offline-cached` et une bannière s'affiche.

## Cycle de vie de l'app (AppState)

[`useStatsTicker`](src/features/pokedex-list/hooks/useStatsTicker.ts) combine deux
signaux indépendants pour piloter le ticker de stress :

- **Focus de l'écran** (`useFocusEffect` de react-navigation) : le ticker tourne
  uniquement quand la grille est l'écran actif.
- **AppState de l'OS** (hook générique [`useOnAppStateChange`](src/lib/appLifecycle.ts)) :
  passage en arrière-plan → ticker coupé ; retour au premier plan → ticker relancé
  (si l'écran est toujours focus).

`focusManager` de react-query est lui aussi branché sur l'AppState (au lieu de
`window.focus` par défaut) pour que les refetch-on-focus se comportent correctement
sur mobile.

## Tests

```bash
npm run test            # jest
npm run test:coverage    # avec rapport de couverture
```

10 suites / 42 tests couvrant les couches "logique" : schémas Zod (cas valides et
invalides), `statsStore` (le tick ne mute que les ids visibles, référence stable pour
les autres), `pokeapi.service` (validation, erreurs réseau, composition
species → evolution-chain → stages), l'adaptateur `AsyncState`, `client.ts`. Seuils de
couverture configurés dans [`jest.config.js`](jest.config.js) (≥90% lignes/statements
sur ce périmètre).

**Portée volontairement limitée aux modules "logique pure"** — écrans, composants
React et hooks (`appLifecycle`, `queryClient`, `queries.ts`) sont exclus de ce
rapport de couverture. Raison concrète : `@testing-library/react-native@14` dépend
désormais de `test-renderer` (successeur moderne de `react-test-renderer`,
aujourd'hui déprécié), et l'installation de ce package a été bloquée par la politique
de sécurité de l'environnement de développement utilisé pour ce test (paquet non
vérifié au préalable). Pour activer les tests de rendu :

```bash
npm install -D test-renderer
```

puis ajouter des tests avec `render()` de `@testing-library/react-native` (déjà
présent en devDependency) sur les composants de `src/features/**/components` et
`src/ui`.

## Build & déploiement

La machine utilisée pour ce test n'a ni Android SDK, ni CocoaPods, ni Xcode complet
(CLT seulement) : impossible de builder l'app nativement en local. `eas.json` est
prêt à l'emploi :

```bash
npx eas login
npx eas build --profile development   # build cloud, installe le dev client sur device/simulateur
npx expo start --dev-client
```

Pour un simple aperçu JS (sans MMKV/Reanimated natifs) : `npm run start` + Expo Go.

## Limitations connues

- Composants/écrans non couverts par des tests automatisés dans cet environnement
  (voir [Tests](#tests)) — logique métier entièrement testée en revanche.
- Pas de vérification visuelle réelle sur simulateur/device effectuée dans cet
  environnement (contrainte outillage, voir ci-dessus) : à valider via EAS build.
- `flattenEvolutionChain` prend la première branche d'évolution en cas de
  branchement (ex: Eevee) — choix délibéré pour rester simple sur l'affichage,
  documenté ici plutôt que masqué.
