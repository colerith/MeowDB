export interface MeowDBEntry {
  serial: string;
  time: string;
  nsfw: {
    current: number;
    max: number;
    details?: NSFWDetails;
  };
  scene: {
    main: string;
    sub: string;
    stayRounds: number;
    topic: string;
  };
  plot: string;
  relations: CharacterRelation[];
  echoes: Echo[];
  archived: ArchivedNPC[];
  enigmas: Enigma[];
  seeds: Seed[];
}

export interface NSFWDetails {}

export interface CharacterRelation {
  name: string;
  gender: string;
  genitalStatus: string;
  identity: string;
  personality: string;
  sexExp: string;
  coordinate: string;
  clothing: string;
  action: string;
  bond: string;
  favor: number;
  favorChange: string;
}

export interface Echo {
  character: string;
  content: string;
}

export interface ArchivedNPC {
  name: string;
  location: string;
  trigger: string;
}

export interface Enigma {
  content: string;
  progress: number;
  related: string[];
}

export interface Seed {
  type: 'soul' | 'world';
  name: string;
  bloom: number;
  suspense: string;
  driveLink: string;
}
