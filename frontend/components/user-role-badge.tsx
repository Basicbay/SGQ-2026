import { Calculator, Shield, UserCheck, UserCog } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type UserRoleBadgeProps = {
  role: string;
};

export function UserRoleBadge({ role }: UserRoleBadgeProps) {
  switch (role) {
    case "SUPER_ADMIN":
      return <Badge variant="outline" className="border-purple-500/30 bg-purple-500/10 text-purple-600 dark:border-purple-500/30 dark:bg-purple-500/15 dark:text-purple-400 gap-1 font-medium text-xs whitespace-nowrap"><Shield className="size-3" />Super Admin</Badge>;
    case "ADMIN":
      return <Badge variant="outline" className="border-blue-500/30 bg-blue-500/10 text-blue-600 dark:border-blue-500/30 dark:bg-blue-500/15 dark:text-blue-400 gap-1 font-medium text-xs whitespace-nowrap"><UserCog className="size-3" />Admin</Badge>;
    case "SALES":
      return <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-400 gap-1 font-medium text-xs whitespace-nowrap"><UserCheck className="size-3" />Sales</Badge>;
    case "ESTIMATOR":
      return <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-600 dark:border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-400 gap-1 font-medium text-xs whitespace-nowrap"><Calculator className="size-3" />Estimator</Badge>;
    default:
      return <Badge variant="outline" className="border-border bg-muted/60 text-muted-foreground font-medium text-xs whitespace-nowrap">{role}</Badge>;
  }
}
