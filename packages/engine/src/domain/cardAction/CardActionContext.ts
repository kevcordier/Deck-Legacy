import { ActionEffectType } from '../enums';
import type { CardDef, GameState, ResolvedActionEffect, Sticker } from '../types';
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
import { CrossOutActionStrategy } from './CrossOutActionStrategy';
import { CrossOutGloryStrategy } from './CrossOutGloryStrategy';
import { DefeatCardStrategy } from './DefeatCardStrategy';
import { DestroyCardStrategy } from './DestroyCardStrategy';
import { DiscardCardStrategy } from './DiscardCardStrategy';
import { DiscoverCardStrategy } from './DiscoverCardStrategy';
import { EndGameStrategy } from './EndGameStrategy';
import { EquipStrategy } from './EquipStrategy';
import { LoseNextResourcesStrategy } from './LoseNextResourcesStrategy';
import { PlaceCardInPileStrategy } from './PlaceCardInDrawPileStrategy';
import { PlayCardStrategy } from './PlayCardStrategy';
import { RemoveResourceOnCardStrategy } from './RemoveResourceOnCardStrategy';
import { RemoveStickerStrategy } from './RemoveStickerStrategy';
import { SaveFromPurgeStrategy } from './SaveFromPurgeStrategy';
import { SetCumulatedStrategy } from './SetCumulatedStrategy';
import { ShuffleDeckStrategy } from './ShuffleDeckStrategy';
import { TrackAdvanceStrategy } from './TrackAdvanceStrategy';
import { UnblockCardStrategy } from './UnblockCardStrategy';
import { UnlockStrategy } from './UnlockStrategy';
import { UpgradeCardStrategy } from './UpgradeCardStrategy';
import { UseCardActionStrategy } from './UseCardActionStrategy';

export class CardActionContext {
  private readonly strategies: Partial<Record<ActionEffectType, CardActionStrategy>>;
  private currentStrategy: CardActionStrategy | null = null;

  constructor(cardDefs: Record<number, CardDef>, stickerDefs: Record<number, Sticker>) {
    this.strategies = {
      [ActionEffectType.ADD_RESOURCES]: new AddResourceStrategy(cardDefs, stickerDefs),
      [ActionEffectType.REMOVE_RESOURCE_ON_CARD]: new RemoveResourceOnCardStrategy(stickerDefs),
      [ActionEffectType.DISCARD_CARD]: new DiscardCardStrategy(cardDefs, stickerDefs),
      [ActionEffectType.DISCOVER_CARD]: new DiscoverCardStrategy(cardDefs, stickerDefs),
      [ActionEffectType.ADVANCE_STORY]: new AdvanceStoryStrategy(cardDefs, stickerDefs),
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
      [ActionEffectType.USE_CARD_ACTION]: new UseCardActionStrategy(),
      [ActionEffectType.LOSE_NEXT_RESOURCES]: new LoseNextResourcesStrategy(),
      [ActionEffectType.UNLOCK]: new UnlockStrategy(),
      [ActionEffectType.REMOVE_STICKER]: new RemoveStickerStrategy(),
      [ActionEffectType.CROSS_OUT_ACTION]: new CrossOutActionStrategy(),
      [ActionEffectType.UNBLOCK_CARD]: new UnblockCardStrategy(),
      // Nothing to apply: END_TURN ends the action's turn, SEQUENCE inserts its effects.
      [ActionEffectType.END_TURN]: new UseCardActionStrategy(),
      [ActionEffectType.SEQUENCE]: new UseCardActionStrategy(),
      [ActionEffectType.EQUIP]: new EquipStrategy(),
      [ActionEffectType.CROSS_OUT_GLORY]: new CrossOutGloryStrategy(),
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
