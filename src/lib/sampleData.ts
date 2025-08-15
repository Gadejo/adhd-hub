/**
 * Sample data for popular subjects to help users get started
 */

export interface SampleResource {
  title: string;
  url: string;
  subject: string;
  type: 'video' | 'article' | 'book' | 'course' | 'podcast' | 'other';
  priority: number;
  notes: string;
}

export const sampleResources: SampleResource[] = [
  // Japanese
  {
    title: 'Duolingo Japanese Course',
    url: 'https://www.duolingo.com/course/ja/en/Learn-Japanese',
    subject: 'Japanese',
    type: 'course',
    priority: 3,
    notes: 'Interactive Japanese lessons with gamification. Great for beginners learning hiragana, katakana, and basic vocabulary.'
  },
  {
    title: 'Tofugu Hiragana Guide',
    url: 'https://www.tofugu.com/japanese/learn-hiragana/',
    subject: 'Japanese',
    type: 'article',
    priority: 4,
    notes: 'Comprehensive guide to learning hiragana with mnemonics and practice exercises.'
  },
  {
    title: 'JapanesePod101 Beginner Lessons',
    url: 'https://www.japanesepod101.com/',
    subject: 'Japanese',
    type: 'podcast',
    priority: 3,
    notes: 'Audio lessons for learning Japanese conversation and grammar. Excellent for listening practice.'
  },

  // Chemistry
  {
    title: 'Khan Academy Organic Chemistry',
    url: 'https://www.khanacademy.org/science/organic-chemistry',
    subject: 'Chemistry',
    type: 'course',
    priority: 4,
    notes: 'Comprehensive organic chemistry course with video lessons and practice problems.'
  },
  {
    title: 'Crash Course Chemistry',
    url: 'https://www.youtube.com/playlist?list=PL8dPuuaLjXtPHzzYuWy6fYEaX9mQQ8oGr',
    subject: 'Chemistry',
    type: 'video',
    priority: 3,
    notes: 'Fun and engaging chemistry videos covering general chemistry concepts.'
  },
  {
    title: 'ChemLibreTexts',
    url: 'https://chem.libretexts.org/',
    subject: 'Chemistry',
    type: 'other',
    priority: 4,
    notes: 'Free online chemistry textbooks and resources for all levels of chemistry.'
  },

  // Programming
  {
    title: 'freeCodeCamp JavaScript Course',
    url: 'https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/',
    subject: 'Programming',
    type: 'course',
    priority: 5,
    notes: 'Comprehensive JavaScript course covering basics to advanced concepts with interactive coding challenges.'
  },
  {
    title: 'The Odin Project',
    url: 'https://www.theodinproject.com/',
    subject: 'Programming',
    type: 'course',
    priority: 4,
    notes: 'Full-stack web development curriculum with projects and community support.'
  },
  {
    title: 'Clean Code by Robert Martin',
    url: 'https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350884',
    subject: 'Programming',
    type: 'book',
    priority: 4,
    notes: 'Essential book for learning to write maintainable and readable code.'
  },

  // Mathematics
  {
    title: 'Khan Academy Calculus',
    url: 'https://www.khanacademy.org/math/calculus-1',
    subject: 'Mathematics',
    type: 'course',
    priority: 4,
    notes: 'Step-by-step calculus lessons with practice problems and instant feedback.'
  },
  {
    title: '3Blue1Brown Essence of Linear Algebra',
    url: 'https://www.youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab',
    subject: 'Mathematics',
    type: 'video',
    priority: 5,
    notes: 'Beautiful visual explanations of linear algebra concepts. Highly recommended for intuitive understanding.'
  },
  {
    title: 'MIT OpenCourseWare Mathematics',
    url: 'https://ocw.mit.edu/courses/mathematics/',
    subject: 'Mathematics',
    type: 'course',
    priority: 4,
    notes: 'Free MIT mathematics courses with lecture notes, assignments, and exams.'
  },

  // Physics
  {
    title: 'Physics Classroom',
    url: 'https://www.physicsclassroom.com/',
    subject: 'Physics',
    type: 'other',
    priority: 3,
    notes: 'Interactive physics tutorials and simulations for high school physics concepts.'
  },
  {
    title: 'Feynman Lectures on Physics',
    url: 'https://www.feynmanlectures.caltech.edu/',
    subject: 'Physics',
    type: 'book',
    priority: 5,
    notes: 'Classic physics lectures by Richard Feynman. Available free online with excellent explanations.'
  },

  // Web Development
  {
    title: 'MDN Web Docs',
    url: 'https://developer.mozilla.org/en-US/',
    subject: 'Web Development',
    type: 'other',
    priority: 5,
    notes: 'Comprehensive web development documentation and tutorials from Mozilla.'
  },
  {
    title: 'CSS-Tricks',
    url: 'https://css-tricks.com/',
    subject: 'Web Development',
    type: 'article',
    priority: 4,
    notes: 'Excellent CSS tutorials, tips, and tricks for modern web development.'
  },
  {
    title: 'React Official Tutorial',
    url: 'https://reactjs.org/tutorial/tutorial.html',
    subject: 'Web Development',
    type: 'course',
    priority: 4,
    notes: 'Official React tutorial building a tic-tac-toe game. Great introduction to React concepts.'
  },

  // Spanish
  {
    title: 'SpanishDict Conjugation Tool',
    url: 'https://www.spanishdict.com/conjugate',
    subject: 'Spanish',
    type: 'other',
    priority: 4,
    notes: 'Comprehensive Spanish verb conjugation tool with examples and practice exercises.'
  },
  {
    title: 'News in Slow Spanish',
    url: 'https://www.newsinslowspanish.com/',
    subject: 'Spanish',
    type: 'podcast',
    priority: 3,
    notes: 'Current events podcast in slow, clear Spanish. Great for intermediate learners.'
  },

  // Art & Design
  {
    title: 'Proko Figure Drawing Course',
    url: 'https://www.proko.com/figure-drawing-fundamentals-course/',
    subject: 'Art & Design',
    type: 'course',
    priority: 4,
    notes: 'Professional figure drawing course with detailed anatomy instruction.'
  },
  {
    title: 'Adobe Creative Cloud Tutorials',
    url: 'https://helpx.adobe.com/creative-cloud/tutorials-explore.html',
    subject: 'Art & Design',
    type: 'video',
    priority: 3,
    notes: 'Official Adobe tutorials for Photoshop, Illustrator, and other creative tools.'
  },

  // Business
  {
    title: 'Harvard Business Review',
    url: 'https://hbr.org/',
    subject: 'Business Administration',
    type: 'article',
    priority: 4,
    notes: 'Leading business publication with case studies, management insights, and industry analysis.'
  },
  {
    title: 'Coursera MBA Essentials',
    url: 'https://www.coursera.org/specializations/mba-essentials',
    subject: 'Business Administration',
    type: 'course',
    priority: 4,
    notes: 'Online MBA fundamentals covering accounting, finance, marketing, and operations.'
  },

  // Psychology
  {
    title: 'Crash Course Psychology',
    url: 'https://www.youtube.com/playlist?list=PL8dPuuaLjXtOPiKXxs0dVB7IHGMTiJQQr',
    subject: 'Psychology',
    type: 'video',
    priority: 3,
    notes: 'Engaging overview of psychology concepts from cognitive to social psychology.'
  },
  {
    title: 'Psychology Today',
    url: 'https://www.psychologytoday.com/',
    subject: 'Psychology',
    type: 'article',
    priority: 3,
    notes: 'Articles on mental health, relationships, and psychological research findings.'
  },

  // Music
  {
    title: 'Musictheory.net',
    url: 'https://www.musictheory.net/',
    subject: 'Music',
    type: 'course',
    priority: 4,
    notes: 'Free music theory lessons covering scales, chords, intervals, and more.'
  },
  {
    title: 'Simply Piano App',
    url: 'https://www.joytunes.com/simply-piano',
    subject: 'Music',
    type: 'other',
    priority: 3,
    notes: 'Interactive piano learning app that listens to your playing and provides feedback.'
  }
];

export function getSampleResourcesForSubject(subjectName: string): SampleResource[] {
  return sampleResources.filter(resource => resource.subject === subjectName);
}

export function getRandomSampleResources(count: number = 5): SampleResource[] {
  const shuffled = [...sampleResources].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}