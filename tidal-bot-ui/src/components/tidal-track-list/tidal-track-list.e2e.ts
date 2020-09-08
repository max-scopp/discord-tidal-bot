import { newE2EPage } from '@stencil/core/testing';

describe('tidal-track-list', () => {
  it('renders', async () => {
    const page = await newE2EPage();

    await page.setContent('<tidal-track-list></tidal-track-list>');
    const element = await page.find('tidal-track-list');
    expect(element).toHaveClass('hydrated');
  });{cursor}
});
