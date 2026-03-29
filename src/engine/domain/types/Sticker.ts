export type Sticker = {
  id: number;
  icon?: string;
  label?: string;
  description: string;
  type: 'add' | 'remove';
  production?: string;
  glory?: number;
  tags?: string[];
  effectId?: string;
};

export type StickerStock = Record<number, number>;
