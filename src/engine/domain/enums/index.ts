export enum CardTag {
  LAND = 'land',
  BUILDING = 'building',
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
  LOOT = 'loot',
}

export enum Trigger {
  END_OF_TURN = 'end_of_turn',
  ON_DISCOVER = 'on_discover',
  ON_PLAY = 'on_play',
  END_OF_ROUND = 'end_of_round',
}

export enum GameEventType {
  GAME_STARTED = 'GAME_STARTED',
  ROUND_STARTED = 'ROUND_STARTED',
  ROUND_ENDED = 'ROUND_ENDED',
  TURN_STARTED = 'TURN_STARTED',
  TURN_ENDED = 'TURN_ENDED',
  CARD_PRODUCED = 'CARD_PRODUCED',
  ADVANCE = 'ADVANCE',
  UPGRADE_CARD = 'UPGRADE_CARD',
  CARD_ACTION = 'CARD_ACTION',
  SKIP_TRIGGER = 'SKIP_TRIGGER',
  CHOOSE_STATE = 'CHOOSE_STATE',
}

export enum ActionEffectType {
  ADD_RESOURCES = 'ADD_RESOURCES',
  DISCARD_CARD = 'DISCARD_CARD',
  DISCOVER_CARD = 'DISCOVER_CARD',
  DESTROY_CARD = 'DESTROY_CARD',
  UPGRADE_CARD = 'UPGRADE_CARD',
  PLACE_CARD_IN_DRAW_PILE = 'PLACE_CARD_IN_DRAW_PILE',
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
}

export enum PassiveType {
  BLOCK = 'BLOCK',
  STAY_IN_PLAY = 'STAY_IN_PLAY',
  INCREASE_GLORY = 'INCREASE_GLORY',
  INCREASE_PRODUCTION = 'INCREASE_PRODUCTION',
  ADD_TRIGGER = 'ADD_TRIGGER',
  DESACTIVATE_OPTION = 'DESACTIVATE_OPTION',
  DOUBLE_COUNT = 'DOUBLE_COUNT',
  INCREASE_ADD_RESOURCES = 'INCREASE_ADD_RESOURCES',
  INCREASE_UPDATE_COST = 'INCREASE_UPDATE_COST',
}

export enum Options {
  ADVANCE = 'advance',
  UPGRADE = 'upgrade',
  ACTION = 'action',
  END_TURN_ACTION = 'end_turn_action',
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
  DISCOVERY = 'discovery',
  PERMANENTS = 'permanents',
  BLOCKED = 'blocked',
  FRIENDLY = 'friendly',
  ENEMY = 'enemy',
  SELF = 'self',
  TOP_OF_DECK = 'top_of_deck',
  TOP_OF_DISCOVERY = 'top_of_discovery',
  DRAWN = 'drawn',
}

export enum PendingChoiceType {
  CHOOSE_CARD = 'choose_card',
  CHOOSE_RESOURCE = 'choose_resource',
  CHOOSE_STATE = 'choose_state',
  CHOOSE_STICKER = 'choose_sticker',
  CHOOSE_STEP = 'choose_step',
  CHOOSE_ACTION_EFFECT = 'choose_action_effect',
}
