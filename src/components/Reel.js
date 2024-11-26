import React from 'react';
import styles from './Reel.module.css';

const Reel = ({ symbol, spinning }) => {
    return (
        <div className={`${styles.reel} ${spinning ? styles.spinning : ''}`}>
            {symbol}
        </div>
    );
};

export default Reel;
