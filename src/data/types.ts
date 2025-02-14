

export interface FormattedVerse {
  format: FormattedLine[];
  endX: number;
  endY: number;
}export interface FormattedWord {
  text: string;
  isBold: boolean;
}
export type FormattedLine = FormattedWord[];
export type FormattedChunkType = FormattedLine[];

export interface Verse {
  verseNumber: string;
  text: string;
}

export interface ApiError{
    error_code: number;
    msg: string
}
export type BibleApiResult = Verse[] |  ApiError