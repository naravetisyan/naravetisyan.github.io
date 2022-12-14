import { useEffect, useRef } from 'react';

const useDidMountEffect = (cb, deps) => {
  const didMount = useRef(false);

  useEffect(() => {
    if (didMount.current) cb();
    else didMount.current = true;
  }, deps);
};

export default useDidMountEffect;
