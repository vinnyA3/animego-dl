export interface VideoMetadata {
  title?: string;
  releaseYear?: string;
}

export interface EpisodeRange {
  start: number;
  end: number;
}

export interface CryptInput {
  source: string;
  key: string;
  iv: string;
}

interface SearchItem {
  id?: string | null;
  title?: string | null;
  url?: string | null;
}

export type GogoSearchResults =
  | { [key: string]: SearchItem }
  | Record<string, never>;

interface GogoVideoSource {
  file: string;
  label: string;
  type: string;
}

export interface GogoVideoSourceList {
  source: GogoVideoSource[];
  source_bk: GogoVideoSource[];
  track: [];
  advertising: [];
  linkiframe: string;
}
