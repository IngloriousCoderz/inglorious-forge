import { Dialog } from "@inglorious/ui/dialog"
import { Grid } from "@inglorious/ui/grid"
import { Typography } from "@inglorious/ui/typography"
import { html } from "@inglorious/web"
import { when } from "@inglorious/web/directives/when"
import { defineComponent } from "@openuidev/lang-core"
import { z } from "zod"

/** No image of a gallery is open in its preview. */
const NO_PREVIEW = -1

export const Image = defineComponent({
  name: "Image",
  description: "An image with alt text and an optional URL",
  props: z.object({ alt: z.string(), src: z.string().optional() }),
  component: ({ props }) =>
    when(
      props.src,
      () =>
        html`<img
          src=${props.src}
          alt=${props.alt}
          loading="lazy"
          style="max-inline-size: 100%; block-size: auto;"
        />`,
    ),
})

export const ImageBlock = defineComponent({
  name: "ImageBlock",
  description: "An image as wide as its container, such as a cover or a photo",
  props: z.object({ src: z.string(), alt: z.string().optional() }),
  component: ({ props }) =>
    html`<img
      src=${props.src}
      alt=${props.alt ?? ""}
      loading="lazy"
      style="display: block; inline-size: 100%; block-size: auto; border-radius: var(--iw-radius-md);"
    />`,
})

export const ImageGallery = defineComponent({
  name: "ImageGallery",
  description:
    "A grid of images, each opening larger with its details when pressed: ImageGallery([{src, alt, details}])",
  props: z.object({
    images: z.array(
      z.object({
        src: z.string(),
        alt: z.string().optional(),
        details: z.string().optional(),
      }),
    ),
  }),
  component: ({ props, viewState, statementId }) => {
    const images = (props.images ?? []).filter((image) => image?.src)
    const preview = viewState(`${statementId ?? "gallery"}:preview`, NO_PREVIEW)
    const open = images[preview.value]

    return html`${Grid.render({
      minColumnWidth: "8rem",
      gap: "sm",
      children: images.map(
        (image, index) =>
          html`<figure style="margin: 0;">
            <button
              type="button"
              aria-label=${`Open ${image.alt || "image"}`}
              style="display: block; inline-size: 100%; padding: 0; border: 0; background: none; cursor: zoom-in;"
              @click=${() => preview.setValue(index)}
            >
              <img
                src=${image.src}
                alt=${image.alt ?? ""}
                loading="lazy"
                style="display: block; inline-size: 100%; aspect-ratio: 1; object-fit: cover; border-radius: var(--iw-radius-sm);"
              />
            </button>
          </figure>`,
      ),
    })}
    ${Dialog.render({
      isOpen: Boolean(open),
      title: open?.alt ?? "",
      size: "lg",
      onClose: () => preview.setValue(NO_PREVIEW),
      children: when(
        open,
        () =>
          html`<img
              src=${open.src}
              alt=${open.alt ?? ""}
              style="display: block; inline-size: 100%; block-size: auto;"
            />
            ${when(open.details, () =>
              Typography.render({ children: open.details }),
            )}`,
      ),
    })}`
  },
})
