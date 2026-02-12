import { describe, expect, it } from 'vitest';
import { toApiSuggestionActions } from '../workContractAdapters';

describe('toApiSuggestionActions', () => {
  it('maps userNote to user_note and trims whitespace', () => {
    const result = toApiSuggestionActions({
      comment_1: {
        action: 'resolved',
        userNote: '  fixed with shorter sentence  '
      },
      comment_2: {
        action: 'rejected'
      }
    });

    expect(result).toEqual({
      comment_1: {
        action: 'resolved',
        user_note: 'fixed with shorter sentence'
      },
      comment_2: {
        action: 'rejected'
      }
    });
  });
});
