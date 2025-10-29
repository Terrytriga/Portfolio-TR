// Minimal animations stub
// The original project referenced a `js/animations.js` file that is not present
// in the published site. Missing script caused 404s and console errors. This
// lightweight stub restores the path and provides safe no-op functions so other
// scripts can call into it without throwing.

(function(){
  'use strict';

  // Export a small public API if a bundler or inline script expects it.
  const Animations = {
    init: function(){
      // No-op placeholder. If you want animations, implement here.
      if(window && window.console && console.debug) console.debug('[animations] stub init');
    },
    revealOnScroll: function(){ /* no-op */ },
    play: function(name){ /* no-op */ },
    stop: function(name){ /* no-op */ }
  };

  // Attach to window for backward compatibility
  if(typeof window !== 'undefined') window.Animations = window.Animations || Animations;

  // Auto-init safely
  if(typeof document !== 'undefined'){
    if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', Animations.init);
    else Animations.init();
  }
})();
