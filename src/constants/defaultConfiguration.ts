import { Action } from "../types/types";

const defaultStats = {
  strength: { name: 'Strength', value: 10, modifier: 0 },
  dexterity: { name: 'Dexterity', value: 10, modifier: 0 },
  constitution: { name: 'Constitution', value: 10, modifier: 0 },
  intelligence: { name: 'Intelligence', value: 10, modifier: 0 },
  wisdom: { name: 'Wisdom', value: 10, modifier: 0 },
  charisma: { name: 'Charisma', value: 10, modifier: 0 },
};

const defaultActions: Action[] = [];

const defaultPhysicsConfig = {
  gravity: 1,
  mass: 1,
  friction: 0.8,
  restitution: 0.5,
  linearDamping: 0.5,
  angularDamping: 0.5,
};

const defaultVisualConfig = {
  theme: 'default',
  themeColor: '#ffffff',
  diceColor: '#ffffff',
  textColor: '#000000',
  trayColor: '#1a1a1a',
};

export const defaultConfigs = {
  defaultStats,
  defaultActions: defaultActions,
  defaultPhysicsConfig: defaultPhysicsConfig,
  defaultVisualConfig: defaultVisualConfig,
};
