export async function establishServerSession(): Promise<void> {
  const response = await fetch('/api/auth/session', {
    method: 'POST',
    credentials: 'same-origin',
  });
  if (!response.ok) {
    throw new Error('Could not establish session');
  }
}

export async function clearServerSession(): Promise<void> {
  await fetch('/api/auth/session', {
    method: 'DELETE',
    credentials: 'same-origin',
  }).catch(() => {});
}
