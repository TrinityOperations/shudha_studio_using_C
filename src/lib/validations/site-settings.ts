import { z } from "zod";

import { themes } from "@/lib/theme";

export const siteSettingsThemeSchema = z.object({
  active_theme: z.enum(themes),
});
