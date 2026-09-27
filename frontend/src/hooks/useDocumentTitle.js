import { useEffect } from 'react';

/**
 * Custom hook to set document title and meta description for SEO and browser tabs.
 * @param {string} title - Page title prefix (e.g. "How It Works")
 * @param {string} [description] - Optional meta description
 */
export function useDocumentTitle(title, description) {
  useEffect(() => {
    const prevTitle = document.title;
    if (title) {
      document.title = `${title} | Nearza`;
    }

    let metaDesc = document.querySelector('meta[name="description"]');
    const prevDesc = metaDesc ? metaDesc.getAttribute('content') : '';

    if (description && metaDesc) {
      metaDesc.setAttribute('content', description);
    }

    return () => {
      document.title = prevTitle;
      if (prevDesc && metaDesc) {
        metaDesc.setAttribute('content', prevDesc);
      }
    };
  }, [title, description]);
}

export default useDocumentTitle;
