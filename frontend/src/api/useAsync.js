import { useEffect, useState } from "react";

// Runs `fn` whenever `deps` change (or reload() is called). Keeps the previous data on screen while refetching.
export function useAsync(fn, deps = []) {
  const [tick, setTick] = useState(0);
  const [state, setState] = useState({ key: null, data: null, error: null });
  const key = `${tick}|${JSON.stringify(deps)}`;

  useEffect(() => {
    let cancelled = false;
    fn()
      .then((data) => !cancelled && setState({ key, data, error: null }))
      .catch((error) => !cancelled && setState((s) => ({ key, data: s.data, error })));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return {
    data: state.data,
    error: state.key === key ? state.error : null,
    loading: state.key !== key,
    reload: () => setTick((t) => t + 1),
    setData: (updater) =>
      setState((s) => ({ ...s, data: typeof updater === "function" ? updater(s.data) : updater })),
  };
}
