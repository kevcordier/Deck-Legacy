/** Markdown files are inlined as raw strings by `babel-plugin-inline-import` (see babel.config.js). */
declare module '*.md' {
  const content: string;
  export default content;
}
