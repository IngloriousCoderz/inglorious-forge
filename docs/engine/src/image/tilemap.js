import { flippedHorizontally } from "@inglorious/renderer-2d/image/flags.js"
import { renderTilemap } from "@inglorious/renderer-2d/image/tilemap.js"
import { v } from "@inglorious/utils/v.js"

export default {
  types: {
    Tilemap: [{ render: renderTilemap }],
  },

  entities: {
    game: {
      type: "Game",
      devMode: true,
      pixelated: true,
    },

    images: {
      type: "Images",
      images: {
        dungeon: { url: "/tilemaps/dungeon.png" },
      },
    },

    dungeon: {
      type: "Tilemap",
      position: v(400, 0, 300),
      tilemap: {
        image: {
          id: "dungeon",
          imageSize: v(160, 160),
          tileSize: v(16, 16),
        },
        columns: 6,
        scale: 3,
        layers: [
          {
            tiles: [
              0, 1, 2, 3, 4, 5, 10, 11, 12, 13, 14, 15, 20, 21, 22, 23, 24, 25,
              30, 31, 32, 33, 34, 35, 40, 41, 42, 43, 44, 45,
            ],
          },
          {
            tiles: [
              -1, -1, -1, -1, -1, -1, -1, -1, 83, -1, -1, -1, -1, -1, -1, 97,
              -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 66, 67, -1, -1,
            ],
          },
          {
            tiles: [
              -1,
              -1,
              -1,
              -1,
              -1,
              -1,
              -1,
              91,
              -1,
              -1,
              flippedHorizontally(91),
              -1,
              -1,
              -1,
              -1,
              -1,
              -1,
              -1,
              -1,
              91,
              -1,
              -1,
              flippedHorizontally(91),
              -1,
              -1,
              -1,
              -1,
              -1,
              -1,
              -1,
            ],
          },
        ],
      },
    },
  },
}
