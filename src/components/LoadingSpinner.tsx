import type { FC } from 'react';
import {  useContext  } from 'react';
import { ColorContext } from '@/components/Layout';
import styles from '@/styles/modules/LoadingSpinner.module.css';

export function LoadingSpinner() {
  const { color } = useContext(ColorContext);
  
  return (
    <div className={styles.spinnerContainer}>
      <div 
        className={styles.spinner}
        style={{ borderTopColor: color }}
      ></div>
    </div>
  );
} 