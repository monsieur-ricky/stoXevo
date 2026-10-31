import { TestBed } from '@angular/core/testing';
import { MessageService } from '@openng/optimus-ui/api';
import { NetworkStatusService } from './network-status.service';

describe('network status integration', () => {
  it('updates signals and notifications from real browser events and cleans up on destroy', () => {
    TestBed.configureTestingModule({ providers: [MessageService] });
    const notifications = vi.spyOn(TestBed.inject(MessageService), 'add');
    const service = TestBed.inject(NetworkStatusService);
    window.dispatchEvent(new Event('offline'));
    expect(service.isOnline()).toBe(false);
    expect(notifications).toHaveBeenLastCalledWith(
      expect.objectContaining({ severity: 'error' })
    );
    window.dispatchEvent(new Event('online'));
    expect(service.isOnline()).toBe(true);
    TestBed.resetTestingModule();
    window.dispatchEvent(new Event('offline'));
    expect(notifications).toHaveBeenCalledTimes(2);
  });
});
