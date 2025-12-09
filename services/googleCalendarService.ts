import { GoogleCalendarEvent } from '../types';

export const listGoogleEvents = async (accessToken: string, timeMin: Date, timeMax: Date): Promise<GoogleCalendarEvent[]> => {
  try {
    const url = new URL('https://www.googleapis.com/calendar/v3/calendars/primary/events');
    url.searchParams.append('timeMin', timeMin.toISOString());
    url.searchParams.append('timeMax', timeMax.toISOString());
    url.searchParams.append('singleEvents', 'true');
    url.searchParams.append('orderBy', 'startTime');

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
        if (response.status === 401) {
            console.warn("Google token expired or invalid");
            return [];
        }
        throw new Error(`Google Calendar API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error('Error fetching Google events:', error);
    return [];
  }
};

export const createGoogleEvent = async (accessToken: string, event: Partial<GoogleCalendarEvent>): Promise<any> => {
    try {
        const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(event),
        });

        if (!response.ok) {
            throw new Error(`Failed to create Google event: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error creating Google event:', error);
        throw error;
    }
};