const FUNCTION_BASE_URL = "https://legacy-circle-ae3f9932.base44.app/functions";

export function getFunctionUrl(name) {
  return `${FUNCTION_BASE_URL}/${name}`;
}

export const SEND_PARENT_VERIFICATION_URL = getFunctionUrl("sendParentVerification");
export const REPORT_CONTENT_URL = getFunctionUrl("lcReportContent");
export const GET_MILESTONES_URL = getFunctionUrl("getMilestones");
export const UPDATE_MILESTONE_URL = getFunctionUrl("updateMilestone");
export const GET_TWILIO_ICE_SERVERS_URL = getFunctionUrl("getTwilioIceServers");
export const GET_PUBLIC_FEED_URL = getFunctionUrl("getPublicFeed");
export const GET_PUBLIC_DISCOVER_URL = getFunctionUrl("getPublicDiscover");
export const GET_ACTIVITY_FEED_URL = getFunctionUrl("getActivityFeed");
export const TOGGLE_POST_LIKE_URL = getFunctionUrl("togglePostLike");
export const CREATE_MARKETPLACE_PRODUCT_URL = getFunctionUrl("createMarketplaceProduct");
export const MATERIAL_INGESTION_URL = getFunctionUrl("materialIngestionHandler");
export const SEED_OURSPACE_URL = getFunctionUrl("seedOurSpace");
export const GET_SPONSORS_URL = getFunctionUrl("getSponsors");
export const TRACK_SPONSOR_CLICK_URL = getFunctionUrl("trackSponsorClick");
export const CREATE_SPONSOR_PLACEMENT_URL = getFunctionUrl("createSponsorPlacement");
export const SEND_SPONSOR_INQUIRY_URL = getFunctionUrl("sendSponsorInquiry");
