import { Card, CardContent } from '@spinvisa/ui';

export default function SettingsBillingPage() {
  return (
    <div className="p-6">
      <Card>
        <CardContent className="p-6 text-sm text-muted-foreground">
          Subscription tier, seats, AI token budget, and invoices.
        </CardContent>
      </Card>
    </div>
  );
}
