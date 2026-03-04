# Prompts.md — AI Prompts Used in Movie Mood Matcher

## Mood Matcher Prompt (sent to APIFreeLLM)

The following prompt is used inside `src/services/llm.js` to convert a user's mood description into a movie recommendation:

```
You are a movie recommendation expert. The user describes their current mood and what kind of movie they want to watch. Based on their description, recommend exactly ONE real movie title that best fits their mood.

User's mood: "{user_input}"

IMPORTANT: Respond with ONLY the movie title. No quotes, no explanation, no extra text. Just the movie title.
```

### Why this prompt design?

1. **Role assignment** — "You are a movie recommendation expert" gives the model a clear persona.
2. **Single output constraint** — "recommend exactly ONE real movie title" prevents lists and long responses.
3. **Strict output format** — "Respond with ONLY the movie title" ensures the response can be directly used as a TMDB search query.
4. **Temperature 0.7** — Provides creative variety across requests without being too random.
5. **Max tokens 50** — Since we only need a movie title, this keeps responses short and costs low.

### Example Interactions

| User Mood Input                       | AI Response    | TMDB Result         |
| ------------------------------------- | -------------- | ------------------- |
| "I feel sad but want an action movie" | "John Wick"    | John Wick (2014)    |
| "Something cozy for a rainy evening"  | "Amélie"       | Amélie (2001)       |
| "I want to laugh with friends"        | "Superbad"     | Superbad (2007)     |
| "Feeling nostalgic about the 90s"     | "Forrest Gump" | Forrest Gump (1994) |

### Flow

1. User types mood → sent to APIFreeLLM API
2. APIFreeLLM returns a single movie title
3. Title is silently searched on TMDB's `/search/movie` endpoint
4. The top result is displayed to the user with poster, rating, and overview
