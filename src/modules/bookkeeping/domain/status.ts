import { DocumentStatus } from './types';

const transitions: Record<DocumentStatus, DocumentStatus[]> = {
  draft: ['in_review'],
  in_review: ['draft', 'confirmed'],
  confirmed: ['in_review'],
};

export function canTransition(from: DocumentStatus, to: DocumentStatus) {
  return transitions[from]?.includes(to) ?? false;
}
