import { AddBoardEffectStrategy } from '@engine/application/cardAction/AddBoardEffectStrategy';
import { AddCumulatedStrategy } from '@engine/application/cardAction/AddCumulatedStrategy';
import { AddGloryStrategy } from '@engine/application/cardAction/AddGloryStrategy';
import { AddResourceStrategy } from '@engine/application/cardAction/AddResourceStrategy';
import { AddStickerStrategy } from '@engine/application/cardAction/AddStickerStrategy';
import { BlockCardStrategy } from '@engine/application/cardAction/BlockCardStrategy';
import type { CardActionStrategy } from '@engine/application/cardAction/CardActionStrategy';
import { ChoseStateStrategy } from '@engine/application/cardAction/ChoseStateStrategy';
import { DestroyCardStrategy } from '@engine/application/cardAction/DestroyCardStrategy';
import { DiscardCardStrategy } from '@engine/application/cardAction/DiscardCardStrategy';
import { DiscoverCardStrategy } from '@engine/application/cardAction/DiscoverCardStrategy';
import { EndGameStrategy } from '@engine/application/cardAction/EndGameStrategy';
import { PlaceCardInPileStrategy } from '@engine/application/cardAction/PlaceCardInDrawPileStrategy';
import { PlayCardStrategy } from '@engine/application/cardAction/PlayCardStrategy';
import { RemoveResourceOnCardStrategy } from '@engine/application/cardAction/RemoveResourceOnCardStrategy';
import { SaveFromPurgeStrategy } from '@engine/application/cardAction/SaveFromPurgeStrategy';
import { SetCumulatedStrategy } from '@engine/application/cardAction/SetCumulatedStrategy';
import { SetLastRoundStrategy } from '@engine/application/cardAction/SetLastRoundStrategy';
import { ShuffleDeckStrategy } from '@engine/application/cardAction/ShuffleDeckStrategy';
import { TrackAdvanceStrategy } from '@engine/application/cardAction/TrackAdvanceStrategy';
import { UpgradeCardStrategy } from '@engine/application/cardAction/UpgradeCardStrategy';
import { ActionEffectType } from '@engine/domain/enums';
import type { CardDef, GameState, ResolvedActionEffect, Sticker } from '@engine/domain/types';

export class CardActionContext {
  private readonly strategies: Partial<Record<ActionEffectType, CardActionStrategy>>;
  private currentStrategy: CardActionStrategy | null = null;

  constructor(cardDefs: Record<number, CardDef>, stickerDefs: Record<number, Sticker>) {
    this.strategies = {
      [ActionEffectType.ADD_RESOURCES]: new AddResourceStrategy(cardDefs, stickerDefs),
      [ActionEffectType.REMOVE_RESOURCE_ON_CARD]: new RemoveResourceOnCardStrategy(),
      [ActionEffectType.DISCARD_CARD]: new DiscardCardStrategy(cardDefs, stickerDefs),
      [ActionEffectType.DISCOVER_CARD]: new DiscoverCardStrategy(cardDefs),
      [ActionEffectType.DESTROY_CARD]: new DestroyCardStrategy(),
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
      [ActionEffectType.SET_LAST_ROUND]: new SetLastRoundStrategy(),
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
