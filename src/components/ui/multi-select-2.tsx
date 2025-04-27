import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

export function MultiSelect2<T extends string>({
  buttonLabel,
  onOptionCheckedChange,
  options,
  selections,
}: {
  buttonLabel: string;
  onOptionCheckedChange: (option: T, checked: boolean) => void;
  options: readonly T[];
  selections: T[];
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="lg" variant="outline">
          {buttonLabel}

          {selections.length > 0 && (
            <Badge variant="secondary">
              {selections.length}/{options.length}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        {options.map((option) => (
          <DropdownMenuCheckboxItem
            checked={selections.includes(option)}
            key={option}
            onCheckedChange={(checked) => {
              onOptionCheckedChange(option, checked);
            }}
            onSelect={(event) => event.preventDefault()}
          >
            {option}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
