import { AdvanceStrategy } from './AdvanceStrategy';
import { CampaignScoreSavedStrategy } from './CampaignScoreSavedStrategy';
import { CardActionEventStrategy } from './CardActionEventStrategy';
import { CardProducedStrategy } from './CardProducedStrategy';
import { ExpansionSelectedStrategy } from './ExpansionSelectedStrategy';
import type { GameEventStrategy } from './GameEventStrategy';
import { GameStartedStrategy } from './GameStartedStrategy';
import { PurgeCardSelectedStrategy } from './PurgeCardSelectedStrategy';
import { PurgeFinalizedStrategy } from './PurgeFinalizedStrategy';
import { PurgeOnTriggeredStrategy } from './PurgeOnTriggeredStrategy';
import { PurgePermanentSelectedStrategy } from './PurgePermanentSelectedStrategy';
import { RoundStartedStrategy } from './RoundStartedStrategy';
import { SkipTriggerStrategy } from './SkipTriggerStrategy';
import { TurnEndedStrategy } from './TurnEndedStrategy';
import { TurnStartedStrategy } from './TurnStartedStrategy';
import { UpgradeCardEventStrategy } from './UpgradeCardEventStrategy';
import { ChooseStateEventStrategy } from '@engine/application/gameEvent/ChooseStateEventStrategy';
import { GameEndedStrategy } from '@engine/application/gameEvent/GameEndedStrategy';
import { ParchmentCardDiscoveredStrategy } from '@engine/application/gameEvent/ParchmentCardDiscoveredStrategy';
import { RoundEndedStrategy } from '@engine/application/gameEvent/RoundEndedStrategy';
import { GameEventType } from '@engine/domain/enums';
import type { CardDef, GameEvent, GameState, Sticker } from '@engine/domain/types';

export class GameEventContext {
  private readonly strategies: Partial<Record<GameEventType, GameEventStrategy>>;

  constructor(cardDefs: Record<number, CardDef>, stickerDefs: Record<number, Sticker>) {
    this.strategies = {
      [GameEventType.GAME_STARTED]: new GameStartedStrategy(cardDefs),
      [GameEventType.GAME_ENDED]: new GameEndedStrategy(),
      [GameEventType.ROUND_STARTED]: new RoundStartedStrategy(),
      [GameEventType.ROUND_ENDED]: new RoundEndedStrategy(),
      [GameEventType.TURN_STARTED]: new TurnStartedStrategy(cardDefs, stickerDefs),
      [GameEventType.CARD_PRODUCED]: new CardProducedStrategy(cardDefs, stickerDefs),
      [GameEventType.ADVANCE]: new AdvanceStrategy(cardDefs, stickerDefs),
      [GameEventType.UPGRADE_CARD]: new UpgradeCardEventStrategy(cardDefs, stickerDefs),
      [GameEventType.CARD_ACTION]: new CardActionEventStrategy(cardDefs, stickerDefs),
      [GameEventType.SKIP_TRIGGER]: new SkipTriggerStrategy(cardDefs, stickerDefs),
      [GameEventType.TURN_ENDED]: new TurnEndedStrategy(cardDefs, stickerDefs),
      [GameEventType.CHOOSE_STATE]: new ChooseStateEventStrategy(),
      [GameEventType.PARCHMENT_CARD_DISCOVERED]: new ParchmentCardDiscoveredStrategy(),
      [GameEventType.CAMPAIGN_SCORE_SAVED]: new CampaignScoreSavedStrategy(),
      [GameEventType.EXPANSION_SELECTED]: new ExpansionSelectedStrategy(cardDefs),
      [GameEventType.PURGE_CARD_SELECTED]: new PurgeCardSelectedStrategy(),
      [GameEventType.PURGE_PERMANENT_SELECTED]: new PurgePermanentSelectedStrategy(),
      [GameEventType.PURGE_ON_TRIGGERED]: new PurgeOnTriggeredStrategy(),
      [GameEventType.PURGE_FINALIZED]: new PurgeFinalizedStrategy(cardDefs),
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
