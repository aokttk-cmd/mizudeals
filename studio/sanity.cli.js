import { defineCliConfig } from 'sanity/cli';
import { projectId, dataset } from './env.js';

export default defineCliConfig({
  api: { projectId, dataset },
  // Studio is published at https://mizudeals.sanity.studio
  studioHost: 'mizudeals',
  deployment: { appId: 'usbavdxmyzixyujodl1j7xc9' },
});
