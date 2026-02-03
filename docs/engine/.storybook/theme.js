import { create } from "storybook/theming/create"

export default create({
  base: "dark",

  fontBase: "'Roboto', 'Ubuntu', sans-serif",
  fontCode: "'Fira Code', monospace",

  brandTitle: "Inglorious Engine",
  brandUrl: "/",
  brandImage: "/logo.png",
  brandTarget: "_self",

  // colorPrimary: '#98c379',
  // colorSecondary: '#429aef',

  // appBg:
  //   'url(https://ingloriouscoderz.it/_next/static/images/metal-wallpaper-236d3ad5bb71ea311f853ebb07099f75.jpg)',
  // appContentBg: '#000',
  // appBorderColor: '#429aef',
  appBorderRadius: 0,

  textColor: "#bbb",
  textInverseColor: "#98c379",

  // barTextColor: '#9E9E9E',
  // barSelectedColor: '#585C6D',
  // barBg: '#ffffff',

  // inputBg: '#ffffff',
  // inputBorder: '#10162F',
  // inputTextColor: '#10162F',
  // inputBorderRadius: 2,
})
