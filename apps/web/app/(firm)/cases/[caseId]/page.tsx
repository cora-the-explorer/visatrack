import { Card, CardContent, CardHeader, CardTitle } from '@spinvisa/ui';

export default function CaseOverviewPage() {
  return (
    <div className="grid gap-4 p-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Beneficiary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm text-muted-foreground">
          <div>Legal name: NOVA Petrov</div>
          <div>Field: Music · electronic production</div>
          <div>Nationality: UKR</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Sponsor</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm text-muted-foreground">
          <div>Acme Tour Productions Inc.</div>
          <div>FEIN: 12-3456789</div>
          <div>Brooklyn, NY</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Criterion coverage</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Awards 2/3 · Press 5/3 · Original Contributions 1/3 · Leading Role 0/3
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Filing target</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          May 9 · 11 days remaining
        </CardContent>
      </Card>
    </div>
  );
}
