/**
 * Shared vocabulary stage definitions for Chad-Chad
 *
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
    image: '/img/chang/chang.jpg',
    audioListen: '/audio/chang/chang.mp3',
    stars: 3,
    unlocked: true,
  },
  {
    id: 'prik',
    word: 'พริก',
    romanized: 'Prik — Chili',
    image: '/img/prik/prik.jpg',
    audioListen: '/audio/prik/prik.mp3',
    stars: 0,
    unlocked: true,
  },
  {
    id: 'rongrian',
    word: 'โรงเรียน',
    romanized: 'Rongrian — School',
    image: '/img/rongrian/rongrian.jpg',
    audioListen: '/audio/rongrian/rongrian.mp3',
    stars: 0,
    unlocked: true,
  },
  {
    id: 'khwaamruu',
    word: 'ความรู้',
    romanized: 'Khwaamruu — Knowledge',
    image: '/img/khwaamruu/kwaamruu.png',
    audioListen: '/audio/khwaamruu/khwaamruu.mp3',
    stars: 0,
    unlocked: true,
  },
  {
    id: 'prapprung',
    word: 'ปรับปรุง',
    romanized: 'Prap-prung — Improve',
    image: '/img/prapprung/prapprung.jpg',
    audioListen: '/audio/prapprung/prapprung.mp3',
    stars: 0,
    unlocked: true,
  },
  {
    id: 'plianplaeng',
    word: 'เปลี่ยนแปลง',
    romanized: 'Plian-plaeng — Change',
    image: '/img/plianplaeng/plianplaeng.jpg',
    audioListen: '/audio/plianplaeng/plianplaeng.mp3',
    stars: 0,
    unlocked: true,
  },
  {
    id: 'phloetphloen',
    word: 'เพลิดเพลิน',
    romanized: 'Phloet-phloen — Enjoy',
    image: '/img/phloetphloen/phloetphloen.jpg',
    audioListen: '/audio/phloetphloen/phloetphloen.mp3',
    stars: 0,
    unlocked: true,
  },
  {
    id: 'sapphayaakon',
    word: 'ทรัพยากร',
    romanized: 'Sap-pha-yaa-kon — Resource',
    image: '/img/sapphayaakon/sapphayaakon.webp',
    audioListen: '/audio/sapphayaakon/sapphayaakon.mp3',
    stars: 0,
    unlocked: true,
  },
  {
    id: 'thammachaat',
    word: 'ธรรมชาติ',
    romanized: 'Tham-ma-chaat — Nature',
    image: '/img/thammachaat/thammachaat.jpg',
    audioListen: '/audio/thammachaat/thammachaat.mp3',
    stars: 0,
    unlocked: true,
  },
  {
    id: 'suesat',
    word: 'ซื่อสัตย์',
    romanized: 'Sue-sat — Honest',
    image: '/img/suesat/suesat.jpg',
    audioListen: '/audio/suesat/suesat.mp3',
    stars: 0,
    unlocked: true,
  },
];

/** Admin mock data: stats & word list for the dashboard */
export const adminStats = {
  totalWords: 10,
  totalStudents: 24,
};
