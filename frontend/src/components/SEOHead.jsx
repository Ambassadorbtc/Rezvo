import { useEffect } from 'react';

export default function SEOHead({ title, description, path, type = 'website' }) {
  useEffect(() => {
    document.title = title;
    const setMeta = (name, content, attr = 'name') => {
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) { el = document.createElement('meta'); el.setAttribute(attr, name); document.head.appendChild(el); }
      el.setAttribute('content', content);
    };
    setMeta('description', description);
    setMeta('og:title', title, 'property');
    setMeta('og:description', description, 'property');
    setMeta('og:type', type, 'property');
    setMeta('og:url', `https://rezvo.app${path}`, 'property');
    setMeta('og:site_name', 'Rezvo', 'property');
    setMeta('twitter:card', 'summary_large_image', 'name');
    setMeta('twitter:title', title, 'name');
    setMeta('twitter:description', description, 'name');
    // Canonical
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement('link'); canonical.setAttribute('rel', 'canonical'); document.head.appendChild(canonical); }
    canonical.setAttribute('href', `https://rezvo.app${path}`);
  }, [title, description, path, type]);
  return null;
}
