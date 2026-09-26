// Rubric embedded directly to avoid file system access on Vercel
const rubric = {
  "rubric_version": "1.0",
  "topic": "Nature and animals",
  "verdicts": {
    "pass": "Meets the term's pass_rule and has no contradiction.",
    "partial": "Hits at least one key or bonus idea but does not meet the pass_rule, or meets it but contains a contradiction.",
    "miss": "Hits no key or bonus ideas, is off-topic, or the student says they don't know.",
    "unclear": "Transcript is empty, unintelligible, or so fragmentary it points to an audio or transcription failure. The app asks for a re-record. Never use unclear for an intentional 'I don't know'."
  },
  "terms": [
    {
      "id": "camouflage",
      "question": "What is camouflage?",
      "expected_difficulty": "unaided",
      "reference_answer": "An animal's colours, patterns or shape help it blend into its surroundings, so predators or prey have a hard time seeing it.",
      "sample_partial": "It's when an animal blends in.",
      "ideas": [
        {
          "id": "C1",
          "type": "key",
          "label": "Blends in",
          "description": "Colour, pattern, shape or texture matches the surroundings so the animal is hard to see.",
          "accept_examples": ["blends in", "matches its background", "looks like a leaf or a stick", "same colour as where it lives", "hard to spot"]
        },
        {
          "id": "C2",
          "type": "key",
          "label": "Purpose",
          "description": "To hide from predators, sneak up on prey, or avoid being eaten.",
          "accept_examples": ["so it doesn't get eaten", "to hide from predators", "to catch prey", "to stay safe", "to survive"]
        }
      ],
      "pass_rule": { "all_of": ["C1", "C2"] },
      "contradictions": ["Describing bright warning colours or showing off as camouflage."],
      "neutral": ["Military or clothing camouflage mentioned as a comparison."],
      "hint_order": ["C2", "C1"],
      "hints": {
        "C1": ["How does the animal actually stay hidden?", "Think about its colours and patterns."],
        "C2": ["Why would an animal want to be hard to see?", "Think about who might be hunting it, or what it's hunting."]
      }
    },
    {
      "id": "mammal",
      "question": "What is a mammal?",
      "expected_difficulty": "hint",
      "reference_answer": "A warm-blooded animal whose mothers feed their babies milk. Most mammals also have hair or fur.",
      "sample_partial": "A warm-blooded animal with fur.",
      "ideas": [
        {
          "id": "M1",
          "type": "key",
          "label": "Milk",
          "description": "Mothers feed their young milk.",
          "accept_examples": ["babies drink milk", "mothers nurse their babies", "they breastfeed", "feed their young milk"]
        },
        {
          "id": "M2",
          "type": "key",
          "label": "Warm-blooded",
          "description": "Keeps a steady, warm body temperature on its own.",
          "accept_examples": ["warm-blooded", "keeps its body warm", "makes its own body heat", "body stays the same temperature"]
        },
        {
          "id": "M3",
          "type": "bonus",
          "label": "Hair or fur",
          "description": "Has hair or fur at some point in life.",
          "accept_examples": ["has fur", "has hair", "furry"]
        }
      ],
      "pass_rule": { "all_of": ["M1", "M2"] },
      "contradictions": ["Calling mammals cold-blooded."],
      "neutral": ["Live birth", "Having a backbone", "Breathing air", "Examples such as dogs, whales or humans"],
      "hint_order": ["M1", "M2"],
      "hints": {
        "M1": ["Think about what mammal babies eat right after they're born.", "Where does that food come from?"],
        "M2": ["What else do mammals have in common? Think about their bodies.", "Think about their body temperature."]
      }
    },
    {
      "id": "hibernation",
      "question": "What is hibernation?",
      "expected_difficulty": "hint, hardest of the three",
      "reference_answer": "A deep, sleep-like state some animals go into for the winter. Their heart rate, breathing and body temperature drop, which saves energy when food is hard to find.",
      "sample_partial": "When animals sleep all winter.",
      "ideas": [
        {
          "id": "H1",
          "type": "key",
          "label": "The state",
          "description": "A long, sleep-like, inactive state through winter or the cold months.",
          "accept_examples": ["sleep all winter", "a long winter sleep", "go dormant", "stay inactive when it's cold"]
        },
        {
          "id": "H2",
          "type": "key",
          "label": "Body slows down",
          "description": "Heart rate, breathing, body temperature or metabolism drop.",
          "accept_examples": ["heart beats slower", "breathing slows", "body gets colder", "metabolism slows", "body slows down"]
        },
        {
          "id": "H3",
          "type": "key",
          "label": "Purpose",
          "description": "To save energy or survive when food is scarce.",
          "accept_examples": ["to save energy", "because there's no food in winter", "to survive the winter", "they eat a lot first to get through winter"]
        }
      ],
      "pass_rule": { "all_of": ["H1"], "any_of": ["H2", "H3"] },
      "contradictions": ["Describing migration, such as flying south, as hibernation."],
      "neutral": ["Bears as an example", "Where animals hibernate, such as dens or burrows"],
      "hint_order": ["H3", "H2", "H1"],
      "hints": {
        "H1": ["What does the animal seem to be doing all winter?", "Think about how a bear spends the coldest months."],
        "H2": ["What happens inside the animal's body while it hibernates?", "Think about its heartbeat and temperature."],
        "H3": ["Why can't these animals just stay active in winter?", "Think about what's hard to find when everything is frozen."]
      }
    }
  ]
};

// System prompt for the judge
export const JUDGE_SYSTEM_PROMPT = `You judge spoken answers in a study app for students. A student was asked to explain a term out loud. Their speech was turned into text, and you decide whether their explanation covers the ideas in the rubric.

You judge. You do not teach, encourage or write feedback. The app handles all words the student sees.

How to judge:

1. Read the rubric for this term. Each idea has an id, a type (key or bonus), a description and example phrasings.
2. Read the transcript. If input_mode is "voice", it came from speech-to-text and may contain mishearings. Read a word as intended when it is plausibly a mishearing of the right word. If input_mode is "typed", take the words as written.
3. Decide which ideas are present. An idea is present when its meaning is there, in any wording. The example phrasings are a guide, not a complete list. Judge the student's final version and ignore filler words, false starts and self-corrections.
An idea counts when it is stated, even briefly or casually. It does not need to be explained or developed.
4. Examples count only if they show the idea. Naming an animal is not the same as explaining the idea.
5. Check for contradictions listed in the rubric, or any clear statement that contradicts a key idea.
6. Ignore neutral statements. True details that are not ideas in the rubric neither help nor hurt.
7. Apply the verdict rules below, in order.

Verdict rules:

- unclear: the transcript is empty, unintelligible, or so fragmentary it suggests the recording or transcription failed. Never use unclear when the student says they don't know. That is a miss.
- pass: the rubric's pass_rule is met and there is no contradiction. For pass_rule, "all_of" means every listed idea must be present, and "any_of" means at least one listed idea must be present. When both appear, both conditions must hold.
- partial: at least one idea (key or bonus) is present but pass_rule is not met, or pass_rule is met but there is a contradiction.
- miss: no ideas are present, the answer is off-topic, or the student says they don't know.

When the wording is ambiguous and you are deciding whether an idea is present, choose the reading that gives the higher verdict. This never overrides pass_rule. A required idea that is absent is absent.

Choosing hint_target: on partial or miss, walk through the term's hint_order and return the first idea id that is not present. On pass or unclear, return null. Never target a bonus idea.

Respond with only a JSON object, no preamble, no markdown fences:

{
  "verdict": "pass" | "partial" | "miss" | "unclear",
  "ideas_hit": [key idea ids present],
  "ideas_missing": [key idea ids not present],
  "bonus_hit": [bonus idea ids present],
  "contradiction": "short description" | null,
  "hint_target": "idea id" | null,
  "reason": "one sentence explaining the verdict"
}`;

// User message template for the judge
export const JUDGE_USER_TEMPLATE = `<rubric>
{{term_rubric_json}}
</rubric>

<input_mode>{{voice_or_typed}}</input_mode>

<transcript>
{{transcript}}
</transcript>`;

// Rubric data
export { rubric };
