import { renderImage } from "@inglorious/renderer-2d/image/image.js"
import { v } from "@inglorious/utils/v.js"

export default {
  types: {
    Image: [{ render: renderImage }],
  },

  entities: {
    game: {
      type: "Game",
      devMode: true,
    },

    images: {
      type: "Images",
      images: {
        logo: { url: "/logo.png" },
      },
    },

    logo: {
      type: "Image",
      position: v(400 - 128 / 2, 0, 300 + 128 / 2),
      image: {
        id: "logo",
        imageSize: v(128, 128),
      },
    },
  },
}
