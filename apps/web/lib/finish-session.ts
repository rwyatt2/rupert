type DecorateUrl = (url: string) => string;

type RouterLike = { push: (url: string) => void };

function goHome(router: RouterLike, decorateUrl: DecorateUrl) {
  const url = decorateUrl("/");
  if (url.startsWith("http")) {
    window.location.href = url;
    return;
  }
  router.push(url);
}

export async function finishSession(
  finalize: (params: {
    navigate: (args: { session?: { currentTask?: unknown } | null; decorateUrl: DecorateUrl }) => void | Promise<void>;
  }) => Promise<{ error: { message?: string; longMessage?: string } | null }>,
  router: RouterLike,
): Promise<string | null> {
  const { error } = await finalize({
    navigate: ({ session, decorateUrl }) => {
      if (session?.currentTask) return;
      goHome(router, decorateUrl);
    },
  });
  return error?.longMessage || error?.message || null;
}
