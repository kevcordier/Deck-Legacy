export enum CardTag {
  BUILDING = 'building',
  PERSON = 'person',
  SEAFARING = 'seafaring',
  LAND = 'land',
  LIVESTOCK = 'livestock',
  EVENT = 'event',
  ENEMY = 'enemy',
}

export enum Trigger {
  END_OF_TURN = 'end_of_turn',
  ON_DISCOVER = 'on_discover',
  ON_PLAY = 'on_play',
}

export enum GameEventType {
  GAME_STARTED = 'GAME_STARTED',
  ROUND_STARTED = 'ROUND_STARTED',
  TURN_STARTED = 'TURN_STARTED',
  CARD_PRODUCED = 'CARD_PRODUCED',
  ADVANCE = 'ADVANCE',
  UPGRADE_CARD = 'UPGRADE_CARD',
  USE_CARD_EFFECT = 'USE_CARD_EFFECT',
  SKIP_TRIGGER = 'SKIP_TRIGGER',
  PASS = 'PASS',
}

export enum ActionType {
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
}

export enum ResourceType {
  GOLD = 'gold',
  WOOD = 'wood',
  STONE = 'stone',
  IRON = 'iron',
  SWORD = 'sword',
  GOODS = 'goods',
}

export enum TargetScope {
  ANY = 'any',
  BOARD = 'board',
  DECK = 'deck',
  DISCARD = 'discard',
  PERMANENTS = 'permanents',
  BLOCKED = 'blocked',
  FRIENDLY = 'friendly',
  ENEMY = 'enemy',
  SELF = 'self',
  TOP_OF_DECK = 'top_of_deck',
}

export enum PendingChoiceType {
  CHOOSE_CARD = 'choose_card',
  CHOOSE_RESOURCE = 'choose_resource',
  CHOOSE_STATE = 'choose_state',
}
