import { newE2EPage } from '@stencil/core/testing';

describe('app-tidal-list', () => {
  it('renders', async () => {
    const page = await newE2EPage();

    await page.setContent('<app-tidal-list></app-tidal-list>');
    const element = await page.find('app-tidal-list');
    expect(element).toHaveClass('hydrated');
  });{cursor}
});
