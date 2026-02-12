"""
LLM prompt templates for essay evaluation.

Contains prompts for first-time submission and iterative submission.
"""

import json
from typing import Any, Dict, List, Optional


def build_first_time_prompt(essay_text: str, essay_prompt: Optional[str] = None) -> str:
    """
    Build prompt for first-time essay submission.

    Args:
        essay_text: The essay content to evaluate
        essay_prompt: Optional essay prompt/requirements provided by user

    Returns a prompt that asks for:
    - Sentence-level comments (max 10)
    - Overall FAO comment
    """
    # Add essay prompt section if provided
    prompt_section = ""
    if essay_prompt and essay_prompt.strip():
        prompt_section = f"""
ESSAY PROMPT/REQUIREMENTS:
{essay_prompt.strip()}

The student must address these requirements in their essay. Evaluate whether they successfully respond to the prompt and fulfill all requirements.

"""

    prompt = f"""You are a strict but fair college admissions officer evaluating college application essays. Students respect and fear you because of your exceptionally high standards, but they don't hate you because you are absolutely objective and consistent. When students truly excel, you give restrained but clear praise. You never sugarcoat feedback - you tell students exactly what needs improvement.

Your task is to evaluate the following essay with brutal honesty and precision.

{prompt_section}ESSAY TEXT:
{essay_text}

EVALUATION REQUIREMENTS:

1. SENTENCE-LEVEL COMMENTS (Maximum 10 most critical issues):
   - Identify specific problems in the text (grammar, clarity, style, tone, logic, conciseness)
   - For each issue, provide:
     * Exact text location (start_index and end_index - character positions in the original text)
     * Issue type: "grammar", "clarity", "style", "tone", "logic", or "conciseness"
     * Severity: "high" (critical flaw), "medium" (notable weakness), or "low" (minor improvement)
     * Clear title summarizing the problem
     * Detailed description of what's wrong
     * Actionable suggestion for improvement (NOT a rewrite - guide them to fix it themselves)
   - Focus on the most impactful issues first
   - Each comment must have a unique UUID

2. OVERALL FAO COMMENT:
   - Assess the essay's overall structure, logic, and thematic development
   - Point out main strengths (if any exist - be honest)
   - Identify critical weaknesses that must be addressed
   - Keep it focused and direct - no fluff

RESPONSE FORMAT (JSON only, no markdown):
{{
  "sentence_comments": [
    {{
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "original_text": "the exact problematic text",
      "start_index": 45,
      "end_index": 67,
      "issue_type": "clarity",
      "severity": "medium",
      "title": "Unclear pronoun reference",
      "description": "The pronoun 'it' is ambiguous here. Readers cannot determine what 'it' refers to without re-reading the previous paragraph.",
      "suggestion": "Replace the pronoun with the specific noun it represents, or restructure the sentence to make the reference clear."
    }}
  ],
  "fao_comment": "Your overall assessment here. Be specific about structural issues, logical flow, and thematic coherence. If it's weak, say so clearly. If it's strong, acknowledge it."
}}

IMPORTANT:
- Return ONLY valid JSON, no additional text or markdown formatting
- Be brutally honest but constructive
- Focus on substance over style (though both matter)
- Character indices must be exact positions in the original text
- Generate unique UUIDs for each sentence comment"""

    return prompt


def build_iterative_prompt(
    current_text: str,
    previous_text: str,
    previous_fao: str,
    previous_sentence_comments: List[Dict[str, Any]],
    user_actions: Dict[str, Dict[str, Any]],
    user_reflection: Optional[str],
    essay_prompt: Optional[str] = None,
) -> str:
    """
    Build prompt for iterative essay submission (2nd+ time).

    Args:
        essay_prompt: Optional essay prompt/requirements provided by user

    Evaluates improvements based on previous feedback and user actions.
    """
    # Format previous sentence comments
    prev_comments_text = "\n".join([
        f"- [{c.get('id')}] {c.get('title')}: {c.get('description')}"
        for c in previous_sentence_comments
    ])

    # Format user actions
    actions_text = ""
    for suggestion_id, action_data in user_actions.items():
        action = action_data.get("action", "")
        note = action_data.get("user_note", "")
        actions_text += f"\n- Suggestion {suggestion_id}: {action.upper()}"
        if note:
            actions_text += f" (Note: {note})"

    # Format user reflection
    reflection_text = user_reflection if user_reflection else "No reflection provided."

    # Add essay prompt section if provided
    prompt_section = ""
    if essay_prompt and essay_prompt.strip():
        prompt_section = f"""
ESSAY PROMPT/REQUIREMENTS:
{essay_prompt.strip()}

The student must address these requirements in their essay. Evaluate whether they successfully respond to the prompt and fulfill all requirements.

"""

    prompt = f"""You are a strict but fair college admissions officer evaluating college application essays. This student is submitting their essay for the SECOND (or later) time. You provided feedback before, and now you must evaluate their improvements.

{prompt_section}PREVIOUS VERSION:
{previous_text}

YOUR PREVIOUS FEEDBACK:
Overall Assessment: {previous_fao}

Specific Issues Raised:
{prev_comments_text}

STUDENT'S REFLECTION ON YOUR FEEDBACK:
{reflection_text}

STUDENT'S ACTIONS ON YOUR SUGGESTIONS:
{actions_text}

CURRENT VERSION (REVISED):
{current_text}

YOUR TASK:

1. EVALUATE IMPROVEMENTS:
   For each suggestion the student marked as "resolved":
   - Did they actually address it? Or just claim they did?
   - Rate the improvement: "excellent" (fully solved), "partial" (some progress), "unsolved" (no real change), or "new_issue" (made it worse)
   - Provide specific feedback on their improvement attempt

2. IDENTIFY NEW ISSUES:
   - Find problems in the current version (same format as before)
   - Maximum 10 most critical issues

3. NEW OVERALL FAO COMMENT:
   - Acknowledge what improved (if anything)
   - Point out what still needs work
   - Be honest about regression if it occurred
   - Keep it direct and actionable

4. EVALUATE THEIR REFLECTION (if provided):
   - Was their thinking correct? Did they understand the feedback?
   - Did they actually follow through on their stated plan?
   - Any blind spots they're missing?

RESPONSE FORMAT (JSON only, no markdown):
{{
  "sentence_comments": [
    {{
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "original_text": "problematic text from CURRENT version",
      "start_index": 45,
      "end_index": 67,
      "issue_type": "clarity",
      "severity": "medium",
      "title": "Issue title",
      "description": "What's wrong now",
      "suggestion": "How to fix it",
      "improvement_feedback": "ONLY if this relates to a previous suggestion they tried to fix - rate their improvement: 'Excellent improvement! The meaning is now crystal clear.' OR 'Partial improvement - you addressed X but missed Y.' OR 'No real improvement - the core issue remains.' OR 'This made it worse - revert to the previous approach.'"
    }}
  ],
  "fao_comment": "Your new overall assessment. Compare to previous version. Be specific about what improved and what didn't.",
  "reflection_comment": "ONLY if student provided reflection - Evaluate their thinking: 'Your approach to shorten the example was correct, and you executed it well.' OR 'You identified the right issue but your solution missed the mark because...' OR 'You completely misunderstood the feedback - the problem was not about length but about clarity.'"
}}

CRITICAL NOTES:
- Return ONLY valid JSON, no markdown formatting
- Only include "improvement_feedback" for comments that relate to previous suggestions
- Only include "reflection_comment" if the student provided a reflection
- Be brutally honest about whether they actually improved
- If they made things worse, say so directly
- Character indices must match the CURRENT version text"""

    return prompt


def format_sentence_comments_for_llm(comments: List[Dict[str, Any]]) -> str:
    """Format sentence comments for inclusion in prompts."""
    if not comments:
        return "No previous sentence-level comments."

    formatted = []
    for c in comments:
        formatted.append(
            f"[{c.get('id')}] {c.get('title')} ({c.get('severity')} severity)\n"
            f"  Issue: {c.get('description')}\n"
            f"  Suggestion: {c.get('suggestion')}"
        )

    return "\n\n".join(formatted)


def format_user_actions_for_llm(actions: Dict[str, Dict[str, Any]]) -> str:
    """Format user actions for inclusion in prompts."""
    if not actions:
        return "Student has not marked any suggestions."

    formatted = []
    for suggestion_id, action_data in actions.items():
        action = action_data.get("action", "unknown")
        note = action_data.get("user_note", "")

        action_text = f"Suggestion {suggestion_id}: {action.upper()}"
        if note:
            action_text += f"\n  Student's note: {note}"

        formatted.append(action_text)

    return "\n".join(formatted)
