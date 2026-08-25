interface MessageLike {
  message?: string;
  longMessage?: string;
}

export function clerkErrorText(error: MessageLike | null | undefined): string | null {
  if (!error) return null;
  return error.longMessage || error.message || null;
}

export function firstHookError(errors: {
  fields: object;
  global: MessageLike[] | null;
}): string | null {
  for (const field of Object.values(errors.fields as Record<string, MessageLike | null | undefined>)) {
    const text = clerkErrorText(field);
    if (text) return text;
  }
  return clerkErrorText(errors.global?.[0]);
}
