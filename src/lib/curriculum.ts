export type LessonMode = "drill" | "para" | "timed" | "acc";
export type GameId = "rain" | "pop" | "race";
export type Difficulty = "easy" | "medium" | "hard";

export interface Lesson {
  id: string;
  title: string;
  newKeys: string[];
  tip: string;
  mode?: LessonMode;
  lines?: string[];
  seconds?: number;
  starsWpm?: [number, number, number];
  starsAcc?: [number, number, number];
}

export interface Unit {
  id: string;
  name: string;
  icon: string;
  wpm3: number;
  blurb: string;
  lessons: Lesson[];
  game?: GameId;
}

export const AVATARS = ["🦊", "🐸", "🦄", "🐧", "🐯", "🐙", "🦖", "🐝", "🐼", "🚀", "🌟", "🍉"];

export const UNITS: Unit[] = [
  {
    id: "u1",
    name: "Home Row Harbor",
    icon: "🏝️",
    wpm3: 8,
    blurb: "Where your fingers live! Learn the resting keys.",
    game: "rain",
    lessons: [
      {
        id: "l1",
        title: "F and J",
        newKeys: ["f", "j"],
        tip: "Feel the little bumps on <b>F</b> and <b>J</b>? Your pointer fingers rest there. Eyes on the screen — not on your hands!",
        lines: ["fff jjj fff jjj", "fj jf fj jf fjf jfj", "jjf ffj jf fj fjfj"],
      },
      {
        id: "l2",
        title: "D and K",
        newKeys: ["d", "k"],
        tip: "Middle fingers press <b>D</b> and <b>K</b>. Tap the key, then float right back home.",
        lines: ["ddd kkk ddd kkk", "dk kd dkd kdk dk kd", "fd jk dk fj kd dkfj"],
      },
      {
        id: "l3",
        title: "S and L",
        newKeys: ["s", "l"],
        tip: "Ring fingers are a little shy — give them a job on <b>S</b> and <b>L</b>.",
        lines: ["sss lll sss lll", "sl ls sls lsl ss ll", "sd kl fs jl sk ld"],
      },
      {
        id: "l4",
        title: "A and ;",
        newKeys: ["a", ";"],
        tip: "Pinkies take <b>A</b> and <b>;</b>. Small fingers, big job!",
        lines: ["aaa ;;; aaa ;;;", "a; ;a a;a ;a; aa ;;", "as ;l af ;j ad ;k"],
      },
      {
        id: "l5",
        title: "Home Row Mix",
        newKeys: [],
        tip: "All eight resting keys together. Slow and smooth beats fast and sloppy.",
        lines: ["asdf jkl; asdf jkl;", "aj sk dl f; aj sk dl", "dad sad fall lass all"],
      },
      {
        id: "l6",
        title: "G and H",
        newKeys: ["g", "h"],
        tip: "Pointers stretch inward for <b>G</b> and <b>H</b> — then hop back to F and J.",
        lines: ["ggg hhh ggg hhh", "fgf jhj gh hg gfg hjh", "gas has hag sag gag dash"],
      },
      {
        id: "l7",
        title: "Home Row Words",
        newKeys: [],
        tip: "Real words with only home row keys. You are already typing!",
        lines: ["ask dad; dad has a flag", "a lad shall add a glass", "a glad lass has a salad"],
      },
    ],
  },
  {
    id: "u2",
    name: "Top Row Trail",
    icon: "⛰️",
    wpm3: 10,
    blurb: "Reach up! Vowels and friends live upstairs.",
    game: "pop",
    lessons: [
      {
        id: "l8",
        title: "E and I",
        newKeys: ["e", "i"],
        tip: "Middle fingers reach up for <b>E</b> and <b>I</b> — the busiest letters in English!",
        lines: ["ded kik ded kik ee ii", "ei ie eie iei dei kie", "did lie side seas like"],
      },
      {
        id: "l9",
        title: "R and U",
        newKeys: ["r", "u"],
        tip: "Pointers reach up for <b>R</b> and <b>U</b>.",
        lines: ["frf juj frf juj rr uu", "ru ur rur uru fru jur", "sure rude fur ride user"],
      },
      {
        id: "l10",
        title: "T and Y",
        newKeys: ["t", "y"],
        tip: "Big stretch! Pointers travel for <b>T</b> and <b>Y</b>, then home again.",
        lines: ["ftf jyj ftf jyj tt yy", "ty yt tyt yty fty jyt", "try stay salty yes dusty"],
      },
      {
        id: "l11",
        title: "W and O",
        newKeys: ["w", "o"],
        tip: "Ring fingers up for <b>W</b> and <b>O</b>.",
        lines: ["sws lol sws lol ww oo", "wo ow wow owl low sow", "wow slow world would work"],
      },
      {
        id: "l12",
        title: "Q and P",
        newKeys: ["q", "p"],
        tip: "Pinkies reach for <b>Q</b> and <b>P</b> — the top row corners.",
        lines: ["aqa ;p; aqa ;p; qq pp", "qu ip quip quit pat pit", "pat props up a quiet quilt"],
      },
      {
        id: "l13",
        title: "Two Row Words",
        newKeys: [],
        tip: "Home row plus top row = hundreds of words!",
        lines: ["we like to play outside", "you are so happy today", "the water is quite deep"],
      },
      {
        id: "l14",
        title: "Trail Sprint",
        newKeys: [],
        tip: "Everything you know so far. Steady rhythm, like a drum: tap, tap, tap.",
        lines: ["tell us a story out loud", "your dog likes the grass", "we go up the hill to play"],
      },
    ],
  },
  {
    id: "u3",
    name: "Bottom Row Bay",
    icon: "🌊",
    wpm3: 12,
    blurb: "Dive down for the last letters of the alphabet.",
    game: "race",
    lessons: [
      {
        id: "l15",
        title: "V and N",
        newKeys: ["v", "n"],
        tip: "Pointers dive down for <b>V</b> and <b>N</b>.",
        lines: ["fvf jnj fvf jnj vv nn", "vn nv vnv nvn fvn jnv", "van vine nine seven never"],
      },
      {
        id: "l16",
        title: "B and M",
        newKeys: ["b", "m"],
        tip: "Another pointer stretch for <b>B</b>, and <b>M</b> for the right hand.",
        lines: ["fbf jmj fbf jmj bb mm", "bm mb bmb mbm fbm jmb", "my mom made a big meal"],
      },
      {
        id: "l17",
        title: "C and Comma",
        newKeys: ["c", ","],
        tip: "Middle fingers down for <b>C</b> and <b>,</b> — commas give sentences a rest.",
        lines: ["dcd k,k dcd k,k cc ,,", "cat can cool nice city,", "we can cook, we can code"],
      },
      {
        id: "l18",
        title: "X and Period",
        newKeys: ["x", "."],
        tip: "Ring fingers down for <b>X</b> and <b>.</b> — every sentence ends with one.",
        lines: ["sxs l.l sxs l.l xx ..", "box fox six mix wax.", "the fox sat in a box."],
      },
      {
        id: "l19",
        title: "Z and Slash",
        newKeys: ["z", "/"],
        tip: "Pinkies down for <b>Z</b> and <b>/</b>. That completes the alphabet!",
        lines: ["aza ;/; aza ;/; zz //", "zip zoom zebra buzz jazz", "bees buzz. zebras zoom."],
      },
      {
        id: "l20",
        title: "Alphabet Round Up",
        newKeys: [],
        tip: "This sentence uses every letter A to Z. A true typing test!",
        lines: ["the quick brown fox jumps over the lazy dog", "we explore amazing lands very quickly"],
      },
    ],
  },
  {
    id: "u4",
    name: "Capital City",
    icon: "🏰",
    wpm3: 12,
    blurb: "Big letters and punctuation make real writing.",
    lessons: [
      {
        id: "l21",
        title: "Left Hand Capitals",
        newKeys: ["ShiftR"],
        tip: "Hold the <b>right shift</b> with your right pinky while the left hand types the letter. Two hands, one capital!",
        lines: ["Aa Ss Dd Ff Gg", "Tt Rr Ee Ww Qq", "Fred Sam Dave Tess Greg"],
      },
      {
        id: "l22",
        title: "Right Hand Capitals",
        newKeys: ["ShiftL"],
        tip: "Now hold the <b>left shift</b> with your left pinky for right-hand letters.",
        lines: ["Jj Kk Ll Hh Yy", "Uu Ii Oo Pp Nn Mm", "Jill Kim Owen Uma Holly"],
      },
      {
        id: "l23",
        title: "Real Sentences",
        newKeys: [],
        tip: "Capital at the start, period at the end. You are writing for real now.",
        lines: ["We ride bikes. We fly kites.", "Mom, Dad, and I bake bread.", "First we read, then we play."],
      },
      {
        id: "l24",
        title: "Questions and Wow!",
        newKeys: ["?", "!"],
        tip: "<b>?</b> is shift plus slash. <b>!</b> is shift plus 1 — way up top with your pinky.",
        lines: ["Who? What? When? Where?", "Wow! Look out! That is fun!", "Can you type fast? Yes, I can!"],
      },
      {
        id: "l25",
        title: "Quotes and Apostrophes",
        newKeys: ["'", '"'],
        tip: "Your right pinky owns the <b>'</b> key. Add shift for <b>\"</b> quotes.",
        lines: ["it's don't can't I'm we're", '"Hello," said the owl.', "It's Ben's turn. Don't stop!"],
      },
      {
        id: "l26",
        title: "City Review",
        newKeys: [],
        tip: "Everything together — capitals, commas, questions, quotes.",
        lines: ['Dr. Lee asked, "Are you ready?"', "Yes! We're ready to type.", "Great job, team. Keep going!"],
      },
    ],
  },
  {
    id: "u5",
    name: "Number Mountain",
    icon: "🔢",
    wpm3: 12,
    blurb: "Climb to the number row at the very top.",
    lessons: [
      {
        id: "l27",
        title: "1, 2 and 3",
        newKeys: ["1", "2", "3"],
        tip: "Left hand climbs: pinky to <b>1</b>, ring to <b>2</b>, middle to <b>3</b>.",
        lines: ["a1a s2s d3d 11 22 33", "12 23 31 123 321 213", "I am 12. My cat is 3."],
      },
      {
        id: "l28",
        title: "4, 5, 6 and 7",
        newKeys: ["4", "5", "6", "7"],
        tip: "Pointers do double duty: left takes <b>4</b> and <b>5</b>, right takes <b>6</b> and <b>7</b>.",
        lines: ["f4f f5f j6j j7j 45 67", "44 55 66 77 4567 7654", "We saw 47 birds and 56 ants."],
      },
      {
        id: "l29",
        title: "8, 9 and 0",
        newKeys: ["8", "9", "0"],
        tip: "Right hand climbs: middle to <b>8</b>, ring to <b>9</b>, pinky to <b>0</b>.",
        lines: ["k8k l9l ;0; 88 99 00", "89 90 80 890 908 809", "I count from 10 to 90."],
      },
      {
        id: "l30",
        title: "Numbers in the Wild",
        newKeys: [],
        tip: "Numbers mixed into real sentences — just like homework!",
        lines: ["There are 365 days in 1 year.", "A spider has 8 legs, not 6.", "We read 20 pages in 15 minutes."],
      },
    ],
  },
  {
    id: "u6",
    name: "Word Wizard Woods",
    icon: "🌲",
    wpm3: 16,
    blurb: "Speed grows here. Common words become automatic.",
    lessons: [
      {
        id: "l31",
        title: "Speedy Small Words",
        newKeys: [],
        tip: "These tiny words are everywhere. Make them automatic — no thinking, just typing!",
        lines: ["the and you for are but not", "can had her was one our out", "day get has him his how new"],
      },
      {
        id: "l32",
        title: "Letter Teams",
        newKeys: [],
        tip: "<b>th</b>, <b>ch</b>, <b>sh</b> — letters that love to travel together.",
        lines: ["th the this that then them", "ch chip chat much such each", "sh shop ship wish when what"],
      },
      {
        id: "l33",
        title: "Double Trouble",
        newKeys: [],
        tip: "Double letters! Same finger, two quick taps.",
        lines: ["see less good will book keep", "tree small happy little sleep", "the little rabbit will sleep soon"],
      },
      {
        id: "l34",
        title: "Silly Sentences",
        newKeys: [],
        tip: "Silly sentences are the best sentences. Type them with a smile.",
        lines: ["a purple moose ate my homework", "the dancing robot lost a shoe", "my pizza sings on sunny days"],
      },
      {
        id: "l35",
        title: "Wise Words",
        newKeys: [],
        tip: "Old sayings people have typed (and written) for ages.",
        lines: ["practice makes perfect every day", "slow and steady wins the race", "look before you leap, my friend"],
      },
    ],
  },
  {
    id: "u7",
    name: "Story Summit",
    icon: "🏔️",
    wpm3: 20,
    blurb: "The peak! Whole paragraphs, timed runs, and your diploma.",
    lessons: [
      {
        id: "l36",
        title: "Busy Bees",
        newKeys: [],
        mode: "para",
        tip: "A whole paragraph about bees. Take a breath, find your rhythm.",
        lines: [
          "Honeybees dance to tell their friends where flowers grow. A bee may visit one hundred flowers on a single trip. People have loved honey for thousands of years.",
        ],
      },
      {
        id: "l37",
        title: "Space Facts",
        newKeys: [],
        mode: "para",
        tip: "Blast off! Type your way through the solar system.",
        lines: [
          "The sun is a star at the center of our solar system. Light from the sun takes about eight minutes to reach Earth. Jupiter is so big that one thousand Earths could fit inside it.",
        ],
      },
      {
        id: "l38",
        title: "Long Ago",
        newKeys: [],
        mode: "para",
        tip: "A little history. Scribes copied books by hand — you can type faster than any of them.",
        lines: [
          "Long ago, people wrote on clay tablets and rolled up scrolls. The printing press changed the world in 1440. Today you can type words faster than any scribe from long ago.",
        ],
      },
      {
        id: "l39",
        title: "One Minute Dash",
        newKeys: [],
        mode: "timed",
        seconds: 60,
        starsWpm: [12, 18, 25],
        tip: "Type as much as you can in one minute. Accuracy still counts!",
      },
      {
        id: "l40",
        title: "Accuracy Master",
        newKeys: [],
        mode: "acc",
        starsAcc: [94, 97, 99],
        tip: "Forget speed. This one is about being <b>perfect</b>. Slow down and hit every key.",
        lines: [
          "The careful typist checks each key before pressing it.",
          "Quiet focus beats quick fingers every single time.",
        ],
      },
      {
        id: "l41",
        title: "Graduation Run",
        newKeys: [],
        mode: "timed",
        seconds: 120,
        starsWpm: [14, 20, 28],
        tip: "Two whole minutes — everything you have learned. Finish this and earn your certificate!",
      },
    ],
  },
];

export interface FlatLesson extends Lesson {
  unit: Unit;
  index: number;
}

export const ALL_LESSONS: FlatLesson[] = UNITS.flatMap((u) => u.lessons).map((l, i) => ({
  ...l,
  unit: UNITS.find((u) => u.lessons.some((x) => x.id === l.id))!,
  index: i,
}));

export const LESSON_BY_ID = new Map(ALL_LESSONS.map((l) => [l.id, l]));
export const GRADUATION_LESSON_ID = "l41";

export const TIMED_POOL = [
  "The quick brown fox jumps over the lazy dog.",
  "We packed six bags for the long trip north.",
  "My friend can juggle five red apples at once.",
  "The little boat sailed across the quiet lake.",
  "Every good story needs a brave hero and a plan.",
  "Ten small ducks marched down to the pond today.",
  "She drew a map of the stars on blue paper.",
  "The happy dog dug a big hole in the garden.",
  "We baked fresh bread and shared it with everyone.",
  "A gentle rain fell on the roof all night long.",
];

export const GAME_WORDS: Record<Difficulty, string[]> = {
  easy: ["as", "ad", "all", "ask", "dad", "sad", "lad", "fall", "glad", "hall", "gas", "has", "flag", "salad", "dash"],
  medium: [
    "like", "ride", "true", "stay", "play", "word", "work", "quiet", "water", "paper",
    "house", "story", "happy", "world", "today", "sunny", "tiger", "river",
  ],
  hard: [
    "jungle", "wizard", "rocket", "planet", "zigzag", "puzzle", "branch", "voyage",
    "crayon", "magnet", "bounce", "expert", "frozen", "kingdom", "whisper", "javelin",
  ],
};

export const GAME_LETTERS: Record<Difficulty, string[]> = {
  easy: [..."asdfghjkl"],
  medium: [..."asdfghjklqwertyuiop"],
  hard: [..."abcdefghijklmnopqrstuvwxyz"],
};

export interface GameMeta {
  id: GameId;
  name: string;
  icon: string;
  unitId: string;
  how: string;
}

export const GAMES: Record<GameId, GameMeta> = {
  rain: {
    id: "rain",
    name: "Letter Rain",
    icon: "🌧️",
    unitId: "u1",
    how: "Letters fall from the sky. Press the matching key to zap them before they splash down! Three misses and the round ends.",
  },
  pop: {
    id: "pop",
    name: "Balloon Pop",
    icon: "🎈",
    unitId: "u2",
    how: "Balloons float up carrying words. Type a word letter by letter to pop its balloon. Don't let three balloons float away!",
  },
  race: {
    id: "race",
    name: "Rocket Race",
    icon: "🚀",
    unitId: "u3",
    how: "Type each word to fuel your rocket in a 45 second race against Robo-Rocket. Finish the word, zoom ahead!",
  },
};

export const DIFFICULTY_LABELS: Record<Difficulty, { name: string; icon: string; desc: string }> = {
  easy: { name: "Sprout", icon: "🌱", desc: "Home row letters and small words" },
  medium: { name: "Explorer", icon: "🧭", desc: "Two rows of letters, medium words" },
  hard: { name: "Wizard", icon: "🧙", desc: "The whole alphabet, big words" },
};

/* ---------- progress-dependent helpers (pure, shared client/server) ---------- */
export interface LessonStat {
  stars: number;
  bestWpm: number;
  bestAcc: number;
  tries: number;
}
export type ProgressMap = Record<string, LessonStat>;

export function starsOf(progress: ProgressMap, lessonId: string): number {
  return progress[lessonId]?.stars ?? 0;
}
export function totalStars(progress: ProgressMap): number {
  return ALL_LESSONS.reduce((n, l) => n + starsOf(progress, l.id), 0);
}
export function lessonsDone(progress: ProgressMap): number {
  return ALL_LESSONS.filter((l) => starsOf(progress, l.id) >= 1).length;
}
export function isLessonUnlocked(progress: ProgressMap, lessonId: string): boolean {
  const l = LESSON_BY_ID.get(lessonId);
  if (!l) return false;
  if (l.index === 0) return true;
  return starsOf(progress, ALL_LESSONS[l.index - 1].id) >= 1;
}
export function isUnitComplete(progress: ProgressMap, unit: Unit): boolean {
  return unit.lessons.every((l) => starsOf(progress, l.id) >= 1);
}
export function nextLessonId(progress: ProgressMap): string | null {
  for (const l of ALL_LESSONS) if (starsOf(progress, l.id) < 1) return l.id;
  return null;
}
export function autoDifficulty(progress: ProgressMap): Difficulty {
  const done = lessonsDone(progress);
  if (done >= 20) return "hard";
  if (done >= 13) return "medium";
  return "easy";
}
