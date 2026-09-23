import * as T from "io-ts";
import { DateFromISOString } from "io-ts-types";
import * as Distortion from "../distortion";
// import this polyfill before `uuid`: https://www.npmjs.com/package/uuid#user-content-getrandomvalues-not-supported
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";
import { Optional, VERSION } from "./persist";

export const ID = T.string;
export type ID = T.TypeOf<typeof ID>;

export const Thought = T.intersection(
  [
    T.type(
      {
        v: T.string,
        automaticThought: T.string,
        alternativeThought: T.string,
        cognitiveDistortions: Distortion.SetCodec,
        challenge: T.string,
        createdAt: DateFromISOString,
        updatedAt: DateFromISOString,
        uuid: ID,
      },
      "Thought.Required"
    ),
    Optional,
  ],
  "Thought"
);
export type Thought = T.TypeOf<typeof Thought>;

export interface CreateArgs {
  automaticThought: string;
  alternativeThought: string;
  cognitiveDistortions: Iterable<Distortion.Distortion | string>;
  challenge: string;
  createdAt?: Date;
  updatedAt?: Date;
  uuid?: string;
  situation?: string;
  emotion?: string;
  emotionIntensity?: number | null;
  automaticBelief?: number | null;
  evidenceFor?: string;
  alternativeBelief?: number | null;
  emotionIntensityAfter?: number | null;
}
export const THOUGHTS_KEY_PREFIX = `@Quirk:thoughts:`;
export function getThoughtKey(info: string): string {
  return info.startsWith(THOUGHTS_KEY_PREFIX)
    ? info
    : `${THOUGHTS_KEY_PREFIX}${info}`;
}
export function key(t: Pick<Thought, "uuid">): string {
  return getThoughtKey(t.uuid);
}

function optionalFromArgs(args: CreateArgs): T.TypeOf<typeof Optional> {
  const next: T.TypeOf<typeof Optional> = {};
  if (args.situation) next.situation = args.situation;
  if (args.emotion) next.emotion = args.emotion;
  if (args.emotionIntensity != null)
    next.emotionIntensity = args.emotionIntensity;
  if (args.automaticBelief != null) next.automaticBelief = args.automaticBelief;
  if (args.evidenceFor) next.evidenceFor = args.evidenceFor;
  if (args.alternativeBelief != null)
    next.alternativeBelief = args.alternativeBelief;
  if (args.emotionIntensityAfter != null)
    next.emotionIntensityAfter = args.emotionIntensityAfter;
  return next;
}

export function create(args: CreateArgs): Thought {
  const cognitiveDistortions = new Set(
    Array.from(args.cognitiveDistortions).map((name) => {
      const d = typeof name === "string" ? Distortion.bySlug[name] : name;
      if (!d) {
        throw new Error(`no such distortion: ${name}`);
      }
      return d;
    })
  );
  const uuid = args.uuid ?? getThoughtKey(uuidv4());
  return {
    automaticThought: args.automaticThought,
    alternativeThought: args.alternativeThought,
    challenge: args.challenge,
    cognitiveDistortions,
    uuid,
    createdAt: args.createdAt ?? new Date(),
    updatedAt: args.updatedAt ?? new Date(),
    v: VERSION,
    ...optionalFromArgs(args),
  };
}

export function hasFullRecordFields(
  t: Pick<
    Thought,
    | "situation"
    | "emotion"
    | "emotionIntensity"
    | "automaticBelief"
    | "evidenceFor"
    | "alternativeBelief"
    | "emotionIntensityAfter"
  >
): boolean {
  return Boolean(
    (t.situation && t.situation.trim()) ||
      (t.emotion && t.emotion.trim()) ||
      t.emotionIntensity != null ||
      t.automaticBelief != null ||
      (t.evidenceFor && t.evidenceFor.trim()) ||
      t.alternativeBelief != null ||
      t.emotionIntensityAfter != null
  );
}

export interface Group {
  date: string;
  thoughts: Thought[];
}

export function groupByDay(thoughts: Thought[]): Group[] {
  const dates: string[] = [];
  const groups: Group[] = [];

  const sortedThoughts = thoughts.sort(
    (first, second) => second.createdAt.getTime() - first.createdAt.getTime()
  );

  for (const thought of sortedThoughts) {
    const date = thought.createdAt.toDateString();
    if (!dates.includes(date)) {
      dates.push(date);
      groups.push({
        date,
        thoughts: [thought],
      });
      continue;
    }

    groups[dates.length - 1].thoughts.push(thought);
  }

  return groups;
}
