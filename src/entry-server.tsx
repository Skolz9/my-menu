import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import App from './App';
import { allMenus } from './menus';
import { getRouteSeoData } from './components/SeoHead';
import { config } from './config';

export function renderRoute(url: string) {
  const html = renderToString(
    <React.StrictMode>
      <StaticRouter location={url}>
        <App />
      </StaticRouter>
    </React.StrictMode>
  );

  const seo = getRouteSeoData(url, config.defaultLanguage);
  return { html, seo };
}

export { allMenus, config };
