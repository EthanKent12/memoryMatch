import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import { Audio } from 'expo-av';

const CARD_VALUES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const NUM_PAIRS = 4;
const TOTAL_CARDS = NUM_PAIRS * 2;
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

    const initializeGame = async () => {
        const tempCards = [];

        for (let i = 0; i < NUM_PAIRS; i++) {
            const value = CARD_VALUES[i];
            tempCards.push({ id: i * 2, value, flipped: false, matched: false });
            tempCards.push({ id: i * 2 + 1, value, flipped: false, matched: false });
        }

        // Shuffle the cards
        for (let i = TOTAL_CARDS - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [tempCards[i], tempCards[j]] = [tempCards[j], tempCards[i]];
        }

        setCards(tempCards);

        // Load sound effects
        const { sound } = await Audio.Sound.createAsync(soundCorrect);
        setSound(sound);
    };

    const handleCardPress = async (index) => {
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
                    cards.map((card, idx) => (idx === firstIndex || idx === secondIndex ? { ...card, flipped: true, matched: true } : card))
                );
                if (score + 1 === NUM_PAIRS) {
                    Alert.alert('Congratulations!', 'You win!', [{ text: 'OK', onPress: initializeGame }]);
                }
            } else {
                playSound(soundIncorrect);
                setTimeout(() => {
                    setCards(cards.map((card) => (newSelected.includes(card.id) ? { ...card, flipped: false } : card)));
                }, 1000);
            }
            setSelected([]);
        }
    };

    const playSound = async (sound) => {
        try {
            await sound.replayAsync();
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
                        style={[styles.card, card.flipped && styles.cardFlipped]}
                        onPress={() => !card.flipped && handleCardPress(index)}
                    >
                        {card.flipped && <Text style={styles.cardText}>{card.value}</Text>}
                    </TouchableOpacity>
                ))}
            </View>
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
    cardFlipped: {
        backgroundColor: 'lightgray',
    },
    scoreText: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
});
