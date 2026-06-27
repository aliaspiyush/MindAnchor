import { createClient } from "@/lib/supabase/server";
import { EntryForm } from "@/components/journal/EntryForm";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import { timeAgo } from "@/lib/utils";
import { PenLine } from "lucide-react";

export default async function JournalPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // Fetch recent entries
  const { data: recentEntries } = await supabase
    .from("journal_entries")
    .select("id, entry_text, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 md:py-12 space-y-12">
      <section className="space-y-6">
        <div className="space-y-2">
          <h1 className="font-serif text-4xl">Daily Reflection</h1>
          <p className="text-text-muted text-lg">Write freely. No judgment. MindAnchor is listening.</p>
        </div>
        
        <EntryForm userId={user.id} />
      </section>

      {recentEntries && recentEntries.length > 0 && (
        <section className="space-y-6">
          <h3 className="font-serif text-2xl flex items-center gap-2 border-b border-border pb-4">
            <PenLine size={24} className="text-primary" />
            Recent Entries
          </h3>
          <div className="grid gap-4">
            {recentEntries.map((entry) => (
              <Link key={entry.id} href={`/journal/${entry.id}`}>
                <Card className="hover:border-primary/50 transition-colors group cursor-pointer">
                  <CardContent className="p-4 flex flex-col gap-2">
                    <p className="text-sm text-text-muted">{timeAgo(entry.created_at)}</p>
                    <p className="text-text-primary line-clamp-2">
                      {entry.entry_text}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
