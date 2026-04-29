import Link from 'next/link';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@spinvisa/ui';

export const metadata = { title: 'Sign in' };

export default function LoginPage() {
  return (
    <Card>
      <CardHeader className="space-y-2 text-center">
        <div className="bg-gradient-to-r from-svw-pink to-svw-teal bg-clip-text text-3xl font-bold text-transparent">
          SpinVisa
        </div>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>Use your firm SSO to continue.</CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild className="w-full">
          {/* WorkOS AuthKit handles the actual redirect once wired up. */}
          <Link href="/api/auth/login">Continue with WorkOS</Link>
        </Button>
      </CardContent>
      <CardFooter className="justify-center text-xs text-muted-foreground">
        By signing in you agree to the SpinVisa Terms.
      </CardFooter>
    </Card>
  );
}
