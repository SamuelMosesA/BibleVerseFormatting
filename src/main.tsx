import ReactDOM from 'react-dom/client';
import App from './App';



const addFontLinks = () => {
  const preconnect1 = document.createElement('link');
  preconnect1.rel = 'preconnect';
  preconnect1.href = 'https://fonts.googleapis.com';
  document.head.appendChild(preconnect1);

  const preconnect2 = document.createElement('link');
  preconnect2.rel = 'preconnect';
  preconnect2.href = 'https://fonts.gstatic.com';
  preconnect2.crossOrigin = 'anonymous';
  document.head.appendChild(preconnect2);

  const fontLink = document.createElement('link');
  fontLink.rel = 'stylesheet';
  fontLink.href = 'https://fonts.googleapis.com/css2?family=Solway:wght@300;400;500;700;800&display=swap';
  document.head.appendChild(fontLink);
};

addFontLinks()

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
