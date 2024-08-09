// testData.js
import { add, getAll } from './db.js';

const authors = ['John Bonham', 'Steve Gadd', 'Vinnie Colaiuta', 'Dennis Chambers', 'Tony Williams'];
const grooveNames = ['Rock Groove', 'Jazz Swing', 'Funk Beat', 'Latin Rhythm', 'Shuffle Pattern'];
const tagNames = ['Rock', 'Pop', 'Funk', 'Latin', 'Shuffle', 'Jazz', 'Blues', 'Metal', 'Reggae', 'Hip Hop', 'Country', 'Paradiddle', 'Double Stroke', 'Buzz Roll', 'Flam Tap', 'Drag', 'Rudiment'];
const getRandomTag = () => (tagNames[Math.floor(Math.random() * tagNames.length)]);

function generateRandomGroove() {
    const name = `${grooveNames[Math.floor(Math.random() * grooveNames.length)]} ${Math.floor(Math.random() * 10) + 1}`;
    const author = authors[Math.floor(Math.random() * authors.length)];
    const difficulty = Math.floor(Math.random() * 10) + 1;
    const bpm = Math.floor(Math.random() * 60) + 60; // 60-120 BPM
    const value = `Sample notation for ${name}`;
    const bookmark = Math.random() > 0.7; // 30% chance of being bookmarked
    const tags = [
        getRandomTag(),
        getRandomTag(),
        getRandomTag(),
        getRandomTag(),
    ];

    const practices = [];
    const practiceCount = Math.floor(Math.random() * 5); // 0-4 practices
    for (let i = 0; i < practiceCount; i++) {
        practices.push({
            datetime: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(), // Random date within the last 30 days
            bpm: Math.floor(Math.random() * 30) + bpm - 15, // Practice BPM within ±15 of the groove BPM
            score: Math.floor(Math.random() * 41) + 60 // Score between 60-100
        });
    }

    return { name, author, difficulty, bpm, value, bookmark, practices, tags };
}

export function populateTestData(count = 50) {
    return getAll().then(({ totalItems }) => {
        if (totalItems > 200) {
            console.log('Database already contains data. Skipping test data population.');
            return;
        }

        const promises = [];
        for (let i = 0; i < count; i++) {
            const groove = generateRandomGroove();
            promises.push(add(groove));
        }

        return Promise.all(promises).then(() => {
            console.log(`${count} test grooves have been added to the database.`);
        });
    }).catch(error => {
        console.error('Error populating test data:', error);
    });
}
