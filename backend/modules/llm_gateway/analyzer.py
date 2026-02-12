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

    # Build appropriate prompt
    if is_first_submission:
        print(f"[ANALYZER] Generating first-time analysis for work {work_id}")
        prompt = prompts.build_first_time_prompt(current_text, essay_prompt)
    else:
        print(f"[ANALYZER] Generating iterative analysis for work {work_id}, version {current_version}")

        if not previous_analysis:
            raise BusinessError(
                "validation_failed",
                "previous_analysis required for iterative submission"
            )

        previous_fao = previous_analysis.get("fao_comment", "")
        previous_sentence_comments = previous_analysis.get("sentence_comments", [])

        prompt = prompts.build_iterative_prompt(
            current_text=current_text,
            previous_text=previous_text,
            previous_fao=previous_fao,
            previous_sentence_comments=previous_sentence_comments,
            user_actions=user_actions or {},
            user_reflection=user_reflection,
            essay_prompt=essay_prompt,
        )

    # Call LLM API with JSON mode
    try:
        llm_response = client.generate_structured_response(prompt)
    except Exception as e:
        print(f"[ANALYZER ERROR] LLM API call failed: {e}")
        raise BusinessError("llm_failed", f"Failed to generate analysis: {str(e)}") from e

    # Parse and validate response
    try:
        analysis = _parse_and_validate_response(llm_response, is_first_submission, user_reflection)
    except Exception as e:
        print(f"[ANALYZER ERROR] Response parsing failed: {e}")
        print(f"[ANALYZER ERROR] Raw response: {llm_response[:500]}")
        raise BusinessError("llm_failed", f"Invalid LLM response format: {str(e)}") from e

    print(f"[ANALYZER] Analysis generated successfully: {len(analysis.get('sentence_comments', []))} comments")
    return analysis


def _parse_and_validate_response(
    response: str,
    is_first_submission: bool,
    user_reflection_provided: bool,
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

    # Build result
    result = {
        "fao_comment": data["fao_comment"],
        "sentence_comments": data["sentence_comments"],
    }

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
