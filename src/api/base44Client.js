import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';

const { appId, token, functionsVersion, appBaseUrl } = appParams;
const isGitHubPagesPreview = typeof window !== 'undefined' && window.location.hostname.endsWith('github.io');

// Create a client with authentication required outside the GitHub Pages preview.
export const base44 = createClient({
  appId,
  token,
  functionsVersion,
  serverUrl: '',
  requiresAuth: !isGitHubPagesPreview,
  appBaseUrl
});
