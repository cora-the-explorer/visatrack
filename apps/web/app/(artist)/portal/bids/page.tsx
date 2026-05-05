import { redirect } from 'next/navigation';

// /portal/bids was the v1 bid-list view. The v2 claim model has a single
// chosen firm — see /portal/firm.
export default function PortalBidsRedirect() {
  redirect('/portal/firm');
}
