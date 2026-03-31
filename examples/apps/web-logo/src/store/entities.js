export const entities = {
  logoForm: {
    type: "LogoForm",
    initialValues: {
      size: 256,
      isInteractive: false,
      faces: [
        { image: "I", reverse: false, eye: true },
        { image: "F", reverse: false, eye: false },
      ],
    },
  },
  liveLogo: {
    type: "LiveLogo",
    size: 256,
    faces: [
      { image: "I", reverse: false, eye: true },
      { image: "F", reverse: false, eye: false },
    ],
    isInteractive: false,
    isScrollPrevented: true,
  },
}
