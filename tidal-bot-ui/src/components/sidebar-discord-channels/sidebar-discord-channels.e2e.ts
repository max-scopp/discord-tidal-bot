import { newE2EPage } from '@stencil/core/testing';

describe('sidebar-discord-channels', () => {
  it('renders', async () => {
    const page = await newE2EPage();

    await page.setContent('<sidebar-discord-channels></sidebar-discord-channels>');
    const element = await page.find('sidebar-discord-channels');
    expect(element).toHaveClass('hydrated');
  });{cursor}
});
