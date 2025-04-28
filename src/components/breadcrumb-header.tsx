import { Link } from "@tanstack/react-router";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import { Separator } from "~/components/ui/separator";
import { SidebarTrigger } from "~/components/ui/sidebar";

export function BreadcrumbHeader({ children }: { children?: React.ReactNode }) {
  return null;
  return (
    <header className="bg-background sticky top-0 flex h-14 shrink-0 items-center gap-2 border-b">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator className="mr-2 h-4" orientation="vertical" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink asChild>
                <Link href="/">~</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {children && (
              <>
                <BreadcrumbSeparator />
                {children}
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
  );
}
