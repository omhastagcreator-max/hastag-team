import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import WorkRoom from './WorkRoom';

// Mock the Auth Context so we can control the profile info
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    profile: { name: 'Test Agency Employee' }
  })
}));

describe('WorkRoom JaaS Implementation', () => {
  let mockJitsiApi: any;
  let appendChildSpy: any;
  let removeChildSpy: any;

  beforeEach(() => {
    // Reset global window object
    (window as any).JitsiMeetExternalAPI = undefined;

    // Create a mock for the Jitsi API constructor and its methods
    mockJitsiApi = {
      dispose: vi.fn(),
    };

    // Override the constructor natively on the window
    (window as any).JitsiMeetExternalAPI = vi.fn().mockImplementation(() => mockJitsiApi);

    // Spy on DOM mutations to track script injection
    appendChildSpy = vi.spyOn(document.body, 'appendChild');
    removeChildSpy = vi.spyOn(document.body, 'removeChild');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const renderWithRouter = () => {
    return render(
      <BrowserRouter>
        <WorkRoom />
      </BrowserRouter>
    );
  };

  it('should render the work room UI and loading state initially', () => {
    renderWithRouter();
    
    expect(screen.getByText('Work Room')).toBeInTheDocument();
    expect(screen.getByText('Initializing JaaS Secure Room...')).toBeInTheDocument();
  });

  it('should dynamically inject the 8x8 JaaS external_api.js script', () => {
    renderWithRouter();

    // Verify script was created and appended
    const scriptCalls = appendChildSpy.mock.calls;
    const injectedScript = scriptCalls.find((call: any) => call[0].tagName === 'SCRIPT')[0];
    
    expect(injectedScript).toBeDefined();
    expect(injectedScript.src).toContain('https://8x8.vc/vpaas-magic-cookie-ea738a18dfd84cb5a3ac1925aa61ea3b/external_api.js');
    expect(injectedScript.async).toBe(true);
  });

  it('should initialize JitsiMeetExternalAPI with correctly mapped magic cookie and profile name upon script load', async () => {
    renderWithRouter();

    const scriptCalls = appendChildSpy.mock.calls;
    const injectedScript = scriptCalls.find((call: any) => call[0].tagName === 'SCRIPT')[0];

    // Simulate the script finishing downloading
    injectedScript.onload();

    // Verify the constructor was called with the exact JaaS parameters
    expect((window as any).JitsiMeetExternalAPI).toHaveBeenCalledTimes(1);
    
    const [domain, options] = ((window as any).JitsiMeetExternalAPI as ReturnType<typeof vi.fn>).mock.calls[0];
    
    expect(domain).toBe('8x8.vc');
    expect(options.roomName).toBe('vpaas-magic-cookie-ea738a18dfd84cb5a3ac1925aa61ea3b/SampleAppCertainLungsFailConsiderably');
    expect(options.userInfo.displayName).toBe('Test Agency Employee');
    expect(options.configOverwrite.startWithAudioMuted).toBe(true);
  });

  it('should elegantly dispose the Jitsi WebRTC connection and remove script on unmount to prevent leaks', () => {
    const { unmount } = renderWithRouter();

    const scriptCalls = appendChildSpy.mock.calls;
    const injectedScript = scriptCalls.find((call: any) => call[0].tagName === 'SCRIPT')[0];

    // Load the API
    injectedScript.onload();

    // Unmount the component (Simulates user clicking "Dashboard" or closing tab)
    unmount();

    // Verify deep cleanup
    expect(mockJitsiApi.dispose).toHaveBeenCalledTimes(1);
    expect(removeChildSpy).toHaveBeenCalledWith(injectedScript);
  });
});
