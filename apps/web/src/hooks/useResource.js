import { useEffect, useState } from 'react';
import { request } from '../services/api.js';
export function useResource(path, options = {}) {
  const [version, setVersion] = useState(0),
    [state, setState] = useState({ data: null, error: '', loading: !!path, path: null });
  const adminKey = options.adminKey;
  useEffect(() => {
    if (!path) {
      setState({ data: null, error: '', loading: false, path });
      return;
    }
    const controller = new AbortController();
    setState({ data: null, error: '', loading: true, path });
    request(path, { signal: controller.signal, adminKey })
      .then((data) => {
        if (!controller.signal.aborted) setState({ data, error: '', loading: false, path });
      })
      .catch((error) => {
        if (!controller.signal.aborted)
          setState({ data: null, error: error.message, loading: false, path });
      });
    return () => controller.abort();
  }, [path, adminKey, version]);
  return {
    ...(state.path === path ? state : { data: null, error: '', loading: !!path }),
    retry: () => setVersion((v) => v + 1),
  };
}
