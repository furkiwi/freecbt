import * as T from "io-ts";
import * as Distortion from "../distortion";

export const VERSION = "Thought-v1";

export const Optional = T.partial(
  {
    situation: T.string,
    emotion: T.string,
    emotionIntensity: T.union([T.number, T.null]),
    automaticBelief: T.union([T.number, T.null]),
    evidenceFor: T.string,
    alternativeBelief: T.union([T.number, T.null]),
    emotionIntensityAfter: T.union([T.number, T.null]),
  },
  "Thought.Optional"
);
export type Optional = T.TypeOf<typeof Optional>;

/**
 * our json-formatted thought data, as persisted to disk
 */
export const Persist = T.intersection(
  [
    T.type(
      {
        v: T.string,
        automaticThought: T.string,
        alternativeThought: T.string,
        cognitiveDistortions: T.array(T.string),
        challenge: T.string,
        createdAt: T.string,
        updatedAt: T.string,
        uuid: T.string,
      },
      "Thought.Persist.Required"
    ),
    Optional,
  ],
  "Thought.Persist"
);
export type Persist = T.TypeOf<typeof Persist>;

/**
 * old-style thoughts, as json
 * These were persisted in user data, so we must maintain decode support forever
 */
export const Legacy = T.intersection(
  [
    T.type({
      automaticThought: T.string,
      alternativeThought: T.string,
      cognitiveDistortions: T.array(Distortion.LegacyID),
      challenge: T.string,
      createdAt: T.string,
      updatedAt: T.string,
      uuid: T.string,
    }),
    T.partial({ v: T.undefined }),
    Optional,
  ],
  "Thought.Legacy"
);
export type Legacy = T.TypeOf<typeof Legacy>;
