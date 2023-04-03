'use client';

import { FunctionComponent } from 'react';
import { Content } from '@/components/Content';

import styles from './styles.module.css';

export const Header: FunctionComponent = () => {
  return (
    <div className={styles.container}>
      <Content>
        <h3 className={styles.logo}>MCcfg</h3>
      </Content>
    </div>
  );
};
