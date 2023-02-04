import '../../index';
import MDX from './index.mdx';

const template = require('../../docs.twig');
const html = require('../../html.twig');

export default {
  path: '/guides/twing-extensions-guide',
  template,
  html,
  MDX,
  vars: {
    meta_title: 'Twing extensions',
    meta_description: 'Add twing extensions.',

    next: [
      {
        title: 'Configure your app?',
        text: 'Check the parameters under the "App details" section and extend your wingsuit.config.js',
        link_title: 'Details',
        href: '/configurations/details',
      },
    ],
  },
};
