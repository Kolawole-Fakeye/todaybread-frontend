import React from 'react';
import TodayBread from './App.jsx';
import PublicCatalogue from './PublicCatalogue.jsx';

/* ---------------------------------------------------------------
   AppEntry — the only thing that changes about your app's boot
   sequence. It doesn't touch App.jsx or main.js: it just decides,
   based on the URL, which of the two to render.

   Wire it in by changing your real Vite entry file (src/main.jsx,
   the one that calls ReactDOM.createRoot — not the main__5_.js
   backend file) from:

     import App from './App.jsx';
     ...
     root.render(<App />);

   to:

     import AppEntry from './AppEntry.jsx';
     ...
     root.render(<AppEntry />);

   That's the one line this needs. Everything inside App.jsx and
   main.js (the backend) stays exactly as it is.
----------------------------------------------------------------*/

export default function AppEntry() {
  const path = window.location.pathname;
  const isPublicShop = /^\/(shop|catalogue)\/[^/]+/.test(path);

  if (isPublicShop) {
    return <PublicCatalogue />;
  }
  return <TodayBread />;
}
