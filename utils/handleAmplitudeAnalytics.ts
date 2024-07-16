import { config } from '../config';

// TODO: Replace the following fields: user_id, age, gender, country, region and platform.
export const sendAmplitudeAnalytics = async (eventType: string) => {
  const body = {
    api_key: config.amplitudeApiKey,
    events: [
      {
        user_id: '668e26f8ead3682a9d57bdb9',
        event_type: eventType,
        user_properties: {
          age: '{{$randomDatePast}}',
          gender: 'male',
        },
        country: 'Japan',
        region: 'Asia',
        platform: 'Android',
      },
    ],
  };

  try {
    const result = await fetch(config.amplitudeSendAnalyticsUrl, {
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

export const deleteAmplitudeAnalytics = async (userIds: string[]) => {
  const body = {
    user_ids: userIds,
    delete_from_org: 'true',
    ignore_invalid_ids: 'true',
    requester: 'admin@surveva.com',
  };

  const credentials = `${config.amplitudeApiKey}:${config.amplitudeSecretKey}`;
  const encodedCredentials = btoa(credentials);

  try {
    const result = await fetch(config.amplitudeDeleteAnalyticsUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: '*/*',
        Authorization: `Basic ${encodedCredentials}`,
      },
      body: JSON.stringify(body),
    });

    if (result.ok) {
      console.log('Amplitude analytics deleted successfully');
    }
  } catch (error) {
    console.log('Amplitude analytics not deleted:', error);
  }
};
