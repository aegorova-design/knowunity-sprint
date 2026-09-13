import { addons } from 'storybook/manager-api'
import { themes } from 'storybook/theming'

// The product is dark-mode-only (see design-brief.md) — match the
// Storybook chrome (sidebar, toolbar) to that, not just the canvas.
addons.setConfig({
  theme: themes.dark,
})
