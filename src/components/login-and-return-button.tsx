import { Button } from "~/components/ui/button";

export function LoginAndReturnButton({
  children,
}: {
  children: React.ReactNode;
}) {
  // const pathname = usePathname();

  return (
    <Button asChild>
      <Link href={`/auth/login?redirect=${pathname}`}>{children}</Link>
    </Button>
  );
}
