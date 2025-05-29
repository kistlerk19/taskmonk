import { useEffect, useState } from 'react';

export default function withClientSideRendering<P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> {
  return function WithClientSideRendering(props: P) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
      setIsMounted(true);
    }, []);

    if (!isMounted) {
      return null;
    }

    return <Component {...props} />;
  };
}