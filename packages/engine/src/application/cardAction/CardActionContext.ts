import { ActionEffectType } from '../../domain/enums';
import type { CardDef, GameState, ResolvedActionEffect, Sticker } from '../../domain/types';
import { AddBoardEffectStrategy } from './AddBoardEffectStrategy';
import { AddCumulatedStrategy } from './AddCumulatedStrategy';
import { AddGloryStrategy } from './AddGloryStrategy';
import { AddResourceStrategy } from './AddResourceStrategy';
import { AddStickerStrategy } from './AddStickerStrategy';
import { AddToPurgeStrategy } from './AddToPurgeStrategy';
import { AdvanceStoryStrategy } from './AdvanceStoryStrategy';
import { BlockCardStrategy } from './BlockCardStrategy';
import type { CardActionStrategy } from './CardActionStrategy';
import { ChoseStateStrategy } from './ChoseStateStrategy';
import { DefeatCardStrategy } from './DefeatCardStrategy';
import { DestroyCardStrategy } from './DestroyCardStrategy';
import { DiscardCardStrategy } from './DiscardCardStrategy';
import { DiscoverCardStrategy } from './DiscoverCardStrategy';
import { EndGameStrategy } from './EndGameStrategy';
import { PlaceCardInPileStrategy } from './PlaceCardInDrawPileStrategy';
import { PlayCardStrategy } from './PlayCardStrategy';
import { RemoveResourceOnCardStrategy } from './RemoveResourceOnCardStrategy';
import { SaveFromPurgeStrategy } from './SaveFromPurgeStrategy';
import { SetCumulatedStrategy } from './SetCumulatedStrategy';
import { ShuffleDeckStrategy } from './ShuffleDeckStrategy';
import { TrackAdvanceStrategy } from './TrackAdvanceStrategy';
import { UpgradeCardStrategy } from './UpgradeCardStrategy';

export class CardActionContext {
  private readonly strategies: Partial<Record<ActionEffectType, CardActionStrategy>>;
  private currentStrategy: CardActionStrategy | null = null;

  constructor(cardDefs: Record<number, CardDef>, stickerDefs: Record<number, Sticker>) {
    this.strategies = {
      [ActionEffectType.ADD_RESOURCES]: new AddResourceStrategy(cardDefs, stickerDefs),
      [ActionEffectType.REMOVE_RESOURCE_ON_CARD]: new RemoveResourceOnCardStrategy(),
      [ActionEffectType.DISCARD_CARD]: new DiscardCardStrategy(cardDefs, stickerDefs),
      [ActionEffectType.DISCOVER_CARD]: new DiscoverCardStrategy(cardDefs),
      [ActionEffectType.ADVANCE_STORY]: new AdvanceStoryStrategy(cardDefs),
      [ActionEffectType.DESTROY_CARD]: new DestroyCardStrategy(),
      [ActionEffectType.DEFEAT_CARD]: new DefeatCardStrategy(cardDefs),
      [ActionEffectType.UPGRADE_CARD]: new UpgradeCardStrategy(cardDefs, stickerDefs),
      [ActionEffectType.PLACE_CARD_IN_PILE]: new PlaceCardInPileStrategy(),
      [ActionEffectType.BLOCK_CARD]: new BlockCardStrategy(),
      [ActionEffectType.ADD_BOARD_EFFECT]: new AddBoardEffectStrategy(),
      [ActionEffectType.PLAY_CARD]: new PlayCardStrategy(cardDefs, stickerDefs),
      [ActionEffectType.BOOST_CARD]: new AddStickerStrategy(),
      [ActionEffectType.ADD_STICKER]: new AddStickerStrategy(),
      [ActionEffectType.CHOOSE_STATE]: new ChoseStateStrategy(),
      [ActionEffectType.TRACK_ADVANCE]: new TrackAdvanceStrategy(cardDefs, stickerDefs),
      [ActionEffectType.SET_CUMULATED]: new SetCumulatedStrategy(),
      [ActionEffectType.ADD_CUMULATED]: new AddCumulatedStrategy(),
      [ActionEffectType.END_GAME]: new EndGameStrategy(),
      [ActionEffectType.SHUFFLE_DECK]: new ShuffleDeckStrategy(),
      [ActionEffectType.ADD_GLORY]: new AddGloryStrategy(cardDefs, stickerDefs),
      [ActionEffectType.SAVE_FROM_PURGE]: new SaveFromPurgeStrategy(),
      [ActionEffectType.ADD_TO_PURGE]: new AddToPurgeStrategy(),
    };
  }

  setStrategy(strategy: CardActionStrategy): void {
    this.currentStrategy = strategy;
  }

  apply(gameState: GameState, payload: ResolvedActionEffect): GameState {
    const strategy = this.currentStrategy ?? this.strategies[payload.type];
    if (!strategy) {
      throw new Error('CardActionStrategy not set in CardActionContext');
    }
    return strategy.apply(gameState, payload);
  }
}
