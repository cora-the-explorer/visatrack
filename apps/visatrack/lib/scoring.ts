import {
  USCIS_O1_CRITERIA,
  type GapSummary,
  type NormalizedScan,
  type ScrapedPost,
  type ScrapedProfile,
  type UscisCriterion,
} from '@/db/schema';

// Heuristic keyword buckets for caption-based USCIS criterion classification.
// MVP-only — replace with an LLM classifier in v2.
const KEYWORDS: Record<UscisCriterion, RegExp> = {
  awards: /\b(award|winner|won|champion|nominee|nominat|grammy|prize|medal|honored|finalist|trophy)\b/i,
  published_material:
    /\b(featured in|featured|interview|press|profile|article|cover story|magazine|forbes|billboard|pitchfork|nyt|new york times|wired|rolling stone|complex|dazed|mixmag|resident advisor)\b/i,
  judging:
    /\b(judge|judging|panel|jury|critique|mentor|coached|coaching|reviewer|adjudicator)\b/i,
  original_contributions:
    /\b(original|innovative|pioneer|first ever|debut|premiere|launched|released|created|produced|invented|breakthrough)\b/i,
  scholarly_articles:
    /\b(published in|journal|paper|research|whitepaper|peer[- ]reviewed|case study|essay)\b/i,
  leading_role:
    /\b(headlin|^lead|main stage|residency|resident dj|tour|tourdates|festival|opening for|supporting)\b/i,
  high_remuneration:
    /\b(\$[0-9]+k|six[- ]figure|seven[- ]figure|paid partnership|brand deal|sponsored by|ambassador|salary|earnings|grossed|partnership)\b/i,
  commercial_success:
    /\b(streams|million views|million plays|chart|charted|certified|gold|platinum|sold out|top [0-9]+|trending|viral|#1|number one)\b/i,
};

/**
 * Score = clamp_100( log10(max(1, follower_count)) * 15 + log10(max(1, avg_engagement)) * 10 ),
 * with a +4 bonus per USCIS criterion satisfied (max +32).
 */
export function scoreEvidence(profile: ScrapedProfile) {
  const posts: ScrapedPost[] = profile.posts ?? [];
  const likes = posts.map((p) => p.like_count);
  const comments = posts.map((p) => p.comment_count);
  const sumLikes = likes.reduce((a, b) => a + b, 0);
  const sumComments = comments.reduce((a, b) => a + b, 0);
  const n = Math.max(posts.length, 1);
  const avgLikes = Math.round(sumLikes / n);
  const avgComments = Math.round(sumComments / n);
  const avgEngagement = avgLikes + avgComments;

  const criteriaHits: Partial<Record<UscisCriterion, number>> = {};
  const evidence: Partial<Record<UscisCriterion, string[]>> = {};

  // Bio is also a useful signal.
  const haystack: { text: string; permalink?: string }[] = [];
  if (profile.bio) haystack.push({ text: profile.bio });
  for (const p of posts) {
    if (p.caption) {
      haystack.push({
        text: p.caption,
        permalink: p.shortcode ? `https://www.instagram.com/p/${p.shortcode}/` : undefined,
      });
    }
  }

  for (const item of haystack) {
    for (const c of USCIS_O1_CRITERIA) {
      if (KEYWORDS[c].test(item.text)) {
        criteriaHits[c] = (criteriaHits[c] ?? 0) + 1;
        if (item.permalink) {
          evidence[c] = evidence[c] ?? [];
          if (evidence[c]!.length < 5) evidence[c]!.push(item.permalink);
        }
      }
    }
  }

  // Commercial success also satisfied by raw engagement floor (high virality without keywords).
  if (avgEngagement >= 10000 && (criteriaHits.commercial_success ?? 0) === 0) {
    criteriaHits.commercial_success = 1;
  }

  // High remuneration: 100K+ followers + brand-deal-ish keyword threshold relax.
  // (No-op here; kept as a hook for v2.)

  const met: UscisCriterion[] = [];
  const gaps: UscisCriterion[] = [];
  for (const c of USCIS_O1_CRITERIA) {
    if ((criteriaHits[c] ?? 0) >= 1) met.push(c);
    else gaps.push(c);
  }

  const baseScore =
    Math.log10(Math.max(profile.follower_count, 1)) * 15 +
    Math.log10(Math.max(avgEngagement, 1)) * 10;
  const criterionBonus = met.length * 4; // up to +32
  const evidenceScore = Math.min(100, Math.round(baseScore + criterionBonus));

  const topCaptions = posts
    .filter((p) => p.caption.length > 0)
    .sort((a, b) => b.like_count - a.like_count)
    .slice(0, 5)
    .map((p) => p.caption);

  const normalized: NormalizedScan = {
    followerCount: profile.follower_count,
    postCount: profile.post_count,
    scrapedPostCount: posts.length,
    avgLikes,
    avgComments,
    avgEngagement,
    topCaptions,
    criteriaHits,
  };

  const gap: GapSummary = {
    met,
    gaps,
    evidence,
    notes:
      met.length >= 3
        ? `You hit ${met.length} of 8 USCIS criteria from Instagram alone. O-1 requires 3 — you're in striking range.`
        : `You hit ${met.length} of 8. USCIS wants 3+ — let's find the rest in TikTok / press / brand deals.`,
  };

  return { evidenceScore, normalized, gap };
}
