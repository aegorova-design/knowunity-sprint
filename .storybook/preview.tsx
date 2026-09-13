import type { Preview } from '@storybook/nextjs-vite'
import './preview.css'

// This project is mobile-only, dark-mode-only (see design-brief.md). "mobile"
// is the 390px canvas every screen is designed at; component stories default
// to it. Documentation pages ignore this and always render full width.
const MOBILE_VIEWPORT = 'mobile'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo'
    },

    viewport: {
      options: {
        [MOBILE_VIEWPORT]: {
          name: 'Mobile (390px)',
          styles: { width: '390px', height: '844px' },
          type: 'mobile',
        },
      },
    },
  },

  initialGlobals: {
    viewport: MOBILE_VIEWPORT,
  },
};

export default preview;