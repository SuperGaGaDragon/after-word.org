"""
AI-powered essay analysis generator.

Uses OpenAI API to generate structured feedback on essays.
"""

import json
from typing import Any, Dict, List, Optional

from backend.errors import BusinessError
from backend.modules.llm_gateway import client, prompts


def generate_analysis(
    work_id: str,
    current_text: str,
    current_version: int,
    previous_text: Optional[str] = None,
    previous_analysis: Optional[Dict[str, Any]] = None,
    user_actions: Optional[Dict[str, Dict[str, Any]]] = None,
    user_reflection: Optional[str] = None,
    essay_prompt: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Generate AI analysis for an essay submission.

    Args:
        work_id: Work ID (for logging)
        current_text: Current essay content
        current_version: Current version number
        previous_text: Previous version content (None for first submission)
        previous_analysis: Previous analysis result (None for first submission)
        user_actions: User's actions on previous suggestions (None for first submission)
        user_reflection: User's reflection on FAO comment (optional)
        essay_prompt: Essay prompt/requirements provided by user (optional)

    Returns:
        Dict with:
        - fao_comment: str
        - sentence_comments: List[Dict]
        - reflection_comment: Optional[str] (only if user_reflection provided)

    Raises:
        BusinessError: If LLM API fails or response is invalid
    """
    is_first_submission = previous_text is None

    # Get or generate rubric
    rubric = None

    if is_first_submission:
        print(f"[ANALYZER] Generating first-time analysis for work {work_id}")

        # STEP 1: Generate rubric using Claude (with fallback)
        try:
            rubric_prompt = prompts.build_rubric_generation_prompt(current_text, essay_prompt)
            rubric_json = client.generate_rubric(rubric_prompt)

            # Clean potential markdown wrapper from Claude response
            rubric_json = rubric_json.strip()
            if rubric_json.startswith("```"):
                # Extract JSON from markdown code block
                lines = rubric_json.split('\n')
                # Remove first line (```json or ```)
                lines = lines[1:]
                # Remove last line (```)
                if lines and lines[-1].strip() == "```":
                    lines = lines[:-1]
                rubric_json = '\n'.join(lines).strip()
                print(f"[ANALYZER] Extracted JSON from markdown wrapper")

            rubric = json.loads(rubric_json)
            print(f"[ANALYZER] Rubric generated successfully with {len(rubric.get('dimensions', []))} dimensions")
        except BusinessError as e:
            if "claude_timeout" in str(e):
                print(f"[ANALYZER] Claude timeout - falling back to analysis without rubric")
            else:
                print(f"[ANALYZER] Claude failed: {e} - falling back to analysis without rubric")
            rubric = None
        except json.JSONDecodeError as e:
            print(f"[ANALYZER] Failed to parse rubric JSON: {e}")
            print(f"[ANALYZER] Raw response (first 500 chars): {rubric_json[:500]}")
            print(f"[ANALYZER] Falling back to analysis without rubric")
            rubric = None
        except Exception as e:
            print(f"[ANALYZER] Unexpected error generating rubric: {e} - falling back to analysis without rubric")
            rubric = None

        # STEP 2: Build prompt for OpenAI (with or without rubric)
        prompt = prompts.build_first_time_prompt(current_text, essay_prompt, rubric)
    else:
        print(f"[ANALYZER] Generating iterative analysis for work {work_id}, version {current_version}")

        if not previous_analysis:
            raise BusinessError(
                "validation_failed",
                "previous_analysis required for iterative submission"
            )

        previous_fao = previous_analysis.get("fao_comment", "")
        previous_sentence_comments = previous_analysis.get("sentence_comments", [])

        # STEP 1: Load rubric from previous analysis (if exists)
        rubric = previous_analysis.get("rubric")
        if rubric:
            print(f"[ANALYZER] Using rubric from first submission")

        # STEP 2: Build iterative prompt with rubric
        prompt = prompts.build_iterative_prompt(
            current_text=current_text,
            previous_text=previous_text,
            previous_fao=previous_fao,
            previous_sentence_comments=previous_sentence_comments,
            user_actions=user_actions or {},
            user_reflection=user_reflection,
            essay_prompt=essay_prompt,
            rubric=rubric,
        )

    # Call LLM API with JSON mode
    try:
        llm_response = client.generate_structured_response(prompt)
    except Exception as e:
        print(f"[ANALYZER ERROR] LLM API call failed: {e}")
        raise BusinessError("llm_failed", f"Failed to generate analysis: {str(e)}") from e

    # Parse and validate response
    try:
        analysis = _parse_and_validate_response(llm_response, is_first_submission, user_reflection, bool(rubric))
    except Exception as e:
        print(f"[ANALYZER ERROR] Response parsing failed: {e}")
        print(f"[ANALYZER ERROR] Raw response: {llm_response[:500]}")
        raise BusinessError("llm_failed", f"Invalid LLM response format: {str(e)}") from e

    # Attach rubric to analysis (for first submission or from previous)
    if rubric:
        analysis["rubric"] = rubric
        print(f"[ANALYZER] Analysis includes rubric with {len(rubric.get('dimensions', []))} dimensions")

    print(f"[ANALYZER] Analysis generated successfully: {len(analysis.get('sentence_comments', []))} comments")
    return analysis


def _parse_and_validate_response(
    response: str,
    is_first_submission: bool,
    user_reflection_provided: bool,
    has_rubric: bool = False,
) -> Dict[str, Any]:
    """
    Parse LLM response and validate structure.

    Args:
        response: JSON string from LLM
        is_first_submission: Whether this is first submission
        user_reflection_provided: Whether user provided reflection

    Returns:
        Validated analysis dict

    Raises:
        ValueError: If response format is invalid
    """
    # Parse JSON
    try:
        data = json.loads(response)
    except json.JSONDecodeError as e:
        raise ValueError(f"Response is not valid JSON: {e}") from e

    # Validate required fields
    if "fao_comment" not in data:
        raise ValueError("Missing required field: fao_comment")

    if "sentence_comments" not in data:
        raise ValueError("Missing required field: sentence_comments")

    if not isinstance(data["sentence_comments"], list):
        raise ValueError("sentence_comments must be a list")

    # Validate sentence comments structure
    for idx, comment in enumerate(data["sentence_comments"]):
        _validate_sentence_comment(comment, idx, is_first_submission)

    # Validate rubric_evaluation if present
    if has_rubric and "rubric_evaluation" in data:
        if not isinstance(data["rubric_evaluation"], dict):
            raise ValueError("rubric_evaluation must be a dict")
        # Validate each dimension evaluation
        for dim_name, evaluation in data["rubric_evaluation"].items():
            if not isinstance(evaluation, dict):
                raise ValueError(f"Rubric dimension '{dim_name}' evaluation must be a dict")
            if "level" not in evaluation:
                raise ValueError(f"Rubric dimension '{dim_name}' missing 'level'")
            if "reasoning" not in evaluation:
                raise ValueError(f"Rubric dimension '{dim_name}' missing 'reasoning'")

    # Build result
    result = {
        "fao_comment": data["fao_comment"],
        "sentence_comments": data["sentence_comments"],
    }

    # Add rubric_evaluation if present
    if has_rubric and "rubric_evaluation" in data:
        result["rubric_evaluation"] = data["rubric_evaluation"]

    # Add reflection_comment if present (only for iterative + reflection provided)
    if not is_first_submission and user_reflection_provided:
        result["reflection_comment"] = data.get("reflection_comment")

    return result


def _validate_sentence_comment(
    comment: Dict[str, Any],
    index: int,
    is_first_submission: bool,
) -> None:
    """
    Validate a single sentence comment structure.

    Args:
        comment: Comment dict to validate
        index: Comment index (for error messages)
        is_first_submission: Whether this is first submission

    Raises:
        ValueError: If comment structure is invalid
    """
    required_fields = [
        "id",
        "original_text",
        "start_index",
        "end_index",
        "issue_type",
        "severity",
        "title",
        "description",
        "suggestion",
    ]

    for field in required_fields:
        if field not in comment:
            raise ValueError(f"Comment {index}: missing required field '{field}'")

    # Validate types
    if not isinstance(comment["start_index"], int):
        raise ValueError(f"Comment {index}: start_index must be integer")

    if not isinstance(comment["end_index"], int):
        raise ValueError(f"Comment {index}: end_index must be integer")

    # Validate enums
    valid_issue_types = ["grammar", "clarity", "style", "tone", "logic", "conciseness"]
    if comment["issue_type"] not in valid_issue_types:
        raise ValueError(
            f"Comment {index}: invalid issue_type '{comment['issue_type']}'. "
            f"Must be one of: {valid_issue_types}"
        )

    valid_severities = ["high", "medium", "low"]
    if comment["severity"] not in valid_severities:
        raise ValueError(
            f"Comment {index}: invalid severity '{comment['severity']}'. "
            f"Must be one of: {valid_severities}"
        )

    # For iterative submissions, improvement_feedback is optional
    # (only present if related to previous suggestion)
    # No validation needed - it's optional
