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

export { reqCreatePoll, reqUpdatePoll, reqCreatePollHarmful };
