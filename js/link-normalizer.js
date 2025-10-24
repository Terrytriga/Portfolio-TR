// Link normalizer: ensures links to project pages resolve correctly on GitHub Pages and mobile browsers
(function(){
  'use strict';

  // Toggle debug logs (set to true to see rewrites in console)
  const DEBUG = false;

  // Determine deployment base path. For Netlify/custom domains -> '' (root).
  // For GitHub Pages where project is served under /<user>/<repo>/, detect and use '/<user>/<repo>'
  function getBasePath(){
    const path = window.location.pathname || '/';
    const hostname = window.location.hostname || '';

    // If hosted on github.io, try to extract '/user/repo' from pathname
    if(hostname.includes('github.io')){
      // If pathname starts with '/<user>/<repo>' keep that prefix
      const parts = path.split('/').filter(Boolean);
      if(parts.length >= 2){
        return '/' + parts[0] + '/' + parts[1];
      }
      // Fallback to '/Portfolio-TR' if path contains repo name
      if(path.includes('Portfolio-TR')) return '/Portfolio-TR';
    }

    // If path contains repo folder (useful in some hosting setups)
    if(path.includes('/Portfolio-TR')){
      const idx = path.indexOf('/Portfolio-TR');
      return path.substring(0, idx + '/Portfolio-TR'.length);
    }

    // Default: root
    return '';
  }

  // Normalize and return an absolute href (root-prefixed) for internal project pages
  function normalizeProjectHref(href){
    if(!href) return href;
    // leave external links untouched
    if(/^https?:\/\//i.test(href)) return href;

    // remove leading './'
    href = href.replace(/^\.\//, '');

    // remove duplicate slashes
    href = href.replace(/\/\/+/, '/');

    // if it's already root-relative (starts with '/'), remove leading slash for building
    let filePath = href.replace(/^\//, '');

    // Only normalize project-N.html pages
    const m = filePath.match(/^(project-\d+\.html)$/i);
    if(!m) return href;

    const file = m[1].toLowerCase();
    const base = getBasePath();

    // Compose final path. If base is empty -> '/project-N.html'
    const normalizedPath = (base ? base : '') + '/' + file;
    const cleanedPath = normalizedPath.replace(/\/\/+/ , '/');

    // Return an absolute URL (origin + path). Returning an absolute URL
    // avoids other scripts that prefix leading-slash hrefs from producing
    // double-prefixed paths, and is more reliable across browsers/hosts.
    const absolute = window.location.origin.replace(/\/$/, '') + cleanedPath;
    if(DEBUG) console.info('[link-normalizer] rewrite', href, '->', absolute);
    return absolute;
  }

  function onClick(e){
    const a = e.target.closest('a');
    if(!a) return;
    const href = a.getAttribute('href');
    if(!href) return;

    // noop for anchors and mailto/tel
    if(href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;

    // only handle project page links
    if(/^(?:\.\/)?project-\d+\.html$|^project-\d+\.html$|^\/project-\d+\.html$/i.test(href)){
      try{
        const newHref = normalizeProjectHref(href);
        if(newHref && newHref !== href){
          // Prevent default navigation and navigate programmatically to
          // avoid browser-specific races where updating the anchor's href
          // during the click event might not be honored on some hosts.
          e.preventDefault();
          window.location.assign(newHref);
        }
      }catch(err){ if(DEBUG) console.error('[link-normalizer] error', err); }
    }
  }

  document.addEventListener('click', function(e){
    try{ onClick(e); }catch(err){ /* fail safe */ }
  }, true);
})();