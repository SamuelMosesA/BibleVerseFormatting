
import { useState } from 'react';
import type React from 'react';

export interface InputParamState {
    biblePassage: string;
    setBiblePassage: React.Dispatch<React.SetStateAction<string>>;

    boxHeight: string;
    setBoxHeight: React.Dispatch<React.SetStateAction<string>>;

    boxWidth: string;
    setBoxWidth: React.Dispatch<React.SetStateAction<string>>;

    fontUrl: string;
    setFontUrl: React.Dispatch<React.SetStateAction<string>>;

    fontSize: string;
    setFontSize: React.Dispatch<React.SetStateAction<string>>;
}


// Custom hook to manage input parameters
export function useInputParams(): InputParamState {
    const [biblePassage, setBiblePassage] = useState<string>('');
    const [boxHeight, setBoxHeight] = useState<string>('');
    const [boxWidth, setBoxWidth] = useState<string>('');
    const [fontUrl, setFontUrl] = useState<string>('');
    const [fontSize, setFontSize] = useState<string>('');

    return {
        biblePassage,
        setBiblePassage,
        boxHeight,
        setBoxHeight,
        boxWidth,
        setBoxWidth,
        fontUrl,
        setFontUrl,
        fontSize,
        setFontSize,
    };
}
