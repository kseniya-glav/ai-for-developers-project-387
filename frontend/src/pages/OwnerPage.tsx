import { useCallback } from "react";
import { useApi } from "@/hooks/useApi";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, User } from "lucide-react";

export function OwnerPage() {
  const { data: owner, loading, error } = useApi(
    useCallback(() => api.getOwner(), [])
  );

  if (loading) return <p className="text-muted-foreground">Загрузка…</p>;
  if (error) return <p className="text-destructive">{error}</p>;
  if (!owner) return null;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Профиль владельца</h1>
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {owner.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Mail className="h-4 w-4" />
            <a href={`mailto:${owner.email}`} className="hover:underline">
              {owner.email}
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
