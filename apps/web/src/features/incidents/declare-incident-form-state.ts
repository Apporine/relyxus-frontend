import type { IncidentVisibility, SeverityLevel } from '@relyxus/ui';

export type DeclareIncidentFormState = {
  incidentTypeId: string;
  title: string;
  businessServiceIds: string[];
  technicalComponent: string;
  severity: SeverityLevel | '';
  moneyAmountMajor: string;
  failedTransactions: string;
  affectedCustomers: string;
  visibility: IncidentVisibility | '';
  context: string;
};

export const emptyDeclareIncidentFormState: DeclareIncidentFormState = {
  incidentTypeId: '',
  title: '',
  businessServiceIds: [],
  technicalComponent: '',
  severity: '',
  moneyAmountMajor: '',
  failedTransactions: '',
  affectedCustomers: '',
  visibility: 'workspace',
  context: '',
};

export const declarationStepIds = [
  'incident-type',
  'title',
  'services',
  'severity',
  'impact',
  'visibility',
  'context',
] as const;
export type DeclarationStepId = (typeof declarationStepIds)[number];

export type DeclarationStepStatus = 'complete' | 'current' | 'next' | 'optional';

export function declarationStepStatuses(
  formState: DeclareIncidentFormState,
): Record<DeclarationStepId, DeclarationStepStatus> {
  const typeComplete = formState.incidentTypeId !== '';
  const titleComplete = formState.title.trim() !== '';
  const servicesComplete = formState.businessServiceIds.length > 0;
  const severityComplete = formState.severity !== '';
  const visibilityComplete = formState.visibility !== '';

  const requiredComplete = [
    typeComplete,
    titleComplete,
    servicesComplete,
    severityComplete,
    visibilityComplete,
  ];

  const firstIncompleteIndex = requiredComplete.findIndex((isComplete) => !isComplete);
  const currentIndex =
    firstIncompleteIndex === -1 ? declarationStepIds.indexOf('impact') : firstIncompleteIndex;

  function statusFor(stepIndex: number, isComplete: boolean): DeclarationStepStatus {
    if (declarationStepIds[stepIndex] === 'context') {
      return 'optional';
    }
    if (declarationStepIds[stepIndex] === 'impact') {
      return stepIndex === currentIndex ? 'current' : isComplete ? 'complete' : 'next';
    }
    if (isComplete) {
      return 'complete';
    }
    if (stepIndex === currentIndex) {
      return 'current';
    }
    return 'next';
  }

  const impactComplete =
    formState.moneyAmountMajor.trim() !== '' ||
    formState.failedTransactions.trim() !== '' ||
    formState.affectedCustomers.trim() !== '';

  return {
    'incident-type': statusFor(0, typeComplete),
    title: statusFor(1, titleComplete),
    services: statusFor(2, servicesComplete),
    severity: statusFor(3, severityComplete),
    impact: statusFor(4, impactComplete),
    visibility: statusFor(5, visibilityComplete),
    context: 'optional',
  };
}

export function isDeclareIncidentFormValid(formState: DeclareIncidentFormState): boolean {
  return (
    formState.incidentTypeId !== '' &&
    formState.title.trim() !== '' &&
    formState.businessServiceIds.length > 0 &&
    formState.severity !== '' &&
    formState.visibility !== ''
  );
}
