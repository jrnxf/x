import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { HeartIcon, MessageCircleIcon, PaperclipIcon } from "lucide-react";
import { useQueryState } from "nuqs";
import { startTransition, useDeferredValue, useMemo } from "react";

import { TimeAgo } from "~/components/time-ago";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { getMuxPoster } from "~/components/video-player";
import { WrappedBadges } from "~/components/wrapped-badges";
import { listPosts } from "~/server/fns/posts/list";

export const Route = createFileRoute("/posts/")({
  validateSearch: listPosts.schema,
  loaderDeps: ({ search }) => {
    return search;
  },
  loader: async ({ context, deps }) => {
    await context.queryClient.ensureInfiniteQueryData(
      listPosts.infiniteQueryOptions(deps),
    );
  },
  component: RouteComponent,
});

function RouteComponent() {
  const x = Route.useSearch();
  const [search, setSearch] = useQueryState("q", {
    defaultValue: "",
    throttleMs: 200,
  });

  const deferredSearch = useDeferredValue(search);

  const {
    data: postsPages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useSuspenseInfiniteQuery(
    listPosts.infiniteQueryOptions({
      limit: 25,
      search: deferredSearch,
    }),
  );

  const posts = useMemo(() => postsPages.pages.flat(), [postsPages]);

  return (
    <div
      className="mx-auto flex min-h-0 w-full max-w-4xl flex-col gap-4 p-4"
      id="main-content"
    >
      <div className="flex items-end justify-between gap-4">
        <Button asChild>
          <Link to="/posts/create">Create</Link>
        </Button>

        <Input
          className="max-w-[300px]"
          id="search"
          onChange={(evt) =>
            startTransition(() => {
              setSearch(evt.target.value);
            })
          }
          placeholder="Search posts"
          value={search}
        />
      </div>
      {posts.length === 0 && (
        <p className="text-muted-foreground mt-1">No posts</p>
      )}

      <div className="grid grid-cols-1 gap-4">
        {posts.map((post) => {
          const posterUrl =
            post.imageUrl ||
            (post.video?.playbackId && getMuxPoster(post.video.playbackId)) ||
            (post.youtubeVideoId &&
              `https://img.youtube.com/vi/${post.youtubeVideoId}/hqdefault.jpg`);

          return (
            <Link
              className="ring-offset-background focus-visible:ring-ring rounded-md focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden"
              key={post.id}
              params={{ postId: post.id }}
              to={`/posts/$postId`}
            >
              <div className="flex flex-col gap-4 rounded-md border bg-white p-3 sm:flex-row dark:bg-[#0a0a0a]">
                <div className="flex w-full flex-col gap-2">
                  <p className="truncate font-semibold">
                    {Boolean(posterUrl) && (
                      <PaperclipIcon className="text-muted-foreground mr-2 inline size-3" />
                    )}
                    {post.title}
                  </p>
                  <div className="line-clamp-3 text-sm">
                    <p>{post.content}</p>
                  </div>

                  <WrappedBadges content={post.tags} />

                  <div className="flex w-full justify-between gap-4">
                    <p className="text-muted-foreground inline-flex items-center gap-1.5 text-xs sm:text-sm">
                      <span>{post.user.name}</span>
                      <span>•</span>
                      <TimeAgo date={post.createdAt} />
                    </p>

                    <div className="text-muted-foreground flex items-center gap-2 text-xs">
                      <MessageCircleIcon className="size-3" />
                      {post.counts.messages}
                      <HeartIcon className="size-3" />
                      {post.counts.likes}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
      {hasNextPage && (
        <Button onClick={() => fetchNextPage()}>
          {isFetchingNextPage ? "Loading..." : "Load more"}
        </Button>
      )}
    </div>
  );
}
