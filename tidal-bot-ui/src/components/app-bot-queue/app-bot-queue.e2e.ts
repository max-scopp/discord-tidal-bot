import { newE2EPage } from '@stencil/core/testing';

describe('app-bot-queue', () => {
  it('renders', async () => {
    const page = await newE2EPage();

    await page.setContent('<app-bot-queue></app-bot-queue>');
    const element = await page.find('app-bot-queue');
    expect(element).toHaveClass('hydrated');
  });{cursor}
});
