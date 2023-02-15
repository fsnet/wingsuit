import '../../index';
import MDX from './index.mdx';

const template = require('../../docs.twig');
const html = require('../../html.twig');

export default {
  vars: {
    meta_title: 'Twig only',
    meta_description: 'Twig only component works without any wingsuit YAML file',
  },
  path: '/components/twig',
  template,
  html,
  MDX,
};
