import { redirect } from 'next/navigation';

// /marketplace/sent was the v1 "sent bids" view. The v2 claim model has no
// bids — see /marketplace/claimed.
export default function SentBidsRedirect() {
  redirect('/marketplace/claimed');
}
