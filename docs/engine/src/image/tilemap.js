import { renderTilemap } from "@inglorious/renderer-2d/image/tilemap.js"
import { v } from "@inglorious/utils/v.js"

export default {
  types: {
    tilemap: [{ render: renderTilemap }],
  },

  entities: {
    game: {
      type: "game",
      devMode: true,
      pixelated: true,
    },

    images: {
      type: "images",
      images: {
        dungeon: { url: "/tilemaps/dungeon.png" },
      },
    },

    dungeon: {
      type: "tilemap",
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
              // first row
              0, 1, 2, 3, 4, 5,
              // second row
              10, 11, 12, 13, 14, 15,
              // third row
              20, 21, 22, 23, 24, 25,
              // fourth row
              30, 31, 32, 33, 34, 35,
              // fifth row
              40, 41, 42, 43, 44, 45,
            ],
          },
          {
            tiles: [
              // first row
              -1, -1, -1, -1, -1, -1,
              // second row
              -1, -1, 83, -1, -1, -1,
              // third row
              -1, -1, -1, 97, -1, -1,
              // fourth row
              -1, -1, -1, -1, -1, -1,
              // fifth row
              -1, -1, 66, 67, -1, -1,
            ],
          },
          {
            tiles: [
              // first row
              -1,
              -1,
              -1,
              -1,
              -1,
              -1,
              // second row
              -1,
              91,
              -1,
              -1,
              0x80000000 + 91,
              -1,
              // third row
              -1,
              -1,
              -1,
              -1,
              -1,
              -1,
              // fourth row
              -1,
              91,
              -1,
              -1,
              0x80000000 + 91,
              -1,
              // fifht row
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
