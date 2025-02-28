/* eslint-disable jest/no-standalone-expect, no-unused-expressions, jest/valid-expect */
// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

const logger = console;
Cypress.Commands.add(
  'console',
  {
    prevSubject: true,
  },
  (subject, method = 'log') => {
    logger[method]('The subject is', subject);
    return subject;
  }
);

Cypress.Commands.add('getStoryElement', {}, () => {
  return cy.get(`#storybook-preview-iframe`).then({ timeout: 20000 }, (iframe) => {
    const content = iframe[0].contentDocument;
    const element = content !== null ? content.documentElement : null;

    return cy
      .get(iframe, { timeout: 20000 })
      .should(() => {
        expect(element).not.null;
        expect(element.querySelector('.wingsuit-body')).not.null;
      })
      .then(() => {
        return element.querySelector('.wingsuit-body');
      });
  });
});
