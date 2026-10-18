import { keepGainableResources } from '../cardHelpers';
import { cardSelector } from '../cardSelector';
import { type ActionEffectType, PassiveType, TargetScope } from '../enums';
import { mergeResources } from '../gameStateHelper';
import type { CardDef, GameState, Resources, Sticker } from '../types';
import type { CardActionStrategy } from './CardActionStrategy';

export class AddResourceStrategy implements CardActionStrategy {
  constructor(
    private readonly cardDefs: Record<number, CardDef> = {},
    private readonly stickerDefs: Record<number, Sticker> = {},
  ) {}

  private applyAdjustAddResourcesPassives(
    gameState: GameState,
    sourceInstanceId: number,
    resources: Resources,
  ): Resources {
    let adjustedResources = resources;

    for (const [passiveSourceId, passives] of Object.entries(gameState.boardEffects)) {
      for (const passive of passives.filter(
        p => p.type === PassiveType.ADJUST_ADD_RESOURCES && p.resources,
      )) {
        const affectedInstanceIds = cardSelector(
          passive.cards ?? { scope: [TargetScope.ANY] },
          Number(passiveSourceId),
          gameState,
          this.cardDefs,
          this.stickerDefs,
        );

        if (affectedInstanceIds.includes(sourceInstanceId) && passive.resources) {
          adjustedResources = mergeResources(adjustedResources, passive.resources);
        }
      }
    }

    return adjustedResources;
  }

  apply(
    gameState: GameState,
    payload: {
      id: string;
      type: ActionEffectType;
      sourceInstanceId: number;
      resources: Resources;
      value?: number;
    },
  ): GameState {
    const resources = payload.resources
      ? Object.fromEntries(
          Object.entries(payload.resources).map(([key, amount]) => [
            key,
            amount * (payload.value ?? 1),
          ]),
        )
      : {};
    const adjustedResources = this.applyAdjustAddResourcesPassives(
      gameState,
      payload.sourceInstanceId,
      resources,
    );

    return {
      ...gameState,
      resources: mergeResources(
        gameState.resources,
        keepGainableResources(adjustedResources, gameState),
      ),
    };
  }
}
