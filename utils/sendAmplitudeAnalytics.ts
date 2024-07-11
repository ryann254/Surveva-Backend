export const sendAmplitudeAnalytics = async (eventType: string) => {
  const body = {
    api_key: process.env.AMPLITUDE_API_KEY,
    events: [
      {
        user_id: '668e26f8ead3682a9d57bdb9',
        event_type: eventType,
        user_properties: {
          age: '{{$randomDatePast}}',
          gender: 'male',
        },
        country: 'China',
        region: 'Asia',
        platform: 'Android',
      },
    ],
  };

  try {
    const result = await fetch(process.env.AMPLITUDE_URL || '', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: '*/*',
      },
      body: JSON.stringify(body),
    });

    if (result.ok) {
      console.log('Amplitude analytics sent successfully');
    }
  } catch (error) {
    console.error('Amplitude analytics not sent:', error);
  }
};
