import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Hero3DModel } from '../models/Hero3DModel';

let cacheContainer: HTMLDivElement | null = null;
let cacheRoot: any = null;

const CachedHero3DModel: React.FC<{ theme: 'dark' | 'light' }> = ({ theme }) => {
  useEffect(() => {
    // Initialise the cache the first time this component is used.
    if (!cacheContainer) {
      cacheContainer = document.createElement('div');
      cacheContainer.style.width = '100%';
      cacheContainer.style.height = '100%';
      // Append to the body (or a dedicated portal root) so it stays alive.
      document.body.appendChild(cacheContainer);
      cacheRoot = createRoot(cacheContainer);
    }

    // Render/update the cached root with the new theme.
    cacheRoot.render(<Hero3DModel theme={theme} />);

    // Ensure the cached container is attached to the current mount point.
    const mountPoint = document.getElementById('hero3d-mount-point');
    if (mountPoint && cacheContainer && !mountPoint.contains(cacheContainer)) {
      mountPoint.appendChild(cacheContainer);
    }
  }, [theme]);

  // Render a lightweight wrapper with a dedicated mount point.
  return <div id="hero3d-mount-point" className="w-full h-full" />;
};

export default CachedHero3DModel;
