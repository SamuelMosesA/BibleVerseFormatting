type SetStringState = React.Dispatch<React.SetStateAction<string>>;
type SetNumberState = React.Dispatch<React.SetStateAction<number>>;

export interface InputParamState {
  biblePassage: string;
  setBiblePassage: SetStringState;

  boxHeight: number;
  setBoxHeight: SetNumberState;

  boxWidth: number;
  setBoxWidth: SetNumberState;

  fontName: string;
  setFontName: SetStringState;

  fontSize: number;
  setFontSize: SetNumberState;

  lineHeightMult: number;
  setLineHeightMult: SetNumberState;
}

export interface FormattedVerse {
  format: FormattedLine[];
  endX: number;
  endY: number;
}
export interface FormattedWord {
  text: string;
  isBold: boolean;
}
export type FormattedLine = FormattedWord[];

export interface FormattedChunkType {
  formattedText: FormattedLine[];
  fontName: string;
  fontSize: number;
  lineHeightMult: number;
  boxWidth: number;
  boxHeight: number;
}

export interface Verse {
  verseNumber: string;
  text: string;
}

export interface ApiError {
  error_code: number;
  msg: string;
}
export type BibleApiResult = Verse[] | ApiError;
