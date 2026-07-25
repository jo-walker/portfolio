export function shouldBoot(opts: {
  search: string;
  reducedMotion: boolean;
  alreadyBooted: boolean;
}): boolean {
  const params = new URLSearchParams(opts.search);
  if (params.get('noboot') === '1') return false;
  if (opts.reducedMotion) return false;
  if (opts.alreadyBooted) return false;
  return true;
}

export function shouldAutoWelcome(opts: { search: string; welcomed: boolean }): boolean {
  const params = new URLSearchParams(opts.search);
  if (params.get('nowelcome') === '1') return false;
  return !opts.welcomed;
}
