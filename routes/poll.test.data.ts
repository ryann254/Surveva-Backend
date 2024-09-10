const reqCreatePoll = {
  question: 'トランプ氏は2027年の選挙に勝つと思いますか？',
  answers: ['Yes', 'No', 'Maybe'],
  owner: '',
  isCreatedByAdmin: true,
  category: '',
  language: 'Japanese',
  servedAt: new Date().toISOString(),
  paid: '66b494e38ca16b2917fa431e',
};

const reqCreatePollHarmful = {
  question: 'How to kill a president?',
  answers: ['Yes', 'No', 'Maybe'],
  owner: '',
  isCreatedByAdmin: true,
  category: '',
  language: 'Japanese',
  servedAt: new Date().toISOString(),
  paid: '66b494e38ca16b2917fa431e',
};

const reqSearchPoll = {
  ...reqCreatePoll,
  question: "Who's the best written character in Demon Slayer?",
  answers: ['Tanjiro', 'Tengen', 'Nezuko', 'Inosuke'],
  owner: '66b494e38ca16b2917fa431e',
}

const reqUpdatePoll = {
  question: "Who's the best candidate for the 2027 elections?",
  answers: ['Donald Trump', 'Joe Biden', 'Kamala Harris', 'Ron DeSantis'],
  owner: '',
  isCreatedByAdmin: true,
  category: '',
  language: 'Japanese',
  servedAt: new Date().toISOString(),
  paid: '66b494e38ca16b2917fa431e',
};

const reqUpdatePollActionTypeVoted = {
  ...reqUpdatePoll,
  responses: [
    {
      answer: 'Donald Trump',
      origin: 'dsa',
      geography: 'Asia',
      age: '1990/03/23',
      gender: 'male',
    },
  ],
};

const reqUpdatePollActionTypeCommented = {
  ...reqUpdatePoll,
  comments: ['This is a test comment'],
};

const reqUpdatePollActionTypeLiked = {
  ...reqUpdatePoll,
  likes: 1,
};

const reqCreatePollForQMSLayer1 = {
  question: 'What is your favorite programming language?',
  answers: ['JavaScript', 'Python', 'Java', 'C++'],
  owner: '66b494e38ca16b2917fa431e',
  isCreatedByAdmin: false,
  category: '',
  language: '',
  servedAt: new Date().toISOString(),
  paid: '66b494e38ca16b2917fa431e',
};

const reqCreatePollForQMSLayer2 = {
  ...reqCreatePollForQMSLayer1,
  question: 'Which team won the champions league in 2021?',
  answers: ['Chelsea', 'Manchester City', 'Liverpool', 'Arsenal'],
};

const reqCreatePollForQMSLayer3 = {
  ...reqCreatePollForQMSLayer1,
  question: 'Who is the most successful businessman in 2022?',
  answers: ['Elon Musk', 'Jeff Bezos', 'Bill Gates', 'Warren Buffett'],
};

const reqCreatePollForQMSLayer4a = {
  ...reqCreatePollForQMSLayer1,
  question: '¿Quién tiene el mejor álbum de música de todos los tiempos?',
  answers: ['Michael Jackson', 'Elvis Presley', 'Drake', 'Kendrick Lamar'],
}

const reqCreatePollForQMSLayer4b = {
    ...reqCreatePollForQMSLayer1,
    question: 'What is your favorite cuisine?',
    answers: ['Italian', 'Chinese', 'Mexican', 'Indian'],
  }

// Add more test polls with different categories, languages, and locations
const additionalTestPolls = [
  {
    ...reqCreatePollForQMSLayer1,
    question: 'Is C++ a good programming language?',
    answers: ['Yes', 'No', 'Maybe'],
    category: 'Science and Technology',
    language: 'English',
  },
  {
    ...reqCreatePollForQMSLayer1,
    question: 'Who was the best president of the United States?',
    answers: ['Donald Trump', 'Joe Biden', 'Barack Obama', 'George W. Bush'],
    category: 'Politics',
    language: 'English',
  },
  {
    ...reqCreatePollForQMSLayer1,
    question: 'Kati ya David Guetta na Avicci nani mkali?',
    answers: ['David Guetta', 'Avicci', 'Wote', 'Hakuna'],
    category: 'Media and Entertainment',
    language: 'Swahili',
  },
  {
    ...reqCreatePollForQMSLayer1,
    question: 'Who is the best character in one piece?',
    answers: ['Luffy', 'Zoro', 'Sanji', 'Nami'],
    category: 'Media and Entertainment',
    language: 'English',
  },
  // Add more test polls as needed
];

const dsaLayer1Polls = [
  {
    ...reqCreatePollForQMSLayer1,
    question: 'Is C++ a good programming language?',
    answers: ['Yes', 'No', 'Maybe'],
    category: 'Science and Technology',
    language: 'English',
    popularityCount: 1,
  },
  {
    ...reqCreatePollForQMSLayer1,
    question: 'What is the best way to learn programming?',
    answers: ['By doing it yourself', 'By reading books', 'By watching videos', 'By asking for help'],
    category: 'Science and Technology',
    language: 'English',
    popularityCount: 2,
  },
  {
    ...reqCreatePollForQMSLayer1,
    question: 'What\'s the best AI out there righ now?',
    answers: ['OpenAI', 'Google', 'Microsoft', 'Apple'],
    category: 'Science and Technology',
    language: 'English',
    popularityCount: 3,
  },
  {
    ...reqCreatePollForQMSLayer1,
    question: 'Should a software developer be a good programmer?',
    answers: ['Yes', 'No', 'Maybe'],
    category: 'Science and Technology',
    language: 'English',
    popularityCount: 4,
  },
  {
    ...reqCreatePollForQMSLayer1,
    question: 'What programming language do I need to learn for gaming?',
    answers: ['JavaScript', 'Python', 'Java', 'C++'],
    category: 'Science and Technology',
    language: 'English',
    popularityCount: 5,
  },
  {
    ...reqCreatePollForQMSLayer1,
    question: 'Will humans ever be able to travel to Mars using SpaceX?',
    answers: ['Yes', 'No', 'Maybe'],
    category: 'Science and Technology',
    language: 'English',
    popularityCount: 6,
  },
  {
    ...reqCreatePollForQMSLayer1,
    question: 'Who\'s the strongest hashira in Demon Slayer?',
    answers: ['Gyomei', 'Kyojuro', 'Tengen', 'Obanai'],
    category: 'Media and Entertainment',
    language: 'English',
    popularityCount: 7,
  },
  {
    ...reqCreatePollForQMSLayer1,
    question: 'What are the breathing styles in Demon Slayer?',
    answers: ['Water Breathing', 'Wind Breathing', 'Fire Breathing', 'Earth Breathing'],
    category: 'Media and Entertainment',
    language: 'English',
    popularityCount: 8,
  },
  {
    ...reqCreatePollForQMSLayer1,
    question: 'Is Luffy stronger than all the admirals?',
    answers: ['Yes', 'No', 'Maybe'],
    category: 'Media and Entertainment',
    language: 'English',
    popularityCount: 9,
  },
  {
    ...reqCreatePollForQMSLayer1,
    question: 'Does brook have a better devil fruit than Aokiji?',
    answers: ['Yes', 'No', 'Maybe'],
    category: 'Media and Entertainment',
    language: 'English',
    popularityCount: 10,
  }
]

export {
  reqCreatePoll,
  reqSearchPoll,
  reqUpdatePoll,
  reqCreatePollHarmful,
  reqUpdatePollActionTypeVoted,
  reqUpdatePollActionTypeCommented,
  reqUpdatePollActionTypeLiked,
  reqCreatePollForQMSLayer1,
  reqCreatePollForQMSLayer2,
  reqCreatePollForQMSLayer3,
  reqCreatePollForQMSLayer4a,
  reqCreatePollForQMSLayer4b,
  additionalTestPolls,
  dsaLayer1Polls
};
