import { redirect } from 'next/navigation';

// /portal/bids/[bidId] was the v1 bid-detail view. There is no per-bid view
// in the v2 claim model — see /portal/firm for the chosen firm.
export default function PortalBidDetailRedirect() {
  redirect('/portal/firm');
}
