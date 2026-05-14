export const entities = {
  logoForm: {
    type: "LogoForm",
    initialValues: {
      size: 256,
      rotation: [-45, -40], // eslint-disable-line no-magic-numbers
      skew: 12,
      isInteractive: false,
      faces: [
        { image: "I", reverse: false, eye: true },
        { image: "C", reverse: false, eye: false },
      ],
    },
  },
  liveLogo: {
    type: "LiveLogo",
    size: 256,
    rotation: [-45, -40], // eslint-disable-line no-magic-numbers
    skew: 12,
    faces: [
      { image: "I", reverse: false, eye: true },
      { image: "C", reverse: false, eye: false },
    ],
    isInteractive: false,
    isScrollPrevented: true,
  },
}
