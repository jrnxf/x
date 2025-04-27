import {
  ChevronRight,
  LifeBuoyIcon,
  MedalIcon,
  MessageSquareMoreIcon,
  SendIcon,
  StickyNoteIcon,
  UsersIcon,
} from "lucide-react";
import Link from "next/link";

import { Button } from "~/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "~/components/ui/sidebar";

// Menu items.
const items = [
  {
    icon: UsersIcon,
    title: "Users",
    url: "/users",
  },
  {
    icon: StickyNoteIcon,
    title: "Posts",
    url: "/posts",
  },
  {
    icon: MessageSquareMoreIcon,
    title: "Chat",
    url: "/chat",
  },
  {
    icon: MedalIcon,
    items: [
      {
        title: "Active",
        url: "/games/rius/active",
      },
      {
        title: "Upcoming",
        url: "/games/rius/upcoming",
      },
      {
        title: "Previous",
        url: "/games/rius/previous",
      },
    ],
    title: "Games",
    url: "/games/rius/active",
  },
];

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="pb-0">
        <Button
          asChild
          className="w-full justify-start px-2 py-2 text-lg"
          size="fit"
          variant="ghost"
        >
          <Link href="/">
            <div className="grid size-7 place-items-center rounded-lg bg-gray-200 text-2xl leading-none dark:bg-black">
              ~
            </div>
            une.haus
          </Link>
        </Button>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          {/* <Link href="/">
            <SidebarGroupLabel>une.haus</SidebarGroupLabel>
          </Link> */}

          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <Collapsible
                  asChild
                  // defaultOpen={item.isActive}
                  key={item.title}
                >
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip={item.title}>
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                    {item.items?.length ? (
                      <>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuAction className="data-[state=open]:rotate-90">
                            <ChevronRight />
                            <span className="sr-only">Toggle</span>
                          </SidebarMenuAction>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.items?.map((subItem) => (
                              <SidebarMenuSubItem key={subItem.title}>
                                <SidebarMenuSubButton asChild>
                                  <Link href={subItem.url}>
                                    <span>{subItem.title}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </>
                    ) : null}
                  </SidebarMenuItem>
                </Collapsible>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild size="sm">
                  <a href="#support">
                    <LifeBuoyIcon />
                    <span>Support</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild size="sm">
                  <a href="#feedback">
                    <SendIcon />
                    <span>Feedback</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter></SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
