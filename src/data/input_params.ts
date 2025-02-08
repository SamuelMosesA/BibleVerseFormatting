
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
}


// Custom hook to manage input parameters
export function useInputParams(): InputParamState {
    const [biblePassage, setBiblePassage] = useState<string>('Gen 1:1 - 1:2');
    const [boxHeight, setBoxHeight] = useState<string>('240');
    const [boxWidth, setBoxWidth] = useState<string>('1530');
    const [fontName, setFontName] = useState<string>('Solway');
    const [fontSize, setFontSize] = useState<string>('24');

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
    };
}
