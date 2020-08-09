import { newE2EPage } from '@stencil/core/testing';

describe('app-tidal-list-overview', () => {
  it('renders', async () => {
    const page = await newE2EPage();

    await page.setContent('<app-tidal-list-overview></app-tidal-list-overview>');
    const element = await page.find('app-tidal-list-overview');
    expect(element).toHaveClass('hydrated');
  });{cursor}
});
