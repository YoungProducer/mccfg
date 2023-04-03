import { FunctionComponent, PropsWithChildren } from 'react';

import styles from './styles.module.css';

// Component the supposed to show main content wrappers correctly on all devices
//
// You can use it to center the page or to center the elements inside the components
// that takes the whole width of page
//
// Also it'll change its dimmensions depends on device
export const Content: FunctionComponent<PropsWithChildren> = ({ children }) => {
  return <div className={styles.container}>{children}</div>;
};
