/* eslint-disable no-unused-expressions */
/* eslint-disable jest/valid-expect */
type StorybookApps = 'official-wingsuit';

type Addons = 'Actions' | 'Knobs';

const getUrl = (route: string) => {
  const host = Cypress.env('location') || 'http://localhost:4000';
  return `${host}/${route}`;
};

export const visit = (route = '') => {
  return cy
    .on('uncaught:exception', (err, runnable) => {
      //expect(err.message).to.include('Failed to execute')
      return false
    }).clearLocalStorage()
    .visit(getUrl(route))
    .get(`#storybook-preview-iframe`)
    .then({ timeout: 30000 }, (iframe) => {
      return cy.wrap(iframe, { timeout: 30000 }).should(() => {
        const content: Document | null = (iframe[0] as HTMLIFrameElement).contentDocument;
        const element: HTMLElement | null = content !== null ? content.documentElement : null;

        expect(element).not.null;

        if (element !== null) {
          expect(element.querySelector('.wingsuit-body')).not.null;
        }
      });
    });
};

export const clickAddon = (addonName: Addons) => {
  return cy.get(`[role=tablist] button[role=tab]`).contains(addonName).click();
};

export const getStorybookPreview = () => {
  return cy.get(`#storybook-preview-iframe`).then({ timeout: 10000 }, (iframe) => {
    const content: Document | null = (iframe[0] as HTMLIFrameElement).contentDocument;
    const element: HTMLElement | null = content !== null ? content.documentElement : null;

    return cy
      .wrap(iframe)
      .should(() => {
        expect(element).not.null;

        if (element !== null) {
          expect(element.querySelector('.wingsuit-body')).not.null;
        }
      })
      .then(() => {
        return cy.wrap(element).get('.wingsuit-body');
      });
  });
};
