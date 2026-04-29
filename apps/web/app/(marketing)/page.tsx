import Link from 'next/link';
import { Button } from '@spinvisa/ui';

export default function MarketingHome() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-24">
      <div className="space-y-6">
        <h1 className="bg-gradient-to-r from-svw-pink to-svw-teal bg-clip-text text-6xl font-bold tracking-tight text-transparent">
          SpinVisa
        </h1>
        <p className="max-w-2xl text-xl text-muted-foreground">
          AI-native case management for immigration firms running O-1B and P-1B petitions
          for artists, entertainers, and athletes.
        </p>
        <div className="flex gap-4 pt-4">
          <Button asChild size="lg">
            <Link href="/login">Sign in</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/pipeline">Open console</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
