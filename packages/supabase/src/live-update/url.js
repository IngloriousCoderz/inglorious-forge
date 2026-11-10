export const DEFAULT_BUCKET = "live-updates"

/**
 * Where `publishLiveUpdate` from `@inglorious/supabase/live-update` puts the
 * manifest, for `watchLiveUpdate` from `@inglorious/web/live-update`.
 *
 * @param {string} projectUrl
 * @param {{ bucket?: string }} [options]
 */
export function liveUpdateManifestUrl(
  projectUrl,
  { bucket = DEFAULT_BUCKET } = {},
) {
  return `${projectUrl}/storage/v1/object/public/${bucket}/manifest.json`
}
