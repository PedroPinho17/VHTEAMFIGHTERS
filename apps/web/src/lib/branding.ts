import { publicGet } from "@/lib/api";
import { mediaUrl } from "@/lib/utils";

type HomeBranding = {
  logoKey?: string | null;
  faviconKey?: string | null;
};

const FALLBACK_LOGO = "/logo.png";

export async function getBranding() {
  try {
    const home = await publicGet<HomeBranding>("/api/public/home", 30);
    return {
      logoUrl: mediaUrl(home.logoKey) || FALLBACK_LOGO,
      // Prefer local logo for tab icon — CMS/S3 favicons often 404 in local/dev
      // and break the browser tab icon entirely.
      faviconUrl: mediaUrl(home.faviconKey) || FALLBACK_LOGO,
      hasCmsLogo: Boolean(home.logoKey),
      hasCmsFavicon: Boolean(home.faviconKey),
    };
  } catch {
    return {
      logoUrl: FALLBACK_LOGO,
      faviconUrl: FALLBACK_LOGO,
      hasCmsLogo: false,
      hasCmsFavicon: false,
    };
  }
}
