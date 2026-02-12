"""
Utility functions for work management.
"""

import re


def count_words(text: str) -> int:
    """
    Count words in text (supports both English and Chinese).

    For English text: counts words separated by whitespace
    For Chinese text: counts characters (excluding whitespace and punctuation)
    For mixed text: combines both methods

    Args:
        text: The text to count

    Returns:
        Total word/character count

    Examples:
        >>> count_words("Hello world")
        2
        >>> count_words("你好世界")
        4
        >>> count_words("Hello 世界")
        3
    """
    if not text or not text.strip():
        return 0

    # Remove extra whitespace
    text = text.strip()

    # Count Chinese characters (CJK Unified Ideographs)
    chinese_chars = re.findall(r'[\u4e00-\u9fff]', text)
    chinese_count = len(chinese_chars)

    # Remove Chinese characters and count English words
    text_without_chinese = re.sub(r'[\u4e00-\u9fff]', '', text)
    english_words = text_without_chinese.split()
    english_count = len(english_words)

    # Total count
    total = chinese_count + english_count

    return total
