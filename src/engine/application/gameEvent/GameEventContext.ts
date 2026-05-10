import { AdvanceStrategy } from './AdvanceStrategy';
import { CardActionEventStrategy } from './CardActionEventStrategy';
import { CardProducedStrategy } from './CardProducedStrategy';
import type { GameEventStrategy } from './GameEventStrategy';
import { GameStartedStrategy } from './GameStartedStrategy';
import { RoundStartedStrategy } from './RoundStartedStrategy';
import { SkipTriggerStrategy } from './SkipTriggerStrategy';
import { TurnEndedStrategy } from './TurnEndedStrategy';
import { TurnStartedStrategy } from './TurnStartedStrategy';
import { UpgradeCardEventStrategy } from './UpgradeCardEventStrategy';
import { ChooseStateEventStrategy } from '@engine/application/gameEvent/ChooseStateEventStrategy';
import { ParchmentCardDiscoveredStrategy } from '@engine/application/gameEvent/ParchmentCardDiscoveredStrategy';
import { RoundEndedStrategy } from '@engine/application/gameEvent/RoundEndedStrategy';
import { TriggerEventsStrategy } from '@engine/application/gameEvent/TriggerEventsStrategy';
import { GameEventType } from '@engine/domain/enums';
import type { CardDef, GameEvent, GameState, Sticker } from '@engine/domain/types';

export class GameEventContext {
  private readonly strategies: Partial<Record<GameEventType, GameEventStrategy>>;

  constructor(cardDefs: Record<number, CardDef>, stickerDefs: Record<number, Sticker>) {
    this.strategies = {
      [GameEventType.GAME_STARTED]: new GameStartedStrategy(cardDefs),
      [GameEventType.ROUND_STARTED]: new RoundStartedStrategy(),
      [GameEventType.ROUND_ENDED]: new RoundEndedStrategy(),
      [GameEventType.TURN_STARTED]: new TurnStartedStrategy(cardDefs, stickerDefs),
      [GameEventType.CARD_PRODUCED]: new CardProducedStrategy(cardDefs, stickerDefs),
      [GameEventType.ADVANCE]: new AdvanceStrategy(cardDefs, stickerDefs),
      [GameEventType.UPGRADE_CARD]: new UpgradeCardEventStrategy(cardDefs, stickerDefs),
      [GameEventType.CARD_ACTION]: new CardActionEventStrategy(),
      [GameEventType.SKIP_TRIGGER]: new SkipTriggerStrategy(),
      [GameEventType.TURN_ENDED]: new TurnEndedStrategy(cardDefs, stickerDefs),
      [GameEventType.CHOOSE_STATE]: new ChooseStateEventStrategy(),
      [GameEventType.PARCHMENT_CARD_DISCOVERED]: new ParchmentCardDiscoveredStrategy(),
      [GameEventType.TRIGGER_EVENTS]: new TriggerEventsStrategy(),
    };
  }

  apply(gameState: GameState, event: GameEvent): GameState {
    const strategy = this.strategies[event.type as GameEventType];
    if (!strategy) {
      throw new Error(`Unknown event type: ${event.type}`);
    }
    return strategy.apply(gameState, event);
  }
}
