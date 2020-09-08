import { newE2EPage } from '@stencil/core/testing';

describe('sidebar-tidal-playlists', () => {
  it('renders', async () => {
    const page = await newE2EPage();

    await page.setContent('<sidebar-tidal-playlists></sidebar-tidal-playlists>');
    const element = await page.find('sidebar-tidal-playlists');
    expect(element).toHaveClass('hydrated');
  });{cursor}
});
