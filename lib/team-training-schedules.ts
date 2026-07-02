/**
 * Default weekly training slots per team (Europe/Vienna).
 * weekday: 1 = Monday … 7 = Sunday (ISO)
 */
export const TEAM_TRAINING_SCHEDULES: Record<
  string,
  {
    slots: {
      weekday: number;
      start: string;
      end: string;
      field: string;
    }[];
  }
> = {
  KM: {
    slots: [
      { weekday: 2, start: "19:00", end: "20:30", field: "platz-1" },
      { weekday: 4, start: "19:00", end: "20:30", field: "platz-1" },
      { weekday: 6, start: "10:00", end: "11:30", field: "platz-1" },
    ],
  },
  Res: {
    slots: [
      { weekday: 2, start: "18:00", end: "19:30", field: "platz-2" },
      { weekday: 4, start: "18:00", end: "19:30", field: "platz-2" },
      { weekday: 7, start: "09:00", end: "10:30", field: "platz-2" },
    ],
  },
  U15: {
    slots: [
      { weekday: 1, start: "17:30", end: "19:00", field: "kunstrasen" },
      { weekday: 3, start: "17:30", end: "19:00", field: "kunstrasen" },
      { weekday: 5, start: "17:00", end: "18:30", field: "kunstrasen" },
    ],
  },
  "U14-A": {
    slots: [
      { weekday: 2, start: "17:00", end: "18:30", field: "platz-2" },
      { weekday: 4, start: "17:00", end: "18:30", field: "platz-2" },
    ],
  },
  "U14-B": {
    slots: [
      { weekday: 1, start: "17:00", end: "18:30", field: "platz-1" },
      { weekday: 3, start: "17:00", end: "18:30", field: "platz-1" },
    ],
  },
  "U12-B": {
    slots: [
      { weekday: 2, start: "16:30", end: "18:00", field: "kunstrasen" },
      { weekday: 4, start: "16:30", end: "18:00", field: "kunstrasen" },
    ],
  },
  U11: {
    slots: [
      { weekday: 3, start: "16:00", end: "17:30", field: "platz-2" },
      { weekday: 5, start: "16:00", end: "17:30", field: "platz-2" },
    ],
  },
  U10: {
    slots: [
      { weekday: 2, start: "16:00", end: "17:15", field: "kunstrasen" },
      { weekday: 4, start: "16:00", end: "17:15", field: "kunstrasen" },
    ],
  },
  "U09-A": {
    slots: [
      { weekday: 1, start: "16:00", end: "17:15", field: "platz-1" },
      { weekday: 3, start: "16:00", end: "17:15", field: "platz-1" },
    ],
  },
  "U09-B": {
    slots: [
      { weekday: 2, start: "15:30", end: "16:45", field: "halle" },
      { weekday: 4, start: "15:30", end: "16:45", field: "halle" },
    ],
  },
};

export const TRAINING_SEED_DESCRIPTION =
  "Standard-Trainingsplan (Vorlage — in der Admin bearbeitbar).";

export const TRAINING_LOCATION = "Sportplatz Strasshof";
