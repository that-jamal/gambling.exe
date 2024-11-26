import React, { useState, useEffect } from 'react';
import Reel from './Reel';
import styles from './SlotMachine.module.css';

// Weighted symbol pool with a 10% chance for 💎 and 💀
const symbols = [
    '👽', '👽', '👽', '👽', '👽',
    '🍆', '🍆', '🍆', '🍆', '🍆',
    '🍒', '🍒', '🍒', '🍒', '🍒',
    '🍋', '🍋', '🍋', '🍋', '🍋',
    '🍊', '🍊', '🍊', '🍊', '🍊',
    '💎', '💎',
    '💀', '💀', '💀'
];

// Helper function to randomly pick a symbol based on the weighted probability
const getRandomSymbol = () => symbols[Math.floor(Math.random() * symbols.length)];

const SlotMachine = () => {
    const [reels, setReels] = useState(['🍒', '🍒', '🍒', '🍒']); // 4 reels
    const [spinningStates, setSpinningStates] = useState([false, false, false, false]); // Track each reel's state
    const [message, setMessage] = useState('');
    const [spinning, setSpinning] = useState(false);
    const [leverActive, setLeverActive] = useState(false);
    const [coins, setCoins] = useState(50); // Start with 50 coins
    const [savedCoins, setSavedCoins] = useState(0); // State for saved coins

    // Handle space bar press
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.code === 'Space' && !spinning && coins > 0) {
                spinReels();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [spinning, coins]);

    const spinReels = () => {
        if (spinning || coins <= 0) return;

        setLeverActive(true);
        setTimeout(() => setLeverActive(false), 1000);

        setCoins((prevCoins) => prevCoins - 1); // Deduct 1 coin for a spin
        setSpinning(true);
        setMessage('');

        const newReels = Array(4).fill(null).map(() => getRandomSymbol()); // Generate random final symbols
        spinEachReelSequentially(newReels); // Spin the reels
    };

    const cycleReelSymbols = (reelIndex) => {
        const intervalId = setInterval(() => {
            setReels((prevReels) => {
                const updatedReels = [...prevReels];
                updatedReels[reelIndex] = getRandomSymbol(); // Random symbols cycling
                return updatedReels;
            });
        }, 100); // Speed of the cycling effect

        return intervalId; // Return interval ID to stop it later
    };

    const spinEachReelSequentially = async (newReels) => {
        const intervals = []; // To track each reel's interval
        const updatedSpinningStates = Array(reels.length).fill(true);
        setSpinningStates(updatedSpinningStates);

        for (let i = 0; i < reels.length; i++) {
            intervals[i] = cycleReelSymbols(i); // Start cycling symbols for the reel

            await new Promise((resolve) => setTimeout(resolve, 1000)); // Delay for stopping the reel
            clearInterval(intervals[i]); // Stop cycling
            setReels((prevReels) => {
                const updatedReels = [...prevReels];
                updatedReels[i] = newReels[i]; // Assign the final symbol
                return updatedReels;
            });

            updatedSpinningStates[i] = false;
            setSpinningStates([...updatedSpinningStates]);
        }

        evaluateSpin(newReels); // Check the rewards
        setSpinning(false); // Mark spinning as complete
    };

    const evaluateSpin = (reels) => {
        const diamondCount = reels.filter((symbol) => symbol === '💎').length;
        const skullCount = reels.filter((symbol) => symbol === '💀').length;

        // Count occurrences of each symbol
        const symbolCounts = reels.reduce((acc, symbol) => {
            acc[symbol] = (acc[symbol] || 0) + 1;
            return acc;
        }, {});

        // Check for any symbol with at least three occurrences
        const hasThreeMatches = Object.values(symbolCounts).some((count) => count >= 3);

        // Case when both 💎 and 💀 appear
        if (diamondCount > 0 && skullCount > 0) {
            const diamondReward = diamondCount === 1 ? 10 : diamondCount === 2 ? 30 : 60;
            const penalty = skullCount * 10;
            const netReward = diamondReward - penalty;

            setCoins((prevCoins) => Math.max(0, prevCoins + netReward));
            setMessage(`💎💀 You found ${diamondCount} Diamond(s) but also ${skullCount} Trash! ${netReward >= 0 ? '+' : ''}${netReward} Coins.`);
            return; // Exit early to prevent other messages
        }

        if (hasThreeMatches) {
            setCoins((prevCoins) => prevCoins + 30); // Reward for three matching symbols
            setMessage('🎉 WIN! 3 matching symbols! +30 Coins!');
        }

        // Check 💎 rewards
        if (diamondCount === 1) {
            setCoins((prevCoins) => prevCoins + 10);
            setMessage('💎 You got 1 Diamond! +10 Coins!');
        } else if (diamondCount === 2) {
            setCoins((prevCoins) => prevCoins + 30);
            setMessage('💎💎 You got 2 Diamonds! +30 Coins!');
        } else if (diamondCount === 3) {
            setCoins((prevCoins) => prevCoins + 60);
            setMessage('💎💎💎 JACKPOT! +60 Coins!');
        }

        // Check 💀 penalties
        if (skullCount > 0) {
            const penalty = skullCount * 10;
            setCoins((prevCoins) => Math.max(0, prevCoins - penalty)); // Prevent negative coins
            setMessage(`💀 Oh no! ${skullCount} Trash! -${penalty} Coins!`);
        }
    };
    const handleReset = () => {
        setCoins(50);
        setMessage('Game reset! Coins restored to 50.');
    };

    const fetchcoins = async () => {
        const ress = await fetch("/api/data", { method: 'post', body: coins, headers: { "Content-Type": "application/json" } })
        const data = await ress.json()
        console.log(data)
    }

    const handleSaveCoins = () => {

        setSavedCoins(() => coins);
        setCoins(50); // Reset current coins to 0 after saving
        fetchcoins()
        setMessage(`Saved ${coins} coins!`);

    };
    return (
        <div className={styles.slotMachine}>
            <div
                className={`${styles.lever} ${leverActive ? styles.active : ''}`}
                onClick={spinReels}>

            </div>

            <div className={styles.info}>
                <p>💰 Coins: {coins}</p>
                <p>💾 Saved Coins: {savedCoins}</p>
            </div>
            <div className={styles.reelbord}>
                <div className={styles.reels}>
                    {reels.map((symbol, index) => (
                        <Reel key={index} symbol={symbol} spinning={spinningStates[index]} />
                    ))}
                </div>
            </div>
            {coins <= 0 && <p className={styles.outOfCoins}>Out of Coins! 💔</p>}
            {message && <p className={styles.message}>{message}</p>}
            <div className={styles.controls}>
                <button className={styles.button} onClick={handleSaveCoins}>
                    Save Coins
                </button>
                <button className={styles.button} onClick={handleReset}>
                    Reset Game
                </button>
            </div>
        </div>
    );
};

export default SlotMachine;
