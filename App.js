import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Alert, Text } from 'react-native';
import { Audio } from 'expo-av';

const CARD_VALUES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const NUM_PAIRS = 2; // Number of pairs for each card value
const TOTAL_CARDS = NUM_PAIRS * CARD_VALUES.length;
const soundCorrect = require('./Correct.mp3');
const soundIncorrect = require('./Incorrect.mp3');

export default function App() {
    const [cards, setCards] = useState([]);
    const [selected, setSelected] = useState([]);
    const [sound, setSound] = useState(null);
    const [score, setScore] = useState(0);

    useEffect(() => {
        initializeGame();
        return () => {
            sound && sound.unloadAsync();
        };
    }, []);

    useEffect(() => {
        const loadSounds = async () => {
            const { sound } = await Audio.Sound.createAsync(soundCorrect);
            setSound(sound);
        };
        loadSounds();
    }, []);

    const initializeGame = () => {
        const tempCards = [];

        for (let i = 0; i < CARD_VALUES.length; i++) {
            const value = CARD_VALUES[i];
            for (let j = 0; j < NUM_PAIRS; j++) {
                tempCards.push({ id: i * NUM_PAIRS + j, value, matched: false });
            }
        }

        // Shuffle the cards
        for (let i = TOTAL_CARDS - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [tempCards[i], tempCards[j]] = [tempCards[j], tempCards[i]];
        }

        setCards(tempCards);
        setSelected([]);
        setScore(0);
    };

    const handleCardPress = (index) => {
        if (selected.length === 2) {
            return;
        }

        const newSelected = [...selected, index];
        setSelected(newSelected);

        if (newSelected.length === 2) {
            const [firstIndex, secondIndex] = newSelected;
            if (cards[firstIndex].value === cards[secondIndex].value) {
                playSound(soundCorrect);
                setScore(score + 1);
                setCards(
                    cards.map((card, idx) => (idx === firstIndex || idx === secondIndex ? { ...card, matched: true } : card))
                );
                if (score + 1 === CARD_VALUES.length) {
                    Alert.alert('Congratulations!', 'You win!', [{ text: 'OK', onPress: initializeGame }]);
                }
            } else {
                playSound(soundIncorrect);
                setTimeout(() => {
                    setCards(cards.map((card) => (newSelected.includes(card.id) ? { ...card, matched: false } : card)));
                }, 1000);
            }
            setSelected([]);
        }
    };

    const resetGame = () => {
        initializeGame();
    };

    const playSound = async (sound) => {
        try {
            await sound.playAsync();
        } catch (error) {
            console.log('Error playing sound: ', error);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.scoreText}>Score: {score}</Text>
            <View style={styles.grid}>
                {cards.map((card, index) => (
                    <TouchableOpacity
                        key={card.id}
                        style={[styles.card, card.matched && styles.cardMatched]}
                        onPress={() => !card.matched && handleCardPress(index)}
                    >
                        {card.matched || (
                            <Text style={styles.cardText}>{selected.includes(index) || card.matched ? card.value : ''}</Text>
                        )}
                    </TouchableOpacity>
                ))}
            </View>
            <TouchableOpacity style={styles.button} onPress={resetGame}>
                <Text style={styles.buttonText}>Reset Game</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    scoreText: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    card: {
        width: 80,
        height: 80,
        margin: 5,
        backgroundColor: 'skyblue',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
    },
    cardText: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    cardMatched: {
        backgroundColor: 'green',
    },
    button: {
        marginTop: 20,
        padding: 10,
        backgroundColor: 'lightblue',
        borderRadius: 5,
    },
    buttonText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
});
