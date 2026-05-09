/**
 * Shared vocabulary stage definitions for Chad-Chad
 *
 * 6 Target Words: ช้าง, พริก, งู, โรงเรียน, แมลง, ความรู้
 *
 * Each stage represents a Thai word the student must practice.
 * `stars` tracks best performance (0 = not attempted, 1-3 = earned).
 * `unlocked` controls whether the stage is playable.
 */

export const stages = [
  {
    id: 'chang',
    word: 'ช้าง',
    romanized: 'Chang — Elephant',
    image: 'public/img/chang/chang.jpg',
    audioListen: 'public/audio/chang/chang.mp3',
    stars: 3,
    unlocked: true,
  },
  {
    id: 'prik',
    word: 'พริก',
    romanized: 'Prik — Chili',
    image: 'public/img/prik/prik.jpg',
    audioListen: 'public/audio/prik/prik.mp3',
    stars: 0,
    unlocked: true,
  },
  {
    id: 'rongrian',
    word: 'โรงเรียน',
    romanized: 'Rongrian — School',
    image: 'public/img/rongrian/rongrian.jpg',
    audioListen: 'public/audio/rongrian/rongrian.mp3',
    stars: 0,
    unlocked: true,
  },
  {
    id: 'khwamru',
    word: 'ความรู้',
    romanized: 'Khwaamruu — Knowledge',
    image: 'public/img/khwamru/khwamru.jpg',
    audioListen: 'public/audio/khwamru/khwamru.mp3',
    stars: 0,
    unlocked: true,
  },
];

/** Admin mock data: stats & word list for the dashboard */
export const adminStats = {
  totalWords: 4,
  totalStudents: 24,
};
