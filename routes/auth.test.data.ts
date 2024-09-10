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

const reqNewUserQMS = {
  ...reqNewUserPoll,
  location: {
    country: 'United States',
    continent: 'North America',
  },
  language: 'English',
};

const reqNewUserQMS2 = {
  ...reqNewUserPoll,
  email: 'yamato@strawhats.com',
  location: {
    country: 'Kenya',
    continent: 'Africa',
  },
  language: 'English',
};

export {
  reqLoginUser,
  reqNewUser,
  reqNewUserCategory,
  reqLoginUserCategory,
  reqNewUserPoll,
  reqNewUserQMS,
  reqNewUserQMS2,
  reqLoginUserPoll,
};
