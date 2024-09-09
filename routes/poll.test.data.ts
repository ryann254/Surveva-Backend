const reqCreatePoll = {
  question: 'トランプ氏は2027年の選挙に勝つと思いますか？',
  answers: ['Yes', 'No', 'Maybe'],
  owner: '',
  isCreatedByAdmin: true,
  category: '',
  language: 'Japanese',
  servedAt: new Date().toISOString(),
  paid: '66b494e38ca16b2917fa431e',
  location: {
    country: 'Japan',
    continent: 'Asia',
  },
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
  location: {
    country: 'Japan',
    continent: 'Asia',
  },
};

const reqUpdatePoll = {
  question: "Who's the best candidate for the 2027 elections?",
  answers: ['Donald Trump', 'Joe Biden', 'Kamala Harris', 'Ron DeSantis'],
  owner: '',
  isCreatedByAdmin: true,
  category: '',
  language: 'Japanese',
  servedAt: new Date().toISOString(),
  paid: '66b494e38ca16b2917fa431e',
  location: {
    country: 'Japan',
    continent: 'Asia',
  },
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
  location: {
    country: 'United States',
    continent: 'North America',
  },
};

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
    question: 'What is your favorite cuisine?',
    answers: ['Italian', 'Chinese', 'Mexican', 'Indian'],
    category: 'Health and Food',
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

export {
  reqCreatePoll,
  reqUpdatePoll,
  reqCreatePollHarmful,
  reqUpdatePollActionTypeVoted,
  reqUpdatePollActionTypeCommented,
  reqUpdatePollActionTypeLiked,
  reqCreatePollForQMSLayer1,
  additionalTestPolls,
};
