import 'protons';
import MDX from './index.mdx';

const template = require('../../docs.twig');

export default {
  path: '/apps/cms',
  template,
  MDX,
  vars: {
    meta_title: 'Wingsuit CMS APP',
    meta_description: 'Wingsuit APP for all TWIG based CMS.',
    next: [
      {
        title: 'UI Patterns',
        text: 'Learn how wingsuit leverages UI patterns.',
        link_title: 'continue',
        href: '/components/wingsuit',
      },
      {
        title: 'Components',
        text: 'Learn about creating and editing components.',
        link_title: 'continue',
        href: '/components/overview',
      },
    ],
  },
};
