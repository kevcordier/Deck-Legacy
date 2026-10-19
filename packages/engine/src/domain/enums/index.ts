export enum CardTag {
  ARTIFACT = 'artifact',
  LAND = 'land',
  BUILDING = 'building',
  BANDIT = 'bandit',
  PERSON = 'person',
  EVENT = 'event',
  ENEMY = 'enemy',
  SEAFARING = 'seafaring',
  GOAL = 'goal',
  KNIGHT = 'knight',
  ELDER = 'elder',
  WALL = 'wall',
  STATE = 'state',
  SHIP = 'ship',
  ITEM = 'item',
  INVENTION = 'invention',
  POTION = 'potion',
  LOOT = 'loot',
  LIVESTOCK = 'livestock',
  HORSE = 'horse',
  LADY = 'lady',
  WAGON = 'wagon',
  PERMANENT = 'permanent',
}

export enum Trigger {
  START_OF_TURN = 'start_of_turn',
  END_OF_TURN = 'end_of_turn',
  ON_PLAY = 'on_play',
  END_OF_ROUND = 'end_of_round',
  ON_PURGE = 'on_purge',
  ON_DISCARD = 'on_discard',
  ON_PRODUCE = 'on_produce',
  ON_UPGRADE = 'on_upgrade',
  ON_TRACK_END = 'on_track_end',
  ON_DEFEAT = 'on_defeat',
  ON_PURGE_SELECTION = 'on_purge_selection',
}

export enum GameEventType {
  GAME_STARTED = 'GAME_STARTED',
  GAME_ENDED = 'GAME_ENDED',
  ROUND_STARTED = 'ROUND_STARTED',
  STORY_ADVANCED = 'STORY_ADVANCED',
  ROUND_ENDED = 'ROUND_ENDED',
  TURN_STARTED = 'TURN_STARTED',
  TURN_ENDED = 'TURN_ENDED',
  CARD_PRODUCED = 'CARD_PRODUCED',
  ADVANCE = 'ADVANCE',
  UPGRADE_CARD = 'UPGRADE_CARD',
  CARD_ACTION = 'CARD_ACTION',
  SKIP_TRIGGER = 'SKIP_TRIGGER',
  CHOOSE_STATE = 'CHOOSE_STATE',
  PARCHMENT_CARD_DISCOVERED = 'PARCHMENT_CARD_DISCOVERED',
  CAMPAIGN_SCORE_SAVED = 'CAMPAIGN_SCORE_SAVED',
  EXPANSION_SELECTED = 'EXPANSION_SELECTED',
  PURGE_CARD_SELECTED = 'PURGE_CARD_SELECTED',
  PURGE_PERMANENT_SELECTED = 'PURGE_PERMANENT_SELECTED',
  PURGE_ON_TRIGGERED = 'PURGE_ON_TRIGGERED',
  PURGE_FINALIZED = 'PURGE_FINALIZED',
}

export enum ActionEffectType {
  ADD_RESOURCES = 'ADD_RESOURCES',
  REMOVE_RESOURCE_ON_CARD = 'REMOVE_RESOURCE_ON_CARD',
  DISCARD_CARD = 'DISCARD_CARD',
  DISCOVER_CARD = 'DISCOVER_CARD',
  DESTROY_CARD = 'DESTROY_CARD',
  UPGRADE_CARD = 'UPGRADE_CARD',
  PLACE_CARD_IN_PILE = 'PLACE_CARD_IN_PILE',
  BLOCK_CARD = 'BLOCK_CARD',
  PLAY_CARD = 'PLAY_CARD',
  ADD_STICKER = 'ADD_STICKER',
  CHOOSE_STATE = 'CHOOSE_STATE',
  BOOST_CARD = 'BOOST_CARD',
  COST = 'COST',
  ADD_CUMULATED = 'ADD_CUMULATED',
  SET_CUMULATED = 'SET_CUMULATED',
  TRACK_ADVANCE = 'TRACK_ADVANCE',
  ADD_BOARD_EFFECT = 'ADD_BOARD_EFFECT',
  CHOOSE_EFFECT = 'CHOOSE_EFFECT',
  END_GAME = 'END_GAME',
  SHUFFLE_DECK = 'SHUFFLE_DECK',
  ADD_GLORY = 'ADD_GLORY',
  SAVE_FROM_PURGE = 'SAVE_FROM_PURGE',
  ADD_TO_PURGE = 'ADD_TO_PURGE',
  /** Discovers the next `value` cards of the campaign pile (EDR-046). */
  ADVANCE_STORY = 'ADVANCE_STORY',
  /**
   * Defeats the chosen enemies: each one's `defeat` action is queued as a mandatory trigger,
   * free except its "destroy this card" cost.
   */
  DEFEAT_CARD = 'DEFEAT_CARD',
  /**
   * Uses the activated or time effect of a chosen card (`usedAction` once chosen): its effects
   * resolve for that card, which stays in play, and the turn does not end.
   */
  USE_CARD_ACTION = 'USE_CARD_ACTION',
}

export enum PassiveType {
  BLOCK = 'BLOCK',
  STAY_IN_PLAY = 'STAY_IN_PLAY',
  ADJUST_GLORY = 'ADJUST_GLORY',
  ADJUST_PRODUCTION = 'ADJUST_PRODUCTION',
  DESACTIVATE_OPTION = 'DESACTIVATE_OPTION',
  COUNT_AS_2 = 'COUNT_AS_2',
  ADJUST_ADD_RESOURCES = 'ADJUST_ADD_RESOURCES',
  ADJUST_UPDATE_COST = 'ADJUST_UPDATE_COST',
  REPLACE_RESOURCE_PRODUCTION = 'REPLACE_RESOURCE_PRODUCTION',
  RESOURCE_EQUIVALENCE = 'RESOURCE_EQUIVALENCE',
  SET_GAME_PARAMETER = 'SET_GAME_PARAMETER',
  CANT_BE_DESTROYED = 'CANT_BE_DESTROYED',
  RESTRICT_GAIN = 'RESTRICT_GAIN',
  RESTRICT_SPEND = 'RESTRICT_SPEND',
  REQUIRES_IN_PLAY = 'REQUIRES_IN_PLAY',
}

export enum Options {
  ADVANCE = 'advance',
  UPGRADE = 'upgrade',
  ACTION = 'action',
  END_TURN_ACTION = 'end_turn_action',
  /** Playing cards with an effect (PLAY_CARD), e.g. from the discard pile. */
  PLAY_CARD = 'play_card',
}

export enum ResourceType {
  GOLD = 'gold',
  WOOD = 'wood',
  STONE = 'stone',
  IRON = 'iron',
  WEAPON = 'weapon',
  GOODS = 'goods',
}

export enum TargetScope {
  ANY = 'any',
  BOARD = 'board',
  DECK = 'deck',
  DISCARD = 'discard',
  TOP_OF_DISCARD = 'top_of_discard',
  DISCOVERY = 'discovery',
  PERMANENTS = 'permanents',
  BLOCKED = 'blocked',
  BLOCKED_BY_THIS = 'blocked_by_this',
  FRIENDLY = 'friendly',
  ENEMY = 'enemy',
  SELF = 'self',
  TOP_OF_DECK = 'top_of_deck',
  DRAWN = 'drawn',
  DISCARDED = 'discarded',
  LAST_SELECTED = 'last_selected',
  TRIGGER_SOURCE = 'trigger_source',
  UPGRADABLE = 'upgradable',
  WITH_TRACK = 'with_track',
  PURGE_SELECTED = 'purge_selected',
  STAYING = 'staying',
}

export enum PendingChoiceType {
  CHOOSE_CARD = 'choose_card',
  CHOOSE_RESOURCE = 'choose_resource',
  CHOOSE_STATE = 'choose_state',
  CHOOSE_STICKER = 'choose_sticker',
  CHOOSE_STEP = 'choose_step',
  CHOOSE_ACTION_EFFECT = 'choose_action_effect',
}

export enum Phase {
  PRE_GAME = 'pregame',
  ROUND_START = 'roundStart',
  ROUND_END = 'roundEnd',
  TURN_END = 'turnEnd',
  PARCHMENT = 'parchment',
  PLAYING = 'playing',
  EXPANSION_CHOICE = 'expansionChoice',
  PURGE = 'purge',
  GAME_OVER = 'gameOver',
}
