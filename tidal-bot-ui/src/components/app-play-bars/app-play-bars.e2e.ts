import { newE2EPage } from '@stencil/core/testing';

describe('app-play-bars', () => {
  it('renders', async () => {
    const page = await newE2EPage();

    await page.setContent('<app-play-bars></app-play-bars>');
    const element = await page.find('app-play-bars');
    expect(element).toHaveClass('hydrated');
  });{cursor}
});
