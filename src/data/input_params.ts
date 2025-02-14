
import { useState } from 'react';
import type React from 'react';

export interface InputParamState {
    biblePassage: string;
    setBiblePassage: React.Dispatch<React.SetStateAction<string>>;

    boxHeight: string;
    setBoxHeight: React.Dispatch<React.SetStateAction<string>>;

    boxWidth: string;
    setBoxWidth: React.Dispatch<React.SetStateAction<string>>;

    fontName: string;
    setFontName: React.Dispatch<React.SetStateAction<string>>;

    fontSize: string;
    setFontSize: React.Dispatch<React.SetStateAction<string>>;

    lineHeightMult: string;
    setLineHeightMult: React.Dispatch<React.SetStateAction<string>>
}


// Custom hook to manage input parameters
export function useInputParams(): InputParamState {
    const [biblePassage, setBiblePassage] = useState<string>('');
    const [boxHeight, setBoxHeight] = useState<string>('220');
    const [boxWidth, setBoxWidth] = useState<string>('1100');
    const [fontName, setFontName] = useState<string>('Solway');
    const [fontSize, setFontSize] = useState<string>('24');
    const [lineHeightMult, setLineHeightMult] = useState<string>('1.4');

    return {
        biblePassage,
        setBiblePassage,
        boxHeight,
        setBoxHeight,
        boxWidth,
        setBoxWidth,
        fontName: fontName,
        setFontName: setFontName,
        fontSize,
        setFontSize,
        lineHeightMult,
        setLineHeightMult
    };
}
