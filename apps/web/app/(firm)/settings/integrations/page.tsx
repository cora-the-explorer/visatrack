import { Card, CardContent } from '@visa-track/ui';

export default function SettingsIntegrationsPage() {
  return (
    <div className="p-6">
      <Card>
        <CardContent className="p-6 text-sm text-muted-foreground">
          Connect Clio, Box, DocuSign, and email/calendar providers.
        </CardContent>
      </Card>
    </div>
  );
}
