import type { Preview } from "@storybook/nextjs";
import localFont from "next/font/local";

import "../src/app/globals.css";

const pretendard = localFont({
  src: "../src/app/fonts/PretendardVariable.woff2",
  variable: "--font-pretendard-local",
  weight: "45 920",
  display: "swap",
});

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [
    (Story) => (
      <div className={`${pretendard.variable} w-[39rem] bg-white antialiased`}>
        <Story />
      </div>
    ),
  ],
};

export default preview;
