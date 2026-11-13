import { Button } from "@inglorious/ui/button"
import { Container } from "@inglorious/ui/container"
import { Typography } from "@inglorious/ui/typography"
import { html } from "@inglorious/web"
import { haptics } from "@inglorious/web/native/haptics"

const GROUPS = [
  {
    title: "Selection",
    buttons: [{ label: "Selection", play: () => haptics.selection() }],
  },
  {
    title: "Impact",
    buttons: ["light", "medium", "heavy"].map((style) => ({
      label: style,
      play: () => haptics.impact(style),
    })),
  },
  {
    title: "Notification",
    buttons: ["success", "warning", "error"].map((type) => ({
      label: type,
      play: () => haptics.notification(type),
    })),
  },
]

export const HapticsPage = {
  played(entity, { label, hasPlayed }) {
    entity.last = { label, hasPlayed }
  },

  render(entity, api) {
    return Container.render({
      maxWidth: "md",
      padding: "lg",
      children: html`
        ${Typography.render({
          variant: "body",
          hasGutterBottom: true,
          children:
            "Browsers vibrate on Android only: iOS browsers stay silent. The native app plays the system's haptics on both.",
        })}
        ${GROUPS.map(
          (group) => html`
            <section class="group">
              ${Typography.render({ variant: "h3", children: group.title })}
              <div class="buttons">
                ${group.buttons.map((button) =>
                  Button.render({
                    variant: "outline",
                    onClick: () =>
                      api.notify("#haptics:played", {
                        label: button.label,
                        hasPlayed: button.play(),
                      }),
                    children: button.label,
                  }),
                )}
              </div>
            </section>
          `,
        )}
        <dl class="diagnostics">
          <dt>Vibration API</dt>
          <dd>${"vibrate" in navigator ? "available" : "missing"}</dd>
          <dt>Secure context</dt>
          <dd>${window.isSecureContext ? "yes" : "no"}</dd>
          <dt>Last tap</dt>
          <dd>
            ${
              entity.last
                ? `${entity.last.label}: ${entity.last.hasPlayed ? "played" : "refused"}`
                : "none yet"
            }
          </dd>
        </dl>
      `,
    })
  },
}
