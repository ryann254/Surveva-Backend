const reqLoginUser = {
  email: 'monkeydluffy@strawhats.com',
  password: 'luffy123!',
};

const reqNewUser = {
  username: 'Monkey D. Luffy',
  email: 'monkeydluffy@strawhats.com',
  password: 'luffy123!',
  role: 'user',
  dob: '1990-01-01',
  location: {
    country: 'Japan',
    continent: 'Asia',
  },
  language: 'Japanese',
  gender: 'male',
  categories: ['669616cc6ce23313d6b36715', '66a379a157a7b9e228fbc9d5'],
};

const reqLoginUser2 = {
  email: 'momonusuke@strawhats.com',
  password: 'momonusuke123!',
};

const reqNewUser2 = {
  ...reqNewUser,
  username: 'Momonusuke',
  password: 'momonusuke123!',
  email: 'momonusuke@strawhats.com'
}

const reqLoginUserCategory = {
  email: 'nami@strawhats.com',
  password: 'nami1234@24',
};

const reqNewUserCategory = {
  username: 'Nami',
  password: 'nami1234@24',
  email: 'nami@strawhats.com',
  role: 'admin',
  dob: '1990-01-01',
  location: {
    country: 'Japan',
    continent: 'Asia',
  },
  language: 'Japanese',
  gender: 'female',
  categories: ['669616cc6ce23313d6b36715', '66a379a157a7b9e228fbc9d5'],
};

const reqLoginUserPoll = {
  email: 'nico.robin@strawhats.com',
  password: 'robin1234@24',
};

const reqNewUserPoll = {
  username: 'Nico Robin',
  password: 'robin1234@24',
  email: 'nico.robin@strawhats.com',
  role: 'admin',
  dob: '1990-02-06',
  location: {
    country: 'Japan',
    continent: 'Asia',
  },
  language: 'Japanese',
  gender: 'female',
  categories: ['669616cc6ce23313d6b36715'],
};

const reqLoginUserQMS = {
  email: 'franky@strawhats.com',
  password: 'franky1234@24',
};

const reqNewUserQMS = {
  ...reqNewUserPoll,
  username: 'Franky',
  password: 'franky1234@24',
  email: 'franky@strawhats.com',
  location: {
    country: 'United States',
    continent: 'North America',
  },
  language: 'English',
};

const reqLoginUserDSA = {
  email: 'brook@strawhats.com',
  password: 'brook1234@24',
};

const reqNewUserDSA = {
  ...reqNewUserPoll,
  email: 'brook@strawhats.com',
  password: 'brook1234@24',
  username: 'Brook',
  location: {
    country: 'United States',
    continent: 'North America',
  },
  language: 'English',
};

const reqNewUserDSA2 = {
  ...reqNewUserPoll,
  email: 'yamato@strawhats.com',
  password: 'yamato1234@24',
  username: 'Yamato',
  location: {
    country: 'Kenya',
    continent: 'Africa',
  },
  language: 'English',
};

export {
  reqLoginUser,
  reqLoginUser2,
  reqNewUser,
  reqNewUser2,
  reqNewUserCategory,
  reqLoginUserCategory,
  reqNewUserPoll,
  reqNewUserQMS,
  reqLoginUserPoll,
  reqLoginUserQMS,
  reqNewUserDSA,
  reqLoginUserDSA,
  reqNewUserDSA2
};
