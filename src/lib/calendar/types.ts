export interface CalendarEventRow {
  id: string;
  calendarId: string;
  providerEventId: string;
  recurringEventId: string | null;
  title: string;
  description: string | null;
  location: string | null;
  start: Date;
  end: Date;
  allDay: boolean;
  status: string;
  htmlLink: string | null;
  calendarName: string;
  calendarColor: string | null;
  calendarProviderColor: string | null;
  calendarEnabled: boolean;
  accessRole: string;
}

export interface CalendarRow {
  id: string;
  connectionId: string;
  name: string;
  providerColor: string | null;
  customColor: string | null;
  timeZone: string | null;
  accessRole: string;
  enabled: boolean;
  isPrimary: boolean;
  connectionEmail: string;
}
