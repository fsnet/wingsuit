import '../../index';
import MDX from './index.mdx';

const template = require('../../docs.twig');
const html = require('../../html.twig');

export default {
  path: '/presets/compression',
  template,
  html,
  MDX,
  vars: {
    meta_title: 'Compression preset',
    meta_description:
      'The official Wingsuit compression preset adds support for gzip and brotli compression',
    next: [
      {
        title: 'Imagemin Preset',
        text: 'Optimize your images and create webp variants of them on the fly.',
        link_title: 'continue',
        href: '/presets/imagemin',
      },
      {
        title: 'PWA Preset',
        text: 'Let wingsuit generate all your favicons and a manifest.json for pwa enhancements for you.',
        link_title: 'continue',
        href: '/presets/pwa',
      },
    ],
  },
};
