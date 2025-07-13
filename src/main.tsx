import ReactDOM from 'react-dom/client';
import App from './App';

interface fontLink {
  rel: string;
  href: string;
  crossorigin?: string;
}

const fontLinks: fontLink[] = [
  {rel: 'preconnect', href: 'https://fonts.googleapis.com',},
  {rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous'},
  {rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Solway:wght@300;400;500;700;800&display=swap'},
];

const addFontLinks = () => {
  for (const fontLink of fontLinks) {
    const link = document.createElement('link');
    link.rel = fontLink.rel;
    link.href = fontLink.href;
    if (fontLink.crossorigin) {
      link.crossOrigin = fontLink.crossorigin;
    }
    document.head.appendChild(link);
  }
};

addFontLinks()

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
