import { newE2EPage } from '@stencil/core/testing';

describe('app-tidal-login', () => {
  it('renders', async () => {
    const page = await newE2EPage();

    await page.setContent('<app-tidal-login></app-tidal-login>');
    const element = await page.find('app-tidal-login');
    expect(element).toHaveClass('hydrated');
  });{cursor}
});
