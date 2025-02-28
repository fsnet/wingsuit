import 'protons';
import MDX from './svg.mdx';

const template = require('../../docs.twig');

export default {
  path: '/assets/svg',
  template,
  MDX,
  vars: {
    meta_title: 'SVGs',
    meta_description: 'Render SVGs as icons or images.',
    next: [
      {
        title: 'Images & Icons',
        text: 'Learn how to use images and icons in your patterns.',
        link_title: 'continue',
        href: '/assets/images',
      },
      {
        title: 'Javascript',
        text: 'Learn how to use javascript in your patterns.',
        link_title: 'continue',
        href: '/assets/javascript',
      },
    ],
  },
};
