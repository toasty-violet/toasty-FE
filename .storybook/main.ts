import type { StorybookConfig } from "@storybook/nextjs";

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: ["@storybook/addon-a11y", "@storybook/addon-docs"],
  framework: "@storybook/nextjs",
  staticDirs: ["../public"],
  // next.config.ts의 turbopack SVGR 규칙은 Storybook(webpack)에 적용되지 않아
  // 여기서 동일하게 svg를 React 컴포넌트로 변환한다.
  webpackFinal: async (config) => {
    const imageRule = config.module?.rules?.find((rule) => {
      if (typeof rule !== "object" || rule === null) return false;
      return rule.test instanceof RegExp && rule.test.test(".svg");
    });

    if (typeof imageRule === "object" && imageRule !== null) {
      imageRule.exclude = /\.svg$/;
    }

    config.module?.rules?.push({
      test: /\.svg$/,
      use: [
        {
          loader: "@svgr/webpack",
          options: {
            // next.config.ts 와 같은 이유로 viewBox 를 지우지 않는다.
            // 지우면 다른 크기로 쓸 때 축소가 아니라 크롭이 된다.
            svgoConfig: {
              plugins: [
                {
                  name: "preset-default",
                  params: { overrides: { removeViewBox: false } },
                },
              ],
            },
          },
        },
      ],
    });

    return config;
  },
};

export default config;
