module.exports = {
  root: true,
  extends: ["next", "next/core-web-vitals", "prettier"],
  parserOptions: {
    project: true
  },
  rules: {
    "@next/next/no-img-element": "off",
    "react/jsx-key": ["error", { checkFragmentShorthand: true }],
    "no-restricted-syntax": [
      "error",
      {
        selector: "CallExpression[callee.name='fetch'][arguments.length<1]",
        message: "fetch requires a URL"
      }
    ]
  }
};
