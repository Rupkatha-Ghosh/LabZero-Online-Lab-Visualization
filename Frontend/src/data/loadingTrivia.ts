export interface TriviaFact {
  fact: string;
  emoji: string;
  topic: 'physics' | 'chemistry' | 'math' | 'biology' | 'general';
}

export const LOADING_TRIVIA: TriviaFact[] = [
  { fact: 'A teaspoon of neutron star would weigh about 6 billion tons.', emoji: '⭐', topic: 'physics' },
  { fact: 'Light from the Sun takes 8 minutes 20 seconds to reach Earth.', emoji: '☀️', topic: 'physics' },
  { fact: 'There are more stars in the universe than grains of sand on Earth.', emoji: '🌌', topic: 'general' },
  { fact: 'A bolt of lightning is about 5 times hotter than the surface of the Sun.', emoji: '⚡', topic: 'physics' },
  { fact: 'DNA in a single human cell, stretched out, is about 2 meters long.', emoji: '🧬', topic: 'biology' },
  { fact: 'Bananas are naturally slightly radioactive due to their potassium content.', emoji: '🍌', topic: 'chemistry' },
  { fact: 'Water can exist as a solid, liquid, and gas — but also as a supercritical fluid.', emoji: '💧', topic: 'chemistry' },
  { fact: 'The Fibonacci sequence appears in sunflowers, pinecones, and galaxies.', emoji: '🌻', topic: 'math' },
  { fact: 'Honey never spoils. Archaeologists have eaten 3,000-year-old honey from Egyptian tombs.', emoji: '🍯', topic: 'biology' },
  { fact: 'A single cloud can weigh more than a million pounds.', emoji: '☁️', topic: 'physics' },
  { fact: 'Your body produces about 3.8 million cells every second.', emoji: '🫀', topic: 'biology' },
  { fact: 'Pi has been calculated to over 100 trillion digits — and never repeats.', emoji: '🥧', topic: 'math' },
  { fact: 'Glass is actually a very slow-moving liquid, not a true solid.', emoji: '🔍', topic: 'chemistry' },
  { fact: 'Sound travels about 4.3 times faster in water than in air.', emoji: '🔊', topic: 'physics' },
  { fact: 'The average human body contains enough carbon to fill 9,000 pencils.', emoji: '✏️', topic: 'biology' },
  { fact: 'Sharks have been around longer than trees — by about 50 million years.', emoji: '🦈', topic: 'biology' },
  { fact: 'The number zero was only invented around 1,500 years ago.', emoji: '0️⃣', topic: 'math' },
  { fact: 'An octopus has three hearts and blue blood.', emoji: '🐙', topic: 'biology' },
  { fact: 'Atoms are 99.9999999999999% empty space.', emoji: '⚛️', topic: 'chemistry' },
  { fact: 'The Eiffel Tower can grow up to 15 cm taller in summer due to thermal expansion.', emoji: '🗼', topic: 'physics' },
  { fact: 'A day on Venus is longer than a year on Venus.', emoji: '♀️', topic: 'physics' },
  { fact: 'Sloths can hold their breath longer than dolphins can.', emoji: '🦥', topic: 'biology' },
  { fact: 'Earth\'s magnetic field protects us from solar wind at nearly 1 million mph.', emoji: '🧲', topic: 'physics' },
  { fact: 'Mathematics is the only language that is the same everywhere on Earth.', emoji: '🧮', topic: 'math' },
  { fact: 'Plants can recognise their siblings and give them preferential treatment.', emoji: '🌱', topic: 'biology' },
  { fact: 'A single gram of DNA can hold 700 terabytes of data.', emoji: '💾', topic: 'biology' },
  { fact: 'Friction is what makes it possible to walk — without it, every step would be a slip.', emoji: '👟', topic: 'physics' },
  { fact: 'Mitochondria, the cell\'s power plants, were once free-living bacteria.', emoji: '🔋', topic: 'biology' },
  { fact: 'There is enough DNA in the average person\'s body to stretch from the Sun to Pluto and back — 17 times.', emoji: '🚀', topic: 'biology' },
  { fact: 'The word "chemistry" comes from the ancient Egyptian word "khēmia", meaning "earth".', emoji: '🏺', topic: 'chemistry' },
  { fact: 'A pulsar spins so fast that its surface moves at 24% the speed of light.', emoji: '💫', topic: 'physics' },
  { fact: 'The probability of a monkey randomly typing Hamlet is so small it would take longer than the age of the universe.', emoji: '🐒', topic: 'math' },
];
