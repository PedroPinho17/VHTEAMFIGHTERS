import { publicGet } from "@/lib/api";
import { mediaUrl } from "@/lib/utils";

type HomeBranding = {
  logoKey?: string | null;
  faviconKey?: string | null;
};

export async function getBranding() {
  try {
    const home = await publicGet<HomeBranding>("/api/public/home", 30);
    return {
      logoUrl: mediaUrl(home.logoKey),
      faviconUrl: mediaUrl(home.faviconKey),
    };
  } catch {
    return { logoUrl: null, faviconUrl: null };
  }
}
