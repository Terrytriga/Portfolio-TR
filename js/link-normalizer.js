// Link normalizer: ensures links to project pages resolve correctly on GitHub Pages and mobile browsers
(function(){
  'use strict';

  // Toggle debug logs (set to true to see rewrites in console)
  // You can enable per-session debug by adding `?ln_debug=1` to the URL.
  let DEBUG = false;
  try {
    if (typeof window !== 'undefined' && window.location && window.location.search) {
      const params = new URLSearchParams(window.location.search);
      if (params.get('ln_debug') === '1') DEBUG = true;
    }
  } catch (err) { /* ignore */ }
  // Force debug for temporary production troubleshooting. Set to false to disable.
  // NOTE: This was enabled temporarily; turned off for production.
  const FORCE_DEBUG = false;
  DEBUG = DEBUG || FORCE_DEBUG;

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

  // allow hash-prefixed project links like '#project-1.html' (some hosts rewrite hrefs to hashes)
  const isHashProject = /^#project-\d+\.html$/i.test(href);
  // noop for anchors (unless it's a hash-project which we want to handle), and mailto/tel
  if((href.startsWith('#') && !isHashProject) || href.startsWith('mailto:') || href.startsWith('tel:')) return;

    // only handle project page links (allow '#project-N.html' too)
    if(/^(?:\.\/)?project-\d+\.html$|^project-\d+\.html$|^\/project-\d+\.html$|^#project-\d+\.html$/i.test(href)){
      try{
        // If href is a hash-prefixed project (e.g. #project-1.html) strip the leading '#'
        const hrefToNormalize = href.replace(/^#/, '');
        const newHref = normalizeProjectHref(hrefToNormalize);
        if(newHref && newHref !== href){
          // Prevent default navigation and navigate programmatically to
          // avoid browser-specific races where updating the anchor's href
          // during the click event might not be honored on some hosts.
          // Respect modifier keys (open in new tab/window)
          if(e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || (a.target && a.target === '_blank')){
            // open in new tab/window
            window.open(newHref, a.target || '_blank');
            e.preventDefault();
            return;
          }

          e.preventDefault();
          window.location.assign(newHref);
        }
      }catch(err){ if(DEBUG) console.error('[link-normalizer] error', err); }
    }
  }

  // Some mobile browsers start navigation on touchstart/pointerdown before
  // click fires. Add pointerdown/touchstart handlers (capture, non-passive)
  // so we can preventDefault early and navigate reliably.
  function onPointerStart(e){
    try{
      // ignore multi-touch and modifier interactions
      if(e.touches && e.touches.length > 1) return;
      if(e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target.closest && e.target.closest('a');
      if(!a) return;
      const href = a.getAttribute && a.getAttribute('href');
      if(!href) return;
      const isHashProject = /^#project-\d+\.html$/i.test(href);
      if((href.startsWith('#') && !isHashProject) || href.startsWith('mailto:') || href.startsWith('tel:')) return;
      if(/^(?:\.\/)?project-\d+\.html$|^project-\d+\.html$|^\/project-\d+\.html$|^#project-\d+\.html$/i.test(href)){
        const hrefToNormalize = href.replace(/^#/, '');
        const newHref = normalizeProjectHref(hrefToNormalize);
        if(newHref && newHref !== href){
          // If target is _blank or modifier keys used, open in new tab
          if(a.target === '_blank'){
            window.open(newHref, '_blank');
            e.preventDefault();
            return;
          }
          e.preventDefault();
          window.location.assign(newHref);
        }
      }
    }catch(err){ if(DEBUG) console.error('[link-normalizer] ptr error', err); }
  }

  // Attach listeners. touchstart must be non-passive to allow preventDefault.
  document.addEventListener('pointerdown', function(e){ try{ onPointerStart(e); }catch(err){ } }, true);
  document.addEventListener('touchstart', function(e){ try{ onPointerStart(e); }catch(err){ } }, { capture: true, passive: false });
  document.addEventListener('click', function(e){ try{ onClick(e); }catch(err){ } }, true);

  // On DOM ready, rewrite any anchors that were rewritten to '#project-N.html'
  function fixHashAnchors(){
    try{
      document.querySelectorAll('a[href^="#project-"]').forEach(a => {
        const href = a.getAttribute('href');
        if(!href) return;
        const clean = href.replace(/^#/, '');
        const newHref = normalizeProjectHref(clean);
        if(newHref && newHref !== href){
          if(DEBUG) console.info('[link-normalizer] fixing anchor', href, '->', newHref);
          a.setAttribute('href', newHref);
        }
      });
    }catch(err){ if(DEBUG) console.error('[link-normalizer] fixHashAnchors error', err); }
  }

  document.addEventListener('DOMContentLoaded', fixHashAnchors);
  // Run immediately in case this script is loaded after DOMContent or anchors already present
  try{ fixHashAnchors(); }catch(err){ if(DEBUG) console.error('[link-normalizer] immediate fixHashAnchors error', err); }

  // Observe mutations to catch scripts that rewrite hrefs after load
  try{
    const mo = new MutationObserver(muts => {
      for(const m of muts){
        if(m.type === 'attributes' && m.attributeName === 'href' && m.target && m.target.getAttribute){
          const el = m.target;
          const val = el.getAttribute('href');
          if(val && /^#project-\d+\.html$/i.test(val)){
            const clean = val.replace(/^#/, '');
            const newHref = normalizeProjectHref(clean);
            if(newHref && newHref !== val){
              if(DEBUG) console.info('[link-normalizer] mutation-fix', val, '->', newHref);
              el.setAttribute('href', newHref);
            }
          }
        }
        if(m.type === 'childList' && m.addedNodes && m.addedNodes.length){
          // run fixer in case new anchors were added
          fixHashAnchors();
        }
      }
    });
    mo.observe(document.documentElement || document.body, { attributes: true, childList: true, subtree: true, attributeFilter: ['href'] });
  }catch(err){ if(DEBUG) console.error('[link-normalizer] MutationObserver error', err); }
})();