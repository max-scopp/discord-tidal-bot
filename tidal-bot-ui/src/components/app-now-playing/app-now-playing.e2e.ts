import { newE2EPage } from '@stencil/core/testing';

describe('app-now-playing', () => {
  it('renders', async () => {
    const page = await newE2EPage();

    await page.setContent('<app-now-playing></app-now-playing>');
    const element = await page.find('app-now-playing');
    expect(element).toHaveClass('hydrated');
  });{cursor}
});
